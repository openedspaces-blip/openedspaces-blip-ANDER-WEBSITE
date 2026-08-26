// PayPal checkout for Premium subscriptions.
// merchant-of-record provider; this service is enabled only when all PayPal
// credentials and plan IDs are configured.
const config = require('./config');
const subscriptionService = require('./subscriptionService');
const { getSupabaseAdmin } = require('./supabaseClient');

const PAYPAL_API = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  production: 'https://api-m.paypal.com'
};

function missingConfiguration() {
  const paypal = config.paypal;
  return [
    !paypal.clientId && 'PAYPAL_CLIENT_ID',
    !paypal.clientSecret && 'PAYPAL_CLIENT_SECRET',
    !paypal.webhookId && 'PAYPAL_WEBHOOK_ID',
    !paypal.monthlyPlanId && 'PAYPAL_MONTHLY_PLAN_ID',
    !paypal.quarterlyPlanId && 'PAYPAL_QUARTERLY_PLAN_ID'
  ].filter(Boolean);
}

function isConfigured() {
  return missingConfiguration().length === 0;
}

function configurationError() {
  const error = new Error('PayPal checkout configuration is incomplete.');
  error.status = 503;
  error.code = 'PAYPAL_CONFIGURATION_MISSING';
  error.missingVariables = missingConfiguration();
  return error;
}

function planIdForCycle(billingCycle) {
  if (billingCycle === 'monthly') return config.paypal.monthlyPlanId || null;
  if (billingCycle === 'quarterly') return config.paypal.quarterlyPlanId || null;
  return null;
}

function getPublicConfig() {
  const missing = missingConfiguration();
  return {
    provider: 'paypal',
    configured: missing.length === 0,
    environment: config.paypal.environment,
    clientId: config.paypal.clientId || null,
    plans: {
      monthly: config.paypal.monthlyPlanId || null,
      quarterly: config.paypal.quarterlyPlanId || null
    },
    missingConfiguration: missing
  };
}

async function getAccessToken() {
  if (!isConfigured()) throw configurationError();
  const credentials = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString('base64');
  const response = await fetch(`${PAYPAL_API[config.paypal.environment]}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    const error = new Error('PayPal could not authenticate the merchant account.');
    error.status = 502;
    error.internalMessage = payload.error_description || payload.error || String(response.status);
    throw error;
  }
  return payload.access_token;
}

async function getSubscription(subscriptionId) {
  const token = await getAccessToken();
  const response = await fetch(
    `${PAYPAL_API[config.paypal.environment]}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.id) {
    const error = new Error('PayPal could not verify this subscription.');
    error.status = 400;
    error.internalMessage = payload.message || payload.name || String(response.status);
    throw error;
  }
  return payload;
}

async function createCheckout({ userId, billingCycle }) {
  if (!isConfigured()) throw configurationError();
  const planId = planIdForCycle(billingCycle);
  if (!planId) {
    const error = new Error('Selecciona un ciclo de facturación válido.');
    error.status = 400;
    throw error;
  }

  const token = await getAccessToken();
  const publicBaseUrl = config.azul.publicBaseUrl;
  const response = await fetch(`${PAYPAL_API[config.paypal.environment]}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: userId,
      application_context: {
        brand_name: 'ANDERGO',
        locale: 'es-DO',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${publicBaseUrl}/?payment=approved&provider=paypal`,
        cancel_url: `${publicBaseUrl}/?payment=cancelled&provider=paypal`
      }
    })
  });
  const payload = await response.json().catch(() => ({}));
  const approvalUrl = payload.links?.find((link) => link.rel === 'approve')?.href;
  if (!response.ok || !payload.id || !approvalUrl) {
    const error = new Error('No se pudo preparar el pago seguro con PayPal.');
    error.status = 502;
    error.internalMessage = payload.message || payload.name || String(response.status);
    throw error;
  }
  return { subscriptionId: payload.id, approvalUrl };
}

function normalizeStatus(status) {
  const value = String(status || '').toUpperCase();
  if (value === 'ACTIVE') return 'active';
  if (value === 'SUSPENDED') return 'paused';
  if (value === 'CANCELLED') return 'canceled';
  if (value === 'EXPIRED') return 'expired';
  if (value === 'APPROVAL_PENDING' || value === 'APPROVED') return 'inactive';
  return 'past_due';
}

function billingCycleForPlan(planId) {
  if (planId === config.paypal.monthlyPlanId) return 'monthly';
  if (planId === config.paypal.quarterlyPlanId) return 'quarterly';
  return null;
}

async function syncVerifiedSubscription({ userId, subscriptionId }) {
  const subscription = await getSubscription(subscriptionId);
  const billingCycle = billingCycleForPlan(subscription.plan_id);
  if (!billingCycle || subscription.custom_id !== userId) {
    const error = new Error('La suscripción de PayPal no corresponde a esta cuenta ni a un plan Premium válido.');
    error.status = 400;
    throw error;
  }
  const status = normalizeStatus(subscription.status);
  const nextBillingTime = subscription.billing_info?.next_billing_time || null;
  const subscriberId = subscription.subscriber?.payer_id || subscription.subscriber?.email_address || null;
  await subscriptionService.syncProviderSubscription({
    userId,
    provider: 'paypal',
    providerCustomerId: subscriberId,
    providerSubscriptionId: subscription.id,
    billingCycle,
    status,
    expiresAt: nextBillingTime
  });
  return { status, billingCycle };
}

async function verifyWebhook(req) {
  if (!isConfigured()) throw configurationError();
  const token = await getAccessToken();
  const headers = req.headers || {};
  const response = await fetch(`${PAYPAL_API[config.paypal.environment]}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: config.paypal.webhookId,
      webhook_event: req.body
    })
  });
  const payload = await response.json().catch(() => ({}));
  return response.ok && payload.verification_status === 'SUCCESS';
}

// The event ID is only durable proof of "already handled" once the webhook
// signature has been verified, so this must be called after verifyWebhook.
async function webhookWasProcessed(eventId) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');
  const { data, error } = await admin
    .from('paypal_webhook_events')
    .select('id')
    .eq('paypal_event_id', eventId)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer el estado del webhook de PayPal: ${error.message}`);
  return Boolean(data);
}

async function recordWebhookEvent({ eventId, eventType, occurredAt }) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');
  const { error } = await admin.from('paypal_webhook_events').insert({
    paypal_event_id: eventId,
    event_type: eventType,
    occurred_at: occurredAt || null
  });
  // 23505 = unique_violation: a concurrent retry already recorded this event.
  if (!error || error.code === '23505') return;
  throw new Error(`No se pudo registrar el webhook de PayPal: ${error.message}`);
}

async function handleWebhook(req) {
  if (!(await verifyWebhook(req))) {
    const error = new Error('Invalid PayPal webhook signature.');
    error.status = 400;
    throw error;
  }
  const eventId = req.body?.id;
  const eventType = req.body?.event_type || 'UNKNOWN';
  if (!eventId) return { ignored: true, reason: 'missing_event_id' };
  if (await webhookWasProcessed(eventId)) return { duplicate: true };

  const resource = req.body?.resource || {};
  const subscriptionId = resource.id || resource.billing_agreement_id;
  const userId = resource.custom_id;
  if (!subscriptionId || !userId) {
    await recordWebhookEvent({ eventId, eventType, occurredAt: req.body?.create_time });
    return { ignored: true };
  }
  await syncVerifiedSubscription({ userId, subscriptionId });
  await recordWebhookEvent({ eventId, eventType, occurredAt: req.body?.create_time });
  return { processed: true };
}

module.exports = {
  getPublicConfig,
  planIdForCycle,
  isConfigured,
  createCheckout,
  syncVerifiedSubscription,
  handleWebhook
};
