// lib/billingService.js
// Placeholder for the future payment gateway (Stripe and/or PayPal) - no
// integration exists yet, on purpose (see the ANDERGO subscriptions spec:
// architecture first, gateway later). This file exists so every call site
// that will eventually need "start a checkout" / "open the billing portal" /
// "handle a provider webhook" already has one place to call, instead of a
// gateway SDK getting sprinkled into routes/services later.
//
// Wiring in a real provider means: implement these three functions for
// real, add the SDK dependency, and have server.js's webhook route call
// handleWebhookEvent(). lib/subscriptionService.js's changePlan() is
// already the function handleWebhookEvent() will call once a webhook
// tells it a subscription started/renewed/canceled - nothing about that
// function needs to change.
function notConfiguredError() {
  const err = new Error(
    'Ningún proveedor de pagos está conectado todavía. Esto se habilitará en una fase posterior.'
  );
  err.status = 501;
  err.code = 'BILLING_NOT_CONFIGURED';
  return err;
}

// Will create a Stripe Checkout Session / PayPal order for { userId,
// planSlug, billingCycle } and return a redirect URL. Throws until a
// provider is connected - callers must not silently no-op here.
async function createCheckoutSession(/* { userId, planSlug, billingCycle } */) {
  throw notConfiguredError();
}

// Will create a Stripe Billing Portal (or PayPal equivalent) session so a
// Premium user can manage/cancel their own subscription without an admin.
async function createBillingPortalSession(/* { userId } */) {
  throw notConfiguredError();
}

// Will verify and dispatch an inbound webhook event from the provider,
// calling lib/subscriptionService.js's changePlan()/cancelSubscription()
// with the event's real data. Never call this from a route until a
// provider (and its webhook signing secret) is actually configured.
async function handleWebhookEvent(/* rawBody, signatureHeader */) {
  throw notConfiguredError();
}

module.exports = {
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhookEvent,
  isConfigured: () => false
};
