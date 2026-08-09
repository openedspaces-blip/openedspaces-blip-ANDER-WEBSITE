(function setupAndergoInstall() {
  let deferredInstallPrompt = null;
  const status = document.querySelector('[data-install-status]');
  const installButtons = Array.from(document.querySelectorAll('[data-install-app]'));
  const setStatus = (message) => { if (status) status.textContent = message; };
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    setStatus('ANDERGO está lista para instalarse en este dispositivo.');
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    setStatus('ANDERGO se instaló correctamente. Ya puedes abrirla desde tu dispositivo.');
  });

  installButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      if (isStandalone) return setStatus('ANDERGO ya está instalada en este dispositivo.');
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        setStatus(choice.outcome === 'accepted'
          ? 'Instalación iniciada. Busca ANDERGO entre tus aplicaciones.'
          : 'La instalación se canceló. Puedes intentarlo nuevamente cuando quieras.');
        return;
      }
      if (isIos || button.dataset.platform === 'ios') {
        setStatus('En Safari, toca Compartir y luego “Agregar a pantalla de inicio”. Confirma con “Agregar”.');
        return;
      }
      setStatus('Abre esta página en Chrome o Microsoft Edge y selecciona “Instalar ANDERGO” en el menú del navegador.');
    });
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
  }
})();
