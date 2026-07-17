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

  Este código es temporal.

  Si no creaste esta cuenta, ignora este mensaje.
  ```

`{{ .Data.username }}` resolves because `authService.register()` passes
`username` in `signUp()`'s `options.data` (stored as
`auth.users.raw_user_meta_data`) - confirmed against this codebase, not
assumed.

## 2. SMTP (do not ship on the Supabase default)

**Authentication → SMTP Settings**

Supabase's built-in mailer is shared across all projects on the free/default
tier and is heavily rate-limited - fine for local development, not for real
signups. This system is **not production-ready** until a dedicated SMTP
provider is configured here. Required fields:

| Field | Notes |
|---|---|
| SMTP host | From your provider (e.g. Postmark, SES, Resend, SendGrid) |
| SMTP port | Usually `587` (STARTTLS) or `465` (SSL) |
| SMTP username | Provider-issued, not a personal email login |
| SMTP password / API key | Provider-issued |
| Sender name | `ANDERGO` |
| Sender email | `no-reply@andergo.online` (matches the domain already used by `EMAIL_CONFIRM_REDIRECT_URL` in `lib/authService.js`) |

**Never** put any of these values in frontend code, a committed `.env`, or a
GitHub Actions log - they only ever belong in the Supabase dashboard's SMTP
settings (or, for infra-as-code setups, a secrets manager that provisions
that same dashboard field).

## What still uses the default template/mailer today

Until both of the above are configured in the actual Supabase project, the
app works (confirmed end-to-end against a real account) but is running on
shared infrastructure not meant for production email volume.
