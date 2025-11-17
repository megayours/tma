/**
 * Utility to clear service worker and caches
 * Useful for debugging or when updating cache strategies
 */

export const clearServiceWorkerCache = async () => {
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered:', registration.scope);
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(async cacheName => {
          await caches.delete(cacheName);
          console.log('Cache deleted:', cacheName);
        })
      );
    }

    console.log('✅ All service workers and caches cleared!');
    console.log('Please refresh the page.');

    return true;
  } catch (error) {
    console.error('Failed to clear service worker/cache:', error);
    return false;
  }
};

// Helper to check current cache status
export const checkCacheStatus = async () => {
  try {
    const status = {
      serviceWorkers: [] as string[],
      caches: [] as string[],
    };

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      status.serviceWorkers = registrations.map(reg => reg.scope);
    }

    if ('caches' in window) {
      status.caches = await caches.keys();
    }

    console.log('Cache Status:', status);
    return status;
  } catch (error) {
    console.error('Failed to check cache status:', error);
    return null;
  }
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).clearSWCache = clearServiceWorkerCache;
  (window as any).checkSWCache = checkCacheStatus;
}
