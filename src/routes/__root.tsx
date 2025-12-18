import {
  createRootRoute,
  Outlet,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { isTMA } from '@telegram-apps/bridge';
import {
  init,
  backButton,
  expandViewport,
  requestFullscreen,
  viewport,
  miniApp,
  swipeBehavior,
  closingBehavior,
} from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { useTelegramTheme } from '@/auth/useTelegram';
import { ToastProvider } from '@/components/ui';
import { SelectedNFTsProvider } from '@/contexts/SelectedNFTsContext';
import {
  SelectCommunityProvider,
  useSelectCommunity,
} from '@/contexts/SelectCommunityContext';
import { useSession } from '@/auth/SessionProvider';
import {
  NavigationHistoryProvider,
  useNavigationHistory,
} from '@/contexts/NavigationHistoryContext';

function TelegramEnvironmentHandler() {
  const location = useLocation();
  const router = useRouter();
  const pathname = location.pathname;
  const { isDark, themeParams } = useTelegramTheme();
  const [isViewportMounted, setIsViewportMounted] = useState(false);
  const [isViewportMounting, setIsViewportMounting] = useState(false);
  const { lastContentMenuRoute } = useNavigationHistory();

  console.log('ROUTE', location);

  useEffect(() => {
    init();

    // Add global error handler for Telegram SDK validation errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Suppress known Telegram SDK validation errors that don't affect functionality
      const firstArg = args[0];
      const message = firstArg?.message || firstArg?.toString?.() || '';
      const fullMessage = args.join(' ');

      // Check for viewport_changed ValiError
      if (
        (message.includes('viewport_changed') ||
          fullMessage.includes('viewport_changed')) &&
        (message.includes('Invalid type: Expected Object but received null') ||
          fullMessage.includes(
            'Invalid type: Expected Object but received null'
          ) ||
          firstArg?.name === 'ValiError')
      ) {
        // Silently ignore this known Telegram app bug
        return;
      }

      // Log all other errors normally
      originalConsoleError(...args);
    };

    // Mount viewport first if not already mounted
    if (viewport.mount.isAvailable() && !viewport.isMounted()) {
      setIsViewportMounting(true);
      try {
        const mountPromise = viewport.mount();
        mountPromise
          .then(() => {
            setIsViewportMounted(true);
            setIsViewportMounting(false);
            console.log('Viewport mounted successfully');
          })
          .catch(err => {
            console.error('Failed to mount viewport:', err);
            setIsViewportMounting(false);
            setIsViewportMounted(false);
          });
      } catch (err) {
        console.error('Error mounting viewport:', err);
        setIsViewportMounting(false);
        setIsViewportMounted(false);
      }
    } else if (viewport.isMounted()) {
      setIsViewportMounted(true);
    }

    // Expand the app to full screen using the proper SDK method
    if (expandViewport.isAvailable()) {
      expandViewport();
      console.log('Telegram Mini App expanded to full screen');
    }

    // Mount miniApp if not already mounted
    if (!miniApp.isMounted() && miniApp.mountSync.isAvailable()) {
      try {
        miniApp.mountSync();
        console.log('Mini App mounted successfully');
      } catch (err) {
        console.error('Error mounting mini app:', err);
      }
    }

    // Set header color to orange for Telegram
    if (miniApp.setHeaderColor.isAvailable() && miniApp.isMounted()) {
      miniApp.setHeaderColor('#FFFFFF');
      console.log('Telegram Mini App header color set to orange');
    }

    // Enable vertical swipe behavior
    if (!swipeBehavior.isMounted()) {
      swipeBehavior.mount();
    }
    if (swipeBehavior.disableVertical.isAvailable()) {
      swipeBehavior.disableVertical();
      console.log('Vertical swipe disabled');
    }

    if (!backButton.isMounted()) {
      backButton.mount();
    }

    // Mount closing behavior for close button
    if (!closingBehavior.isMounted() && closingBehavior.mount.isAvailable()) {
      closingBehavior.mount();
    }

    // Platform detection
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Check if this is the first page (no history to go back to)
    const hasHistoryStack = window.history.length > 1;
    const isFirstPage = !hasHistoryStack;

    console.log('[Navigation] State', {
      pathname,
      historyLength: window.history.length,
      isFirstPage,
      lastContentMenuRoute,
    });

    if (isFirstPage) {
      // First page: hide back button, enable close button
      backButton.hide();
      if (closingBehavior.enableConfirmation.isAvailable()) {
        closingBehavior.enableConfirmation();
      }
      console.log('[Navigation] First page - showing close behavior');
    } else {
      // Not first page: show back button, disable close confirmation
      backButton.show();
      if (closingBehavior.disableConfirmation.isAvailable()) {
        closingBehavior.disableConfirmation();
      }

      backButton.onClick(() => {
        console.log('[BackButton] Clicked', {
          platform: isAndroid ? 'Android' : isIOS ? 'iOS' : 'Unknown',
          historyLength: window.history.length,
          currentPath: pathname,
          lastContentMenuRoute,
        });

        // Smart fallback for Android WebView history issues
        if (window.history.length > 1) {
          // Try normal history.back() first
          router.history.back();
        } else {
          // History stack is too short (Android issue), use explicit fallback
          console.log(
            '[BackButton] History stack too short, falling back to:',
            lastContentMenuRoute
          );
          router.navigate({ to: lastContentMenuRoute });
        }
      });
      console.log('[Navigation] Not first page - showing back button');
    }

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError;
    };
  }, [pathname, router, lastContentMenuRoute]);

  // Separate useEffect to handle fullscreen request after viewport is mounted
  useEffect(() => {
    if (isViewportMounted && !isViewportMounting) {
      if (requestFullscreen && requestFullscreen.isAvailable()) {
        requestFullscreen();
        console.log('Telegram Mini App requested fullscreen mode');
      }
    }
  }, [isViewportMounted, isViewportMounting]);

  // Log theme information for debugging
  useEffect(() => {
    console.log('Telegram Theme:', {
      isDark,
      themeParams,
      isTelegram: true,
    });
  }, [isDark, themeParams]);

  return null;
}

