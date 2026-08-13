// Public commercial information shared by payment, receipt and support views.
// Configure the three optional values in the environment before publishing;
// they intentionally remain absent from public pages until supplied.
const BUSINESS = {
  name: 'ANDERGO Language Academy',
  website: 'https://andergo.online',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@andergo.online',
  phone: String(process.env.BUSINESS_PHONE || '(1) 809-584-1156').trim(),
  address: String(process.env.BUSINESS_ADDRESS || 'Km3, Salida Nagua San Francisco de Macorís, Nagua, República Dominicana').trim(),
  country: 'República Dominicana',
  currencyCode: 'DOP',
  currencyName: 'peso dominicano',
  currencySymbol: 'RD$'
};

function formatDopMinorUnits(value) {
  const minorUnits = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(minorUnits) || minorUnits < 0) return '';
  return `${BUSINESS.currencySymbol}${(minorUnits / 100).toFixed(2)}`;
}

function publicBusinessInfo() {
  return { ...BUSINESS };
}

module.exports = { BUSINESS, formatDopMinorUnits, publicBusinessInfo };
