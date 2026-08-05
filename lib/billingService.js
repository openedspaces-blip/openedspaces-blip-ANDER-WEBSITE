// Paddle checkout configuration and verified webhook processing.
// Browser checkout events are presentation-only: Premium is granted only
// after Paddle's SDK verifies the raw webhook body server-side.
const { Environment, Paddle } = require('@paddle/paddle-node-sdk');
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const subscriptionService = require('./subscriptionService');
const { getPublicTiers } = require('./paddleTiers');

const SUPPORTED_EVENTS = new Set([
  'transaction.completed',
  'subscription.created',
  'subscription.activated',
  'subscription.updated',
  'subscription.paused',
  'subscription.resumed',
  'subscription.canceled'
]);

let paddleClient = null;

const PUBLIC_CHECKOUT_VARIABLES = Object.freeze({
  NEXT_PUBLIC_PADDLE_ENV: () => config.paddle.environmentConfigured,
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: () => Boolean(config.paddle.clientSideToken),
  NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID: () => Boolean(config.paddle.monthlyPriceId),
  NEXT_PUBLIC_PADDLE_QUARTERLY_PRICE_ID: () => Boolean(config.paddle.quarterlyPriceId)
});

const SERVER_CHECKOUT_VARIABLES = Object.freeze({
  PADDLE_API_KEY: () => Boolean(config.paddle.apiKey),
  PADDLE_WEBHOOK_SECRET: () => Boolean(config.paddle.webhookSecret)
});

function missingVariables(variableChecks) {
  return Object.entries(variableChecks)
    .filter(([, isPresent]) => !isPresent())
    .map(([name]) => name);
}

function missingPublicCheckoutVariables() {
  return missingVariables(PUBLIC_CHECKOUT_VARIABLES);
}

function missingServerCheckoutVariables() {
  return missingVariables(SERVER_CHECKOUT_VARIABLES);
}

function reportMissingConfiguration(context, missing) {
  if (!missing.length) return;
  console.error(`[paddle-config] ${context} missing variables: ${missing.join(', ')}`);
}

function configurationError(missing) {
  const error = new Error('Paddle checkout configuration is incomplete.');
  error.status = 503;
  error.code = 'PADDLE_CONFIGURATION_MISSING';
  error.missingVariables = missing;
  return error;
}

function getPaddleClient() {
  if (!config.paddle.environmentConfigured || !config.paddle.environment) {
    throw configurationError(['NEXT_PUBLIC_PADDLE_ENV']);
  }
  if (!config.paddle.apiKey) {
    throw configurationError(['PADDLE_API_KEY']);
  }
  if (!paddleClient) {
    paddleClient = new Paddle(config.paddle.apiKey, {
      environment:
        config.paddle.environment === 'production'
          ? Environment.production
          : Environment.sandbox
    });
  }
  return paddleClient;
}

function checkoutConfigured() {
  return missingPublicCheckoutVariables().length === 0;
}

function webhookConfigured() {
  return missingServerCheckoutVariables().length === 0;
}

function normalizeCountryCode(value) {
  const countryCode = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(countryCode) ? countryCode : null;
}

function getPublicConfig({ countryCode } = {}) {
  const missingConfiguration = missingPublicCheckoutVariables();
  reportMissingConfiguration('public checkout', missingConfiguration);
  return {
    provider: 'paddle',
    configured: missingConfiguration.length === 0,
    checkoutConfigured: checkoutConfigured(),
    environment: config.paddle.environment,
    clientSideToken: config.paddle.clientSideToken || null,
    tiers: getPublicTiers({
      monthly: config.paddle.monthlyPriceId,
      quarterly: config.paddle.quarterlyPriceId
    }),
    ...(normalizeCountryCode(countryCode) ? { countryCode: normalizeCountryCode(countryCode) } : {}),
    missingConfiguration
  };
}

function priceIdForTier(tier, billingCycle) {
  if (String(tier || 'premium').toLowerCase() !== 'premium') return null;
  return priceIdForBillingCycle(billingCycle);
}

// Backward-compatible helper for legacy subscription records/tests. New
// checkout UI always uses priceIdForTier() with month/year.
function priceIdForBillingCycle(billingCycle) {
  if (billingCycle === 'monthly') return config.paddle.monthlyPriceId || null;
  if (billingCycle === 'quarterly') return config.paddle.quarterlyPriceId || null;
  return null;
}

