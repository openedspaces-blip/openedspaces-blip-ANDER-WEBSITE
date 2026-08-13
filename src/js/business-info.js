(function () {
  const fallback = {
    name: 'ANDERGO Language Academy', website: 'https://andergo.online',
    supportEmail: 'support@andergo.online', country: 'República Dominicana', phone: '', address: ''
  };
  function render(info = fallback) {
    document.querySelectorAll('[data-business="name"]').forEach((el) => { el.textContent = info.name; });
    document.querySelectorAll('[data-business="email"]').forEach((el) => { el.textContent = info.supportEmail; el.href = `mailto:${info.supportEmail}`; });
    document.querySelectorAll('[data-business="country"]').forEach((el) => { el.textContent = info.country; });
    document.querySelectorAll('[data-business="website"]').forEach((el) => { el.textContent = info.website.replace(/^https:\/\//, ''); el.href = info.website; });
    ['phone', 'address'].forEach((key) => document.querySelectorAll(`[data-business-optional="${key}"]`).forEach((el) => {
      const value = String(info[key] || '').trim();
      el.hidden = !value;
      const target = el.querySelector(`[data-business="${key}"]`) || el;
      target.textContent = value;
      if (key === 'phone' && target.tagName === 'A') target.href = `tel:${value.replace(/[^+\d]/g, '')}`;
    }));
  }
  window.AndergoBusinessInfo = { render };
  render();
  fetch('/api/business-info', { headers: { Accept: 'application/json' } })
    .then((response) => response.ok ? response.json() : fallback)
    .then(render)
    .catch(() => render(fallback));
})();
