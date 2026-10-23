# PayPal Premium setup and launch checks

ANDERGO already implements PayPal subscription checkout, server-side subscription verification, and signed-webhook synchronization. Premium is not activated from a browser success message: the API verifies the subscription with PayPal before updating the user's subscription record.

## Configure Sandbox first

1. In the PayPal Developer Dashboard, create a Sandbox REST app and two subscription plans in USD: monthly at USD 4.99 and quarterly at USD 12.99.
2. Register a webhook for the Sandbox app at `https://<staging-domain>/api/paypal/webhook`. Subscribe to the subscription lifecycle events used to report activation, updates, suspension, cancellation, expiration, and failed recurring payments. Copy the webhook ID from that registration.
3. Set these environment variables in the staging deployment (and in local `.env` only when testing locally):

   ```text
   PAYPAL_ENV=sandbox
   PAYPAL_CLIENT_ID=<sandbox-client-id>
   PAYPAL_CLIENT_SECRET=<sandbox-client-secret>
   PAYPAL_WEBHOOK_ID=<sandbox-webhook-id>
   PAYPAL_MONTHLY_PLAN_ID=<sandbox-monthly-plan-id>
   PAYPAL_QUARTERLY_PLAN_ID=<sandbox-quarterly-plan-id>
   PUBLIC_BASE_URL=https://<staging-domain>
   ```

   Keep the client secret and webhook ID server-side. Never place them in frontend code or commit them.

4. Deploy with Supabase configured and the required subscription schema/migrations applied. Check `GET /api/billing/paypal/config`: it must report `configured: true`, `environment: "sandbox"`, and the expected two plan IDs. If it reports missing configuration, checkout must remain disabled.
5. Sign in with a staging account, start each plan, approve it with a PayPal Sandbox buyer, and confirm the return flow refreshes the account to Premium. Then exercise cancellation, suspension/payment-failure, and expiration using Sandbox controls/webhooks; confirm the subscription and access state match PayPal.
6. Run the local automated checks:

   ```powershell
   npm test
   npm run build
   npm run verify:all
   npm run audit:curriculum
   ```

The PayPal service tests stub PayPal's HTTP API, so they never contact PayPal or create a real charge. A passing unit suite is not a substitute for the Sandbox checkout and webhook checks above.

## Live Supabase checks

The default tests deliberately use the local/demo path. The opt-in `RUN_LIVE_SUPABASE_TESTS=1` tests create temporary Auth users and delete them afterward; run them only against a dedicated staging Supabase project, never production:

```powershell
$env:RUN_LIVE_SUPABASE_TESTS = '1'
npm test
Remove-Item Env:RUN_LIVE_SUPABASE_TESTS
```

Those tests cover the Auth round-trip, not a full production migration or a live PayPal transaction. Verify the deployed health endpoint, registration/login, course progress persistence, subscription activation, and webhook delivery in staging before enabling production PayPal credentials.

## Enable production

Only after Sandbox passes, create separate PayPal Live plans, app credentials, and a Live webhook registered at `https://andergo.online/api/paypal/webhook`. Set `PAYPAL_ENV=production`, the Live IDs/secrets above, and `PUBLIC_BASE_URL=https://andergo.online` in the production environment. Keep preview/staging deployments on Sandbox credentials. Perform one authorized low-value production checkout and verify its webhook and cancellation path before announcing Premium.