// Creates the checkout transaction on the trusted server. The browser never
// chooses the Paddle price or writes custom_data.user_id, so editing DevTools
// cannot attach a payment to another account or substitute an arbitrary item.
async function createCheckoutTransaction({ userId, tier, billingCycle }) {
  if (!isValidUuid(userId)) {
    const error = new Error('A valid authenticated user is required.');
    error.status = 400;
    throw error;
  }
  const missingConfiguration = [
    ...missingPublicCheckoutVariables(),
    ...missingServerCheckoutVariables()
  ];
  if (missingConfiguration.length) {
    reportMissingConfiguration('server checkout', missingConfiguration);
    throw configurationError(missingConfiguration);
  }
  const normalizedTier = String(tier || 'premium').toLowerCase();
  const priceId = priceIdForTier(normalizedTier, billingCycle);
  if (!priceId) {
    const error = new Error('Invalid or unavailable Paddle tier/billing cycle.');
    error.status = 400;
    throw error;
  }

  let transaction;
  try {
    transaction = await getPaddleClient().transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: {
        user_id: userId,
        tier: normalizedTier,
        billing_cycle: billingCycle
      },
      ...(config.paddle.checkoutUrl
        ? { checkout: { url: config.paddle.checkoutUrl } }
        : {})
    });
  } catch (cause) {
    const error = new Error('Paddle rejected the checkout transaction request.');
    error.status = 502;
    error.code = 'PADDLE_PROVIDER_ERROR';
    error.providerCode = cause?.code || cause?.type || 'paddle_unknown_error';
    error.providerDetail = cause?.detail || cause?.message || String(cause);
    error.documentationUrl = cause?.documentationUrl || null;
    error.internalMessage = [
      error.providerCode,
      error.providerDetail,
      error.documentationUrl
    ]
      .filter(Boolean)
      .join(' | ');
    throw error;
  }
  if (!transaction?.id) {
    const error = new Error('Paddle did not create a checkout transaction.');
    error.status = 502;
    throw error;
  }
  return { transactionId: transaction.id };
}

async function createCustomerPortalSession({ userId }) {
  const reference = await subscriptionService.getPaddleSubscriptionReference(userId);
  if (!reference?.customerId || !reference?.subscriptionId) {
    const error = new Error('No encontramos una suscripción Paddle para administrar.');
    error.status = 409;
    throw error;
  }

  try {
    const session = await getPaddleClient().customerPortalSessions.create(
      reference.customerId,
      [reference.subscriptionId]
    );
    const subscriptionUrl = session.urls?.subscriptions?.find(
      (item) => item.id === reference.subscriptionId
    );
    return {
      url: session.urls?.general?.overview || null,
      cancelUrl: subscriptionUrl?.cancelSubscription || null
    };
  } catch (cause) {
    const error = new Error('No se pudo abrir el portal seguro de Paddle.');
    error.internalMessage = cause?.message || String(cause);
    error.status = 502;
    throw error;
  }
}

async function pauseSubscriptionAtPeriodEnd({ userId }) {
  const reference = await subscriptionService.getPaddleSubscriptionReference(userId);
  if (!reference?.subscriptionId || !['active', 'trialing'].includes(reference.status)) {
    const error = new Error('No encontramos una suscripción Premium activa para pausar.');
    error.status = 409;
    throw error;
  }
  if (reference.cancelAtPeriodEnd) {
    const error = new Error('Tu suscripción ya tiene un cambio programado.');
    error.status = 409;
    throw error;
  }

  try {
    const subscription = await getPaddleClient().subscriptions.pause(
      reference.subscriptionId,
      { effectiveFrom: 'next_billing_period' }
    );
    return {
      scheduled: true,
      effectiveAt:
        subscription.scheduledChange?.effectiveAt ||
        subscription.currentBillingPeriod?.endsAt ||
        reference.currentPeriodEnd ||
        null
    };
  } catch (cause) {
    const error = new Error('No se pudo programar la pausa en Paddle.');
    error.internalMessage = cause?.message || String(cause);
    error.status = 502;
    throw error;
  }
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || '')
  );
}

function priceIdFromData(data) {
  return (data.items || []).map((item) => item?.price?.id).find(Boolean) || null;
}

function planFromData(data) {
  const priceId = priceIdFromData(data);
  if (priceId && priceId === config.paddle.monthlyPriceId) return 'monthly';
  if (priceId && priceId === config.paddle.quarterlyPriceId) return 'quarterly';
  const customCycle = String(data.customData?.billing_cycle || '').toLowerCase();
  return ['monthly', 'quarterly'].includes(customCycle) ? customCycle : null;
}

function isConfiguredPremiumPrice(priceId) {
  return Boolean(
    priceId &&
      [config.paddle.monthlyPriceId, config.paddle.quarterlyPriceId]
        .filter(Boolean)
        .includes(priceId)
  );
}

