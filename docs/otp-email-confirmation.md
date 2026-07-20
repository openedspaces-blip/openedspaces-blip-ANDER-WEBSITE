# OTP email confirmation - Supabase configuration

This documents the two pieces of Supabase project configuration the OTP
confirmation flow (`lib/authService.js`, `src/js/script.js`) depends on.
Neither is set from code - both must be configured by hand in the Supabase
dashboard, per project (dev/staging/production each need their own).

## 1. Email template ("Confirm signup")

**Authentication → Emails → Templates → Confirm signup**

The app calls `supabase.auth.verifyOtp({ email, token, type: 'signup' })`
with a 6-digit code the student types into the OTP screen - not a link. For
that code to exist, the template must render `{{ .Token }}`, not only
`{{ .ConfirmationURL }}`. If the template only contains the confirmation
link, Supabase never generates a separate short numeric code and the OTP
screen has nothing valid to check.

Suggested template:

- **Subject:** `Tu código de verificación de ANDERGO`
- **Body:**

  ```
  Hola, {{ .Data.username }}:

  Tu código para confirmar tu cuenta de ANDERGO es:

  {{ .Token }}

  Este código es temporal y expira si no lo usas pronto - si eso pasa, pide
  uno nuevo desde la pantalla de verificación.

  Si no creaste esta cuenta, ignora este mensaje o escríbenos a
  support@andergo.online.
  ```

`{{ .Data.username }}` resolves because `authService.register()` passes
`username` in `signUp()`'s `options.data` (stored as
`auth.users.raw_user_meta_data`) - confirmed against this codebase, not
assumed.

Do not replace `{{ .Token }}` (or, on the link-based fallback page this app
also handles - see `initEmailConfirmedPage()` in `src/js/script.js` - a
`{{ .ConfirmationURL }}`) with a manually-written URL/code: only Supabase's
own template variable carries the real, single-use token.

## 2. SMTP (Brevo - configured)

**Authentication → SMTP Settings**

This project uses **Custom SMTP via Brevo**, not Supabase's shared default
mailer:

| Field | Value |
|---|---|
| SMTP host | `smtp-relay.brevo.com` |
| SMTP port | `587` |
| Sender name | `ANDERGO` |
| Sender email | `no-reply@andergo.online` (matches `EMAIL_CONFIRM_REDIRECT_URL`'s domain in `lib/authService.js`) |
| SMTP username / password | Brevo-issued - dashboard-only, see below |

DKIM and DMARC for `andergo.online` are verified in Brevo. Deliverability
issues (a signup that shows `success` here but the student never sees the
email) should be diagnosed in **Brevo → Transactional Logs** first - check
whether the recipient shows Delivered, Deferred, Blocked or Bounce there
before assuming this app's code is at fault. `lib/authService.js`'s
`logEmailOperation()` gives the matching server-side signal
(`operation=REGISTER_EMAIL_REQUEST status=... errorCode=...`) to narrow down
whether the request even reached Brevo in the first place. A `Delivered`
status in Brevo with nothing visible in Gmail's Primary tab means the SMTP
send succeeded - check Spam, Promociones and Todos next, not the app.

**Never** put the SMTP username/password in frontend code, a committed
`.env`, or a GitHub Actions log - they only ever belong in the Supabase
dashboard's SMTP settings (or, for infra-as-code setups, a secrets manager
that provisions that same dashboard field). This app never sends email
itself (no Nodemailer, no direct send from Vercel) - every email goes
through Supabase Auth's own `signUp`/`resend`/`resetPasswordForEmail` calls,
which is what actually talks to Brevo.
