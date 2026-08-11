const crypto = require('crypto');
const config = require('./config');
const subscriptionService = require('./subscriptionService');
const { getSupabaseAdmin } = require('./supabaseClient');

const PAYMENT_URLS = {
  test: 'https://pruebas.azul.com.do/PaymentPage/',
  production: 'https://pagos.azul.com.do/PaymentPage/Default.aspx'
};

const REQUEST_HASH_FIELDS = [
  'MerchantId', 'MerchantName', 'MerchantType', 'CurrencyCode', 'OrderNumber',
  'Amount', 'ITBIS', 'ApprovedUrl', 'DeclinedUrl', 'CancelUrl', 'UseCustomField1',
  'CustomField1Label', 'CustomField1Value', 'UseCustomField2', 'CustomField2Label',
  'CustomField2Value'
];
const RESPONSE_HASH_FIELDS = [
  'OrderNumber', 'Amount', 'AuthorizationCode', 'DateTime', 'ResponseCode',
  'IsoCode', 'ResponseMessage', 'ErrorDescription', 'RRN'
];

function amountForCycle(cycle) {
  return cycle === 'monthly' ? config.azul.monthlyAmount : cycle === 'quarterly' ? config.azul.quarterlyAmount : '';
}

function missingConfiguration() {
  return [
    !config.azul.merchantId && 'AZUL_MERCHANT_ID',
    !config.azul.authKey && 'AZUL_AUTH_KEY',
    !config.azul.currencyCode && 'AZUL_CURRENCY_CODE',
    !config.azul.monthlyAmount && 'AZUL_MONTHLY_AMOUNT',
    !config.azul.quarterlyAmount && 'AZUL_QUARTERLY_AMOUNT'
  ].filter(Boolean);
}

function getPublicConfig() {
  return { provider: 'azul', configured: missingConfiguration().length === 0, environment: config.azul.environment };
}

function hash(fields, names) {
  const value = names.map((name) => String(fieldValue(fields, name) || '')).join('') + config.azul.authKey;
  return crypto.createHmac('sha512', config.azul.authKey).update(Buffer.from(value, 'utf16le')).digest('hex');
}

function fieldValue(fields, wanted) {
  const key = Object.keys(fields || {}).find((name) => name.toLowerCase() === wanted.toLowerCase());
  return key ? fields[key] : '';
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || '').toLowerCase());
  const b = Buffer.from(String(right || '').toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function newOrderNumber() {
  return `${Date.now()}`.slice(-11) + crypto.randomInt(1000, 10000);
}

async function createCheckout({ userId, billingCycle }) {
  const missing = missingConfiguration();
  if (missing.length) {
    const error = new Error('Azul no está configurado.');
    error.status = 503;
    error.code = 'AZUL_CONFIGURATION_MISSING';
    error.missingVariables = missing;
    throw error;
  }
  const amount = amountForCycle(billingCycle);
  if (!amount || !/^\d+$/.test(amount)) {
    const error = new Error('Ciclo de facturación no válido.');
    error.status = 400;
    throw error;
  }
  const orderNumber = newOrderNumber();
  const callback = `${config.azul.publicBaseUrl}/api/billing/azul/return`;
  const fields = {
    MerchantId: config.azul.merchantId,
    MerchantName: config.azul.merchantName,
    MerchantType: config.azul.merchantType,
    CurrencyCode: config.azul.currencyCode,
    OrderNumber: orderNumber,
    Amount: amount,
    ITBIS: config.azul.itbis,
    ApprovedUrl: `${callback}?result=approved`,
    DeclinedUrl: `${callback}?result=declined`,
    CancelUrl: `${callback}?result=cancelled`,
    UseCustomField1: '0', CustomField1Label: '', CustomField1Value: '',
    UseCustomField2: '0', CustomField2Label: '', CustomField2Value: '',
    Locale: 'ES', ShowTransactionResult: '1'
  };
  fields.AuthHash = hash(fields, REQUEST_HASH_FIELDS);
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase no está configurado.');
  const { error } = await admin.from('azul_payment_orders').insert({
    order_number: orderNumber, user_id: userId, billing_cycle: billingCycle, amount, currency_code: config.azul.currencyCode
  });
  if (error) throw new Error(`No se pudo crear la orden Azul: ${error.message}`);
  return { action: PAYMENT_URLS[config.azul.environment], fields };
}

async function handleReturn(query) {
  const orderNumber = String(fieldValue(query, 'OrderNumber') || '');
  if (!orderNumber || !safeEqual(hash(query, RESPONSE_HASH_FIELDS), fieldValue(query, 'AuthHash'))) {
    const error = new Error('Respuesta de Azul no válida.');
    error.status = 400;
    throw error;
  }
  const admin = getSupabaseAdmin();
  const { data: order, error } = await admin.from('azul_payment_orders').select('*').eq('order_number', orderNumber).maybeSingle();
  if (error || !order) {
    const missing = new Error('Orden Azul no encontrada.');
    missing.status = 404;
    throw missing;
  }
  if (order.status === 'approved') return { approved: true, duplicate: true };
  const isoCode = String(fieldValue(query, 'IsoCode'));
  const approved = isoCode === '00' && String(fieldValue(query, 'ResponseMessage')).toUpperCase().includes('APROB');
  if (!approved || String(fieldValue(query, 'Amount')) !== String(order.amount)) {
    await admin.from('azul_payment_orders').update({ status: 'declined', response_code: fieldValue(query, 'ResponseCode') || isoCode }).eq('id', order.id);
    return { approved: false };
  }
  const expires = new Date();
  expires.setUTCMonth(expires.getUTCMonth() + (order.billing_cycle === 'quarterly' ? 3 : 1));
  await subscriptionService.syncProviderSubscription({
    userId: order.user_id, provider: 'azul', providerSubscriptionId: `azul:${order.order_number}`,
    providerCustomerId: null, billingCycle: order.billing_cycle, status: 'active', expiresAt: expires.toISOString()
  });
  await admin.from('azul_payment_orders').update({
    status: 'approved', azul_order_id: fieldValue(query, 'AzulOrderId') || null,
    authorization_code: fieldValue(query, 'AuthorizationCode') || null, processed_at: new Date().toISOString()
  }).eq('id', order.id);
  return { approved: true };
}

module.exports = { getPublicConfig, createCheckout, handleReturn, _private: { hash, REQUEST_HASH_FIELDS, RESPONSE_HASH_FIELDS } };