function normalizeEventData(event) {
  const data = event.data || {};
  const transaction = event.eventType === 'transaction.completed';
  const status = transaction ? 'active' : String(data.status || '').toLowerCase();
  const period = transaction ? data.billingPeriod : data.currentBillingPeriod;
  return {
    userId: data.customData?.user_id,
    paddleCustomerId: data.customerId || null,
    paddleSubscriptionId: transaction ? data.subscriptionId : data.id,
    paddleTransactionId: transaction ? data.id : null,
    paddlePriceId: priceIdFromData(data),
    plan: planFromData(data),
    status,
    currentPeriodStart: period?.startsAt || null,
    currentPeriodEnd: period?.endsAt || data.nextBilledAt || null,
    cancelAtPeriodEnd:
      status === 'canceled' || data.scheduledChange?.action === 'cancel',
    paddleUpdatedAt: data.updatedAt || event.occurredAt || null
  };
}

async function webhookWasProcessed(eventId) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase is not configured.');
  const { data, error } = await admin
    .from('paddle_webhook_events')
    .select('id')
    .eq('paddle_event_id', eventId)
    .maybeSingle();
  if (error) throw new Error(`Could not read Paddle webhook state: ${error.message}`);
  return Boolean(data);
}

async function recordWebhookEvent(event) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase is not configured.');
  const { error } = await admin.from('paddle_webhook_events').insert({
    paddle_event_id: event.eventId,
    event_type: event.eventType,
    occurred_at: event.occurredAt || null,
    processed_at: new Date().toISOString()
  });
  if (!error || error.code === '23505') return;
  throw new Error(`Could not record Paddle webhook: ${error.message}`);
}

async function unmarshalWebhook(rawBody, signatureHeader) {
  const bodyText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
  if (!bodyText || !signatureHeader) {
    const error = new Error('Invalid Paddle webhook signature.');
    error.status = 400;
    throw error;
  }
  if (!config.paddle.webhookSecret) {
    const error = new Error('Paddle webhook secret is not configured.');
    error.status = 503;
    throw error;
  }
  try {
    return await getPaddleClient().webhooks.unmarshal(
      bodyText,
      config.paddle.webhookSecret,
      String(signatureHeader)
    );
  } catch {
    const error = new Error('Invalid Paddle webhook signature.');
    error.status = 400;
    throw error;
  }
}

async function handleWebhookEvent(rawBody, signatureHeader) {
  const event = await unmarshalWebhook(rawBody, signatureHeader);
  if (await webhookWasProcessed(event.eventId)) return { duplicate: true };

  if (!SUPPORTED_EVENTS.has(event.eventType)) {
    await recordWebhookEvent(event);
    return { ignored: true };
  }

  const normalized = normalizeEventData(event);
  if (!isValidUuid(normalized.userId)) {
    console.warn(
      `[paddle-webhook] ignored event=${event.eventId} type=${event.eventType}: missing or invalid custom_data.user_id`
    );
    await recordWebhookEvent(event);
    return { ignored: true, reason: 'invalid_user_id' };
  }
  if (!normalized.paddleSubscriptionId) {
    console.warn(
      `[paddle-webhook] ignored event=${event.eventId} type=${event.eventType}: missing subscription reference`
    );
    await recordWebhookEvent(event);
    return { ignored: true, reason: 'missing_subscription_id' };
  }
  if (
    ['active', 'trialing'].includes(normalized.status) &&
    !isConfiguredPremiumPrice(normalized.paddlePriceId)
  ) {
    console.warn(
      `[paddle-webhook] ignored event=${event.eventId} type=${event.eventType}: price is not an ANDERGO Premium price`
    );
    await recordWebhookEvent(event);
    return { ignored: true, reason: 'unsupported_price' };
  }

  const result = await subscriptionService.syncPaddleSubscription({
    ...normalized,
    eventOccurredAt: event.occurredAt
  });
  await recordWebhookEvent(event);
  return result.stale ? { ignored: true, stale: true } : { processed: true };
}

module.exports = {
  SUPPORTED_EVENTS,
  createCheckoutTransaction,
  createCustomerPortalSession,
  pauseSubscriptionAtPeriodEnd,
  getPublicConfig,
  handleWebhookEvent,
  isConfiguredPremiumPrice,
  isValidUuid,
  normalizeEventData,
  normalizeCountryCode,
  priceIdForTier,
  priceIdForBillingCycle,
  missingPublicCheckoutVariables,
  missingServerCheckoutVariables,
  isConfigured: () => checkoutConfigured() && webhookConfigured()
};
