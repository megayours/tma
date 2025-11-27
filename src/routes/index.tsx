import { createFileRoute, useRouter } from '@tanstack/react-router';
import { isTMA } from '@telegram-apps/bridge';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { base64UrlDecode } from '@/utils/base64';
import { useNavigationHistory } from '@/contexts/NavigationHistoryContext';
import { useEffect, useRef } from 'react';

const DEEPLINK_CONSUMED_KEY = 'deeplink_consumed';

// Check if deep link has already been consumed this session
function isDeepLinkConsumed(): boolean {
  try {
    return sessionStorage.getItem(DEEPLINK_CONSUMED_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

// Mark deep link as consumed
function markDeepLinkConsumed(): void {
  try {
    sessionStorage.setItem(DEEPLINK_CONSUMED_KEY, 'true');
  } catch (e) {
    console.warn('Failed to mark deep link as consumed:', e);
  }
}

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const router = useRouter();
  const { lastContentMenuRoute } = useNavigationHistory();
  const hasRedirected = useRef(false);

  // Always call hooks at the top level unconditionally
  const isTelegramEnv = isTMA();
  const launchParams = useLaunchParams(true);
  const startParam = launchParams?.tgWebAppStartParam;

  useEffect(() => {
    if (hasRedirected.current) return;

    const deepLinkAlreadyConsumed = isDeepLinkConsumed();

    console.log('[Index Route] Checking redirect...', {
      hasStartParam: !!startParam,
      isTMA: isTelegramEnv,
      deepLinkAlreadyConsumed,
      lastContentMenuRoute,
    });

    // Check if running in Telegram environment with a deep link that hasn't been consumed
    if (startParam && !deepLinkAlreadyConsumed) {
      try {
        const decodedPath = base64UrlDecode(startParam);
        console.log('[Index Route] Deep link detected, redirecting to:', decodedPath);
        markDeepLinkConsumed();
        hasRedirected.current = true;
        router.navigate({ to: decodedPath });
        return;
      } catch (error) {
        console.error('[Index Route] Failed to decode start param:', error);
      }
    }

    // Default redirect to last content menu route
    console.log('[Index Route] No deep link, redirecting to:', lastContentMenuRoute);
    hasRedirected.current = true;
    router.navigate({ to: lastContentMenuRoute });
  }, [startParam, router, lastContentMenuRoute, isTelegramEnv]);

  // Return null while redirecting
  return null;
}