function WebEnvironmentHandler() {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    console.log('Running in web environment');
    console.log('Current pathname:', pathname);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { isAuthenticated } = useSession();
  const isTelegramEnvironment = isTMA();
  const location = useLocation();
  const router = useRouter();
  const {
    selectedCommunity,
    availableCommunities,
    isLoading: isCommunityLoading,
  } = useSelectCommunity();

  // Redirect to community selection if authenticated but no community selected
  useEffect(() => {
    const pathname = location.pathname;

    // Paths that don't require community selection
    const excludedPaths = ['/selectCommunity'];
    const isExcludedPath =
      excludedPaths.includes(pathname) || pathname.startsWith('/auth');

    // Don't redirect if:
    // - Still loading communities
    // - Only 1 community available (will be auto-selected)
    // - Already have a selected community
    // - On an excluded path
    const shouldSkipRedirect =
      isCommunityLoading ||
      availableCommunities.length === 1 ||
      selectedCommunity ||
      isExcludedPath;

    const needsCommunitySelection =
      isAuthenticated && !shouldSkipRedirect && availableCommunities.length > 1;

    console.log(
      `[Community Redirect] pathname=${pathname}, isAuthenticated=${isAuthenticated}, isCommunityLoading=${isCommunityLoading}, selectedCommunity=${selectedCommunity?.name || 'null'}, availableCommunitiesCount=${availableCommunities.length}, isExcludedPath=${isExcludedPath}, needsRedirect=${needsCommunitySelection}`
    );

    if (needsCommunitySelection) {
      console.log(
        `[Community Redirect] Redirecting to /selectCommunity (redirectTo=${pathname})`
      );
      router.navigate({
        to: '/selectCommunity',
        search: {
          redirectTo: pathname,
        },
      });
    }
  }, [
    isAuthenticated,
    selectedCommunity,
    availableCommunities,
    isCommunityLoading,
    location.pathname,
    router,
  ]);

  const content = (
    <>
      {isTelegramEnvironment ? (
        <TelegramEnvironmentHandler />
      ) : (
        <WebEnvironmentHandler />
      )}
      <div className="">
        <Header />
        <main className={`h-full`}>
          <Outlet />
        </main>

        {/* <UserMenuComponent size={35} /> */}
        {/* <TanStackRouterDevtools /> */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </div>
    </>
  );

  // Only wrap with SelectedNFTsProvider if user is authenticated
  if (isAuthenticated) {
    return (
      <SelectedNFTsProvider>
        {/* <FavoriteRedirectHandler /> */}
        {content}
      </SelectedNFTsProvider>
    );
  }

  return content;
}

export const Route = createRootRoute({
  component: () => {
    return (
      <ToastProvider>
        <NavigationHistoryProvider>
          <SelectCommunityProvider>
            {/* <ConsoleLogDevtools initialIsOpen={true} onReady={handleConsoleReady} /> */}
            {/* {consoleReady && ( */}
            <AppContent />
            {/* )} */}
          </SelectCommunityProvider>
        </NavigationHistoryProvider>
      </ToastProvider>
    );
  },
});
