const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('./config');
const paypalBillingService = require('./paypalBillingService');

function setPayPalConfig(overrides = {}) {
  const original = { ...config.paypal };
  Object.assign(config.paypal, {
    environment: 'sandbox',
    clientId: 'sandbox-client-id',
    clientSecret: 'sandbox-client-secret',
    webhookId: 'sandbox-webhook-id',
    monthlyPlanId: 'P-MONTHLY',
    quarterlyPlanId: 'P-QUARTERLY',
    ...overrides
  });
  return () => Object.assign(config.paypal, original);
}

test('PayPal checkout uses the configured plan and keeps merchant secrets server-side', async (t) => {
  const restoreConfig = setPayPalConfig();
  const originalFetch = global.fetch;
  const calls = [];
  t.after(() => {
    restoreConfig();
    global.fetch = originalFetch;
  });
  global.fetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (String(url).endsWith('/v1/oauth2/token')) {
      return new Response(JSON.stringify({ access_token: 'sandbox-access-token' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(
      JSON.stringify({
        id: 'I-SUBSCRIPTION',
        links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com/approve/I-SUBSCRIPTION' }]
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  };

  const checkout = await paypalBillingService.createCheckout({
    userId: 'test-user-id',
    billingCycle: 'quarterly'
  });

  assert.deepEqual(checkout, {
    subscriptionId: 'I-SUBSCRIPTION',
    approvalUrl: 'https://www.sandbox.paypal.com/approve/I-SUBSCRIPTION'
  });
  assert.match(calls[0].url, /^https:\/\/api-m\.sandbox\.paypal\.com\//);
  assert.equal(
    calls[0].options.headers.Authorization,
    `Basic ${Buffer.from('sandbox-client-id:sandbox-client-secret').toString('base64')}`
  );
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, 'https://api-m.sandbox.paypal.com/v1/billing/subscriptions');
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    plan_id: 'P-QUARTERLY',
    custom_id: 'test-user-id',
    application_context: {
      brand_name: 'ANDERGO',
      locale: 'es-DO',
      user_action: 'SUBSCRIBE_NOW',
      return_url: 'https://andergo.online/?payment=approved&provider=paypal',
      cancel_url: 'https://andergo.online/?payment=cancelled&provider=paypal'
    }
  });
  const publicConfig = paypalBillingService.getPublicConfig();
  assert.equal(publicConfig.configured, true);
  assert.equal('clientSecret' in publicConfig, false);
  assert.equal('webhookId' in publicConfig, false);
});

test('PayPal checkout rejects invalid billing cycles and incomplete configuration', async (t) => {
  let restoreConfig = setPayPalConfig();
  t.after(() => restoreConfig());
  await assert.rejects(
    paypalBillingService.createCheckout({ userId: 'test-user-id', billingCycle: 'yearly' }),
    { status: 400 }
  );

  restoreConfig();
  restoreConfig = setPayPalConfig({ webhookId: '' });
  await assert.rejects(
    paypalBillingService.createCheckout({ userId: 'test-user-id', billingCycle: 'monthly' }),
    (error) => error.status === 503 && error.missingVariables.includes('PAYPAL_WEBHOOK_ID')
  );
});

test('PayPal lifecycle statuses map to the local subscription states', () => {
  assert.equal(paypalBillingService.normalizeStatus('ACTIVE'), 'active');
  assert.equal(paypalBillingService.normalizeStatus('SUSPENDED'), 'paused');
  assert.equal(paypalBillingService.normalizeStatus('CANCELLED'), 'canceled');
  assert.equal(paypalBillingService.normalizeStatus('EXPIRED'), 'expired');
  assert.equal(paypalBillingService.normalizeStatus('PAYMENT_FAILED'), 'past_due');
});
