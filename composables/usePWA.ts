export const usePWA = () => {
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const isPWAInstalled = ref(false);
  const deferredPrompt = ref<any>(null);

  onMounted(() => {
    registerServiceWorker();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt.value = e;
      isPWAInstalled.value = false;
    });

    window.addEventListener('appinstalled', () => {
      isPWAInstalled.value = true;
      deferredPrompt.value = null;
    });
  });

  const installPWA = async () => {
    if (!deferredPrompt.value) return;
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === 'accepted') {
      isPWAInstalled.value = true;
    }
    deferredPrompt.value = null;
  };

  return {
    isPWAInstalled,
    installPWA
  };
}; 