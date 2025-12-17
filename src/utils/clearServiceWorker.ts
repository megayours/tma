/**
 * One-time migration utility to clean up old service workers
 * Runs once per user on first load after update
 *
 * Version 2: Bumped to force re-run for users who may still have
 * active service workers. Works in conjunction with the self-destructing
 * service worker deployed at public/sw.js
 */

const MIGRATION_KEY = 'sw_migration_v2_completed';
const OLD_MIGRATION_KEYS = ['sw_migration_v1_completed'];

export const migrateFromServiceWorker = async (): Promise<void> => {
  // Clear old migration keys from previous versions
  OLD_MIGRATION_KEYS.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log('[Migration] Removed old migration key:', key);
    }
  });

  // Check if v2 migration already completed
  if (localStorage.getItem(MIGRATION_KEY) === 'true') {
    return;
  }

  try {
    let hadServiceWorker = false;
    let hadCaches = false;

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length > 0) {
        hadServiceWorker = true;
        for (const registration of registrations) {
          await registration.unregister();
          console.log('[Migration] Service worker unregistered:', registration.scope);
        }
      }
    }

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      if (cacheNames.length > 0) {
        hadCaches = true;
        await Promise.all(
          cacheNames.map(async cacheName => {
            await caches.delete(cacheName);
            console.log('[Migration] Cache deleted:', cacheName);
          })
        );
      }
    }

    // Mark migration as completed
    localStorage.setItem(MIGRATION_KEY, 'true');

    if (hadServiceWorker || hadCaches) {
      console.log('[Migration-v2] ✅ Service worker cleanup completed. The app will use HTTP caching from now on.');

      // Force a hard reload to ensure fresh assets
      window.location.reload();
    } else {
      console.log('[Migration-v2] No service worker found, skipping cleanup.');
    }
  } catch (error) {
    console.error('[Migration] Failed to clean up service worker:', error);
    // Don't mark as completed if it failed - will retry next time
  }
};
