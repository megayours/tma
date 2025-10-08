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
  useSignal,
} from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { NavBar } from '@/components/lib/auth/NavBar';
import { useTelegramTheme } from '@/auth/useTelegram';
import { ToastProvider } from '@/components/ui';
import { SelectedNFTsProvider } from '@/contexts/SelectedNFTsContext';
import { useSession } from '@/auth/SessionProvider';
import { FavoriteRedirectHandler } from '@/components/FavoriteRedirectHandler';
// import { AddToHomeScreenButton } from '@/components/AddToHomeScreenButton';

function TelegramAppHandler() {
  const location = useLocation();
  const router = useRouter();
  const pathname = location.pathname;
  const { isDark, themeParams, isTelegram } = useTelegramTheme();
  const [isViewportMounted, setIsViewportMounted] = useState(false);
  const [isViewportMounting, setIsViewportMounting] = useState(false);

  useEffect(() => {
    if (isTMA()) {
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
          (message.includes(
            'Invalid type: Expected Object but received null'
          ) ||
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

      // Request fullscreen mode for immersive experience (only after viewport is mounted)
      if (
        isViewportMounted &&
        requestFullscreen &&
        requestFullscreen.isAvailable()
      ) {
        requestFullscreen();
        console.log('Telegram Mini App requested fullscreen mode');
      }

      if (!backButton.isMounted()) {
        backButton.mount();
      }

      // if it is not the home page, show the back button
      if (pathname !== '/') {
        backButton.show();
        backButton.onClick(() => {
          router.history.back();
          console.log('back button clicked');
        });
      }

      // if it is the home page, hide the back button and show the close button
      if (pathname === '/') {
        backButton.hide();
      }

      // Cleanup function to restore original console.error
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, [pathname, router]);

  // Separate useEffect to handle fullscreen request after viewport is mounted
  useEffect(() => {
    if (isTMA() && isViewportMounted && !isViewportMounting) {
      if (requestFullscreen && requestFullscreen.isAvailable()) {
        requestFullscreen();
        console.log('Telegram Mini App requested fullscreen mode');
      }
    }
  }, [isViewportMounted, isViewportMounting]);

  // Log theme information for debugging
  useEffect(() => {
    if (isTelegram) {
      console.log('Telegram Theme:', {
        isDark,
        themeParams,
        isTelegram,
      });
    }
  }, [isDark, themeParams, isTelegram]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useSession();
  const isViewportMounting = useSignal(viewport.isMounting);
  const shouldHideNavBar =
    location.pathname.startsWith('/profile/prompt/edit') ||
    location.pathname.startsWith('/landing') ||
    location.pathname.match('/');
  const isViewportMounted = useSignal(viewport.isMounted);
  const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);
  const viewportSafeAreaInsets = useSignal(viewport.safeAreaInsets);
  const content = (
    <>
      <TelegramAppHandler />
      <AppRoot>
        {isViewportMounted && !isViewportMounting && (
          // Optimistically take the space
          <div
            className="w-full"
            style={{
              marginTop: viewportSafeAreaInsets.top,
              height: contentSafeAreaInsets.top,
            }}
          >
            <div className={`flex h-full items-center justify-center`}>
              {/* <AddToHomeScreenButton /> */}
              <h1 className="text-tg-text text-xl font-bold">Yours.fun</h1>
            </div>
          </div>
        )}

        <main className={`bg-tg-bg h-full`}>
          <Outlet />
        </main>
        {!shouldHideNavBar && (
          <div
            className="fixed right-0 bottom-0 left-0 z-10 flex h-16 items-center"
            style={{
              paddingBottom: `${contentSafeAreaInsets.bottom} px`,
              paddingLeft: `${contentSafeAreaInsets.left} px`,
              paddingRight: `${contentSafeAreaInsets.right} px`,
            }}
          >
            <NavBar />
          </div>
        )}
        {/* <TanStackRouterDevtools /> */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </AppRoot>
    </>
  );

  // Only wrap with SelectedNFTsProvider if user is authenticated
  if (isAuthenticated) {
    return (
      <SelectedNFTsProvider>
        <FavoriteRedirectHandler />
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
        {/* <ConsoleLogDevtools initialIsOpen={true} onReady={handleConsoleReady} /> */}
        {/* {consoleReady && ( */}
        <AppContent />
        {/* )} */}
      </ToastProvider>
    );
  },
});
