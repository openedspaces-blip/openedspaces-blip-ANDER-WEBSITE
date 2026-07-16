// lib/mfaService.js
// TOTP MFA (enroll/challenge/verify/list/unenroll) - exclusively through
// Supabase's official auth.mfa.* API. No TOTP secret, QR code or recovery
// code is ever stored in profiles, our own tables, or logs; Supabase Auth
// owns that data entirely (see supabase/migrations - no MFA-related
// migration exists, and none is needed for this phase).
const config = require('./config');
const { createAuthClient, createUserScopedClient } = require('./supabaseClient');

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Exact codes from @supabase/auth-js's ErrorCode type - anything else
// falls back to a generic message rather than leaking the raw error.
const MFA_ERROR_MESSAGES = {
  mfa_verification_failed: 'Código incorrecto. Intenta de nuevo.',
  mfa_challenge_expired: 'El código expiró. Solicita uno nuevo.',
  too_many_enrolled_mfa_factors: 'Ya tienes el máximo de factores permitidos.',
  mfa_factor_name_conflict: 'Ya tienes un factor con ese nombre. Elimínalo antes de crear otro.',
  mfa_totp_enroll_not_enabled:
    'La verificación en dos pasos no está habilitada en este proyecto de Supabase.',
  mfa_totp_verify_not_enabled:
    'La verificación en dos pasos no está habilitada en este proyecto de Supabase.',
  insufficient_aal: 'Completa la verificación en dos pasos para continuar.'
};

function mapMfaError(error) {
  const message = MFA_ERROR_MESSAGES[error?.code] || 'No se pudo completar la operación de seguridad.';
  const err = httpError(message, error?.status || 400);
  err.code = error?.code;
  return err;
}

function requireConfigured() {
  if (!config.isSupabaseConfigured) {
    const err = new Error('La verificación en dos pasos requiere Supabase configurado.');
    err.status = 503;
    throw err;
  }
}

function requireClient(accessToken) {
  requireConfigured();
  if (!accessToken) {
    const err = new Error('Sesión no válida.');
    err.status = 401;
    throw err;
  }
  return createUserScopedClient(accessToken);
}

// Starts enrollment - qr_code comes back as inline SVG markup (an <img
// src="data:image/svg+xml;..."> or a raw <svg> embed both work), secret is
// the manual-entry key for authenticator apps that can't scan a QR. Neither
// is persisted anywhere on our side; the frontend only ever holds them in
// memory for the duration of this one enrollment screen.
async function enrollTotp(accessToken) {
  const client = requireClient(accessToken);
  const { data, error } = await client.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Aplicación autenticadora'
  });
  if (error) throw mapMfaError(error);
  return {
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri
  };
}

async function challengeFactor(accessToken, factorId) {
  const client = requireClient(accessToken);
  if (!factorId) throw httpError('Falta el identificador del factor.', 400);
  const { data, error } = await client.auth.mfa.challenge({ factorId });
  if (error) throw mapMfaError(error);
  return { challengeId: data.id, expiresAt: data.expires_at };
}

// Used both to finish enrollment (first-time verification of a brand new
// factor) and, later, to complete a login's second step - same Supabase
// call either way. Returns the new (aal2) session: verifying a factor
// invalidates the caller's other sessions per Supabase's own enroll() docs,
// so the frontend must swap in these tokens rather than keep the old ones.
async function verifyFactor(accessToken, { factorId, challengeId, code }) {
  const client = requireClient(accessToken);
  const trimmedCode = String(code || '').trim();
  if (!factorId || !challengeId) {
    throw httpError('Falta el identificador del factor o del desafío.', 400);
  }
  if (!/^\d{6}$/.test(trimmedCode)) {
    throw httpError('El código debe tener 6 dígitos.', 400);
  }

  const { data, error } = await client.auth.mfa.verify({ factorId, challengeId, code: trimmedCode });
  if (error) throw mapMfaError(error);

  return {
    ok: true,
    session: { access_token: data.access_token, refresh_token: data.refresh_token }
  };
}

async function listFactors(accessToken) {
  const client = requireClient(accessToken);
  const { data, error } = await client.auth.mfa.listFactors();
  if (error) throw mapMfaError(error);
  return {
    totp: (data.totp || []).map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name || null,
      status: factor.status,
      createdAt: factor.created_at
    }))
  };
}

async function unenrollFactor(accessToken, factorId) {
  const client = requireClient(accessToken);
  if (!factorId) throw httpError('Falta el identificador del factor.', 400);
  const { error } = await client.auth.mfa.unenroll({ factorId });
  if (error) throw mapMfaError(error);
  return { ok: true };
}

// Server-side AAL check that takes the JWT directly rather than needing a
// session set on the client first - auth.mfa.getAuthenticatorAssuranceLevel(jwt)
// is documented by Supabase specifically for "server-side environments...
// where no session is stored", which is exactly this backend's situation.
async function getAssuranceLevel(accessToken) {
  requireConfigured();
  if (!accessToken) {
    const err = new Error('Sesión no válida.');
    err.status = 401;
    throw err;
  }
  const client = createAuthClient();
  const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel(accessToken);
  if (error) throw mapMfaError(error);
  return { currentLevel: data.currentLevel, nextLevel: data.nextLevel };
}

module.exports = {
  enrollTotp,
  challengeFactor,
  verifyFactor,
  listFactors,
  unenrollFactor,
  getAssuranceLevel
};
