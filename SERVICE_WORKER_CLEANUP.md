# Service Worker Cleanup Documentation

**Date Created:** December 17, 2024
**Issue:** Users seeing stale cached content despite cache invalidation changes
**Root Cause:** Old Workbox service worker from vite-plugin-pwa preventing new code from loading

---

## Problem Summary

After removing `vite-plugin-pwa` in commit `7445758`, users still had active service workers registered in their browsers that were serving old cached content. This created a "chicken and egg" problem:

1. Old service worker intercepts all requests
2. Serves cached `index.html` from `workbox-precache-v2` cache
3. Old HTML loads old JavaScript bundles
4. New migration code in `main.tsx` never executes
5. User never sees updated app

**Evidence:**
- Network tab showed: `Source: Service Worker`
- Active SW at: `https://mini-tma-candidate.web.app/sw.js`
- Cache: `workbox-precache-v2-https://mini-tma-candidate.web.app/`
- No localStorage migration key (migration never ran)

---

## Solution Implemented

### Self-Destructing Service Worker Approach

We deployed a **new service worker** (`public/sw.js`) that leverages the service worker's built-in update mechanism to break out of the cache trap:

1. **Old SW detects update**: Browser checks `/sw.js` periodically and finds new content
2. **Install new SW**: New self-destructing SW installs alongside old one
3. **Skip waiting**: Calls `self.skipWaiting()` to activate immediately
4. **Claim clients**: Takes control of all pages via `self.clients.claim()`
5. **Clear caches**: Deletes all caches including `workbox-precache-v2`
6. **Unregister**: Calls `registration.unregister()` to remove itself
7. **Reload page**: Sends message to app triggering hard reload
8. **Fresh content**: App loads from network with proper cache headers

### Files Modified

1. **`public/sw.js`** (NEW FILE)
   - Self-destructing service worker
   - Clears all caches and unregisters itself
   - Notifies app to reload after cleanup

2. **`src/main.tsx`**
   - Added message listener for `SW_CLEANUP_COMPLETE`
   - Triggers reload when cleanup finishes

3. **`src/utils/clearServiceWorker.ts`**
   - Bumped migration version from v1 to v2
   - Clears old v1 migration keys
   - Acts as fallback for edge cases

---

## How It Works

### Service Worker Update Lifecycle

When a user visits the app:

```
User navigates → Browser checks /sw.js → Detects new content → Downloads new SW
       ↓
Old SW still active → New SW installs → New SW calls skipWaiting()
       ↓
New SW activates → claims() all clients → Runs cleanup code
       ↓
Deletes all caches → Unregisters itself → Sends message to app
       ↓
App receives message → Reloads page → Fresh content from network
       ↓
No service worker → index.html from Firebase → App loads normally
```

### Why Other Approaches Don't Work

| Approach | Why It Fails |
|----------|--------------|
| Improve migration utility in main.tsx | Never executes - old SW serves cached code |
| Add HTTP cache-control headers | SW intercepts before headers are checked |
| Firebase hosting redirects | SW intercepts before request reaches server |
| Ask users to clear browser data | Doesn't scale, poor UX |

**Only solution:** Use SW's own update mechanism against itself

---

## Verification After Deployment

### Expected Console Logs

```
[SW-Cleanup] Self-destructing service worker installed
[SW-Cleanup] Self-destructing service worker activated
[SW-Cleanup] Claimed all clients
[SW-Cleanup] Cleared all caches: ["workbox-precache-v2-https://..."]
[SW-Cleanup] Service worker unregistered: true
[SW-Cleanup] Notified 1 client(s) to reload
[SW-Cleanup] Received cleanup complete message, reloading...
[Migration-v2] No service worker found, skipping cleanup.
```

### Verification Checklist

- [ ] DevTools → Application → Service Workers: Shows "No service worker"
- [ ] DevTools → Application → Cache Storage: Empty (0 caches)
- [ ] DevTools → Network: `index.html` shows `Source: Fetch` (not Service Worker)
- [ ] DevTools → Console → localStorage: Contains `sw_migration_v2_completed: "true"`
- [ ] App loads latest version with new commits/features
- [ ] Response headers show: `Cache-Control: no-store, must-revalidate`

---

## Migration Timeline

### Phase 1: Deployment (Day 0)
- Deploy updated code with `public/sw.js`
- Self-destructing SW available at `/sw.js`

### Phase 2: Active Migration (Days 1-30)
- Users visit app, old SW detects update
- Cleanup runs automatically
- Users transition to "no service worker" state
- Monitor analytics for migration success rate

### Phase 3: Verification (Day 30)
- Check analytics: % of users with clean state
- Target: 99%+ users successfully migrated
- Review Sentry for any errors

### Phase 4: Cleanup (Day 60+)
**Once migration is complete, remove the service worker:**

1. Delete `/public/sw.js` file
2. Remove message listener from `src/main.tsx` (lines 22-32)
3. Deploy updated code
4. Firebase will serve 404 for `/sw.js` requests (harmless)
5. Archive this documentation file for reference

---

## Future Prevention

To prevent this issue from happening again:

1. **Never use PWA plugins without clear requirements**
   - Service workers are powerful but sticky
   - Hard to remove once deployed
   - Only use for offline-first apps

2. **Always have a cleanup strategy before deploying SW**
   - Plan migration path upfront
   - Consider lifecycle implications
   - Test cleanup before production

3. **Monitor service worker state**
   - Add analytics to track SW registrations
   - Alert on unexpected SW activity
   - Regular audits of browser cache behavior

4. **Use HTTP caching for most apps**
   - Simpler, more predictable
   - Server-controlled via headers
   - No sticky client-side state

---

## Manual Testing / Debugging

### Check Current SW State

Run in browser console:

```javascript
// Check if SW is controlling the page
console.log('Controller:', navigator.serviceWorker.controller);

// List all registrations
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registrations:', regs.length);
  regs.forEach(r => console.log('  -', r.scope, r.active?.state));
});

// List all caches
caches.keys().then(keys => {
  console.log('Caches:', keys);
});

// Check migration status
console.log('Migration v2:', localStorage.getItem('sw_migration_v2_completed'));
```

### Manual Cleanup (Emergency)

If automated cleanup fails:

```javascript
// Force unregister
const registrations = await navigator.serviceWorker.getRegistrations();
for (let reg of registrations) await reg.unregister();

// Force clear caches
const cacheNames = await caches.keys();
for (let name of cacheNames) await caches.delete(name);

// Hard reload
location.reload();
```

### Force Re-run Migration

```javascript
// Clear v2 key to force migration to run again
localStorage.removeItem('sw_migration_v2_completed');
location.reload();
```

---

## References

- **Original Issue:** Service worker serving stale content
- **Cache Strategy Commit:** `7445758` - "new cache invalidation strategy"
- **vite-plugin-pwa Removal:** Commit `7445758`
- **Service Worker Standard:** https://w3c.github.io/ServiceWorker/
- **Firebase Hosting Headers:** `firebase.json` lines 55-90

---

## Contact / Questions

For questions about this migration or issues:
1. Check DevTools console for `[SW-Cleanup]` or `[Migration-v2]` logs
2. Verify browser console output matches expected logs
3. Check Sentry for service worker related errors
4. Review this document's troubleshooting section

**Remember:** This is a ONE-TIME migration. The `public/sw.js` file can (and should) be removed after 30-60 days once all users have migrated.
