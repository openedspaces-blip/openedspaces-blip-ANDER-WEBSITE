// Paddle checkout configuration and verified webhook processing.
// Browser checkout events are presentation-only: Premium is granted only
// after Paddle's SDK verifies the raw webhook body server-side.
const { Environment, Paddle } = require('@paddle/paddle-node-sdk');
const config = require('./config');
const { getSupabaseAdmin } = require('./supabaseClient');
const subscriptionService = require('./subscriptionService');

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

function getPaddleClient() {
  if (!config.paddle.apiKey) {
    const error = new Error('Paddle API key is not configured.');
    error.status = 503;
    throw error;
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
  return Boolean(
    config.paddle.clientSideToken &&
      config.paddle.monthlyPriceId &&
      config.paddle.quarterlyPriceId
  );
}

function webhookConfigured() {
  return Boolean(config.paddle.apiKey && config.paddle.webhookSecret);
}

function getPublicConfig() {
  return {
    provider: 'paddle',
    configured: checkoutConfigured() && webhookConfigured(),
    checkoutConfigured: checkoutConfigured(),
    environment: config.paddle.environment,
    clientSideToken: config.paddle.clientSideToken || null,
    prices: {
      monthly: config.paddle.monthlyPriceId || null,
      quarterly: config.paddle.quarterlyPriceId || null
    }
  };
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
  const customPlan = String(data.customData?.plan || '').toLowerCase();
  return customPlan === 'monthly' || customPlan === 'quarterly' ? customPlan : null;
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
  getPublicConfig,
  handleWebhookEvent,
  isConfiguredPremiumPrice,
  isValidUuid,
  normalizeEventData,
  isConfigured: () => checkoutConfigured() && webhookConfigured()
};
