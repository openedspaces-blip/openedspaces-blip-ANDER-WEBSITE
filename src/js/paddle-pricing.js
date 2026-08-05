import { initializePaddle } from '/vendor/paddle/index.esm.js';

const state = {
  cycle: 'monthly',
  config: null,
  paddle: null,
  formattedTotals: new Map()
};

const grid = document.getElementById('paddlePricingGrid');
const status = document.querySelector('[data-paddle-status]');
const cycleButtons = [...document.querySelectorAll('[data-paddle-cycle]')];

function setStatus(message = '', tone = '') {
  if (!status) return;
  status.textContent = message;
  status.dataset.tone = tone;
}

function configurationError(config) {
  const missing = config?.missingConfiguration || [];
  if (!config?.environment) return 'Falta NEXT_PUBLIC_PADDLE_ENV. Checkout está desactivado.';
  const expectedTokenPrefix = config.environment === 'production' ? 'live_' : 'test_';
  if (!String(config.clientSideToken || '').startsWith(expectedTokenPrefix)) {
    return `El client-side token de Paddle no corresponde al entorno ${config.environment}.`;
  }
  if (missing.length) return `Faltan variables Paddle: ${missing.join(', ')}.`;
  return '';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function selectedPriceId(tier) {
  return tier.priceId?.[state.cycle] || null;
}

function renderTiers() {
  if (!grid || !state.config) return;
  const suffix = state.cycle === 'quarterly' ? '/ 3 meses' : '/ mes';
  grid.innerHTML = state.config.tiers
    .map((tier) => {
      const priceId = selectedPriceId(tier);
      const total = state.formattedTotals.get(priceId) || '—';
      return `
        <article class="paddle-tier-card${tier.featured ? ' is-featured' : ''}">
          ${tier.featured ? '<span class="paddle-tier-badge">Más elegido</span>' : ''}
          <div class="paddle-tier-heading">
            <h3>${escapeHtml(tier.name)}</h3>
            <p>${escapeHtml(tier.description)}</p>
          </div>
          <p class="paddle-tier-price" data-price-id="${escapeHtml(priceId)}">
            <strong>${escapeHtml(total)}</strong><span>${suffix}</span>
          </p>
          <ul>${tier.features.map((feature) => `<li><span aria-hidden="true">✓</span>${escapeHtml(feature)}</li>`).join('')}</ul>
          <button type="button" class="paddle-tier-subscribe${tier.featured ? ' primary-btn' : ' secondary-btn'}"
            data-paddle-tier="${escapeHtml(tier.key)}" ${priceId ? '' : 'disabled'}>
            Suscribirme a ${escapeHtml(tier.name)}
          </button>
        </article>`;
    })
    .join('');
}

async function initializeBillingPaddle() {
  if (state.paddle) return state.paddle;
  const error = configurationError(state.config);
  if (error) throw new Error(error);
  state.paddle = await initializePaddle({
    environment: state.config.environment,
    token: state.config.clientSideToken,
    checkout: {
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        successUrl: `${window.location.origin}/welcome`
      }
    },
    eventCallback(event) {
      if (event?.name === 'checkout.completed') {
        setStatus('Pago completado. Redirigiendo…', 'success');
      }
    }
  });
  if (!state.paddle) throw new Error('Paddle no pudo inicializarse.');
  return state.paddle;
}

async function refreshLocalizedPrices() {
  const paddle = await initializeBillingPaddle();
  const tiers = state.config.tiers || [];
  const items = tiers
    .map((tier) => selectedPriceId(tier))
    .filter(Boolean)
    .map((priceId) => ({ priceId, quantity: 1 }));
  if (items.length !== tiers.length) throw new Error('Faltan identificadores de precio para este ciclo.');

  const preview = await paddle.PricePreview({
    items,
    ...(state.config.countryCode ? { address: { countryCode: state.config.countryCode } } : {})
  });
  state.formattedTotals.clear();
  preview.data.details.lineItems.forEach((lineItem) => {
    // Paddle already localized and formatted these strings. Never recalculate,
    // round, parse or pass them through Intl.NumberFormat.
    state.formattedTotals.set(lineItem.price.id, lineItem.formattedTotals.total);
  });
  renderTiers();
  setStatus(
    state.config.countryCode
      ? `Precios localizados para ${state.config.countryCode}.`
      : 'Precios localizados automáticamente por Paddle.',
    'success'
  );
}

async function openCheckout(tierKey, button) {
  const customer = window.AndergoBillingContext?.getCustomer?.();
  if (!customer?.signedIn) {
    window.AndergoBillingContext?.requestSignIn?.();
    return;
  }
  const tier = state.config.tiers.find((item) => item.key === tierKey);
  const expectedPriceId = tier && selectedPriceId(tier);
  const displayedTotal = state.formattedTotals.get(expectedPriceId);
  if (!expectedPriceId || !displayedTotal) throw new Error('El precio todavía no está listo.');

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Abriendo checkout…';
  try {
    const response = await window.AndergoBillingContext.authFetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: tierKey, billingCycle: state.cycle })
    });
    const transaction = await response.json().catch(() => ({}));
    if (!response.ok || !transaction.transactionId) {
      throw new Error(transaction.error || 'No se pudo preparar el checkout.');
    }
    const paddle = await initializeBillingPaddle();
    paddle.Checkout.open({
      transactionId: transaction.transactionId,
      customer: customer.email ? { email: customer.email } : undefined,
      settings: {
        displayMode: 'overlay',
        variant: 'one-page',
        successUrl: `${window.location.origin}/welcome`
      }
    });
    setStatus(`${tier.name}: ${displayedTotal} ${state.cycle === 'quarterly' ? 'cada tres meses' : 'al mes'}.`, 'success');
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

async function loadPricing() {
  if (!grid) return;
  try {
    const response = await fetch('/api/billing/config', { headers: { Accept: 'application/json' } });
    state.config = await response.json();
    const error = configurationError(state.config);
    if (error) throw new Error(error);
    renderTiers();
    await refreshLocalizedPrices();
  } catch (error) {
    grid.innerHTML = `<div class="paddle-pricing-error"><strong>Checkout no disponible</strong><p>${escapeHtml(error.message)}</p></div>`;
    setStatus(error.message, 'error');
  }
}

cycleButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    state.cycle = button.dataset.paddleCycle;
    cycleButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    renderTiers();
    setStatus('Actualizando precios locales…');
    try {
      await refreshLocalizedPrices();
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });
});

grid?.addEventListener('click', async (event) => {
  const button = event.target.closest('.paddle-tier-subscribe');
  if (!button) return;
  try {
    await openCheckout(button.dataset.paddleTier, button);
  } catch (error) {
    setStatus(error.message || 'No se pudo abrir Paddle Checkout.', 'error');
  }
});

loadPricing();
