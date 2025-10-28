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
  secondaryButton,
} from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { UserMenuComponent } from '@/components/lib/auth/FavoriteNFT';
import { Header } from '@/components/Header';
import { useTelegramTheme } from '@/auth/useTelegram';
import { ToastProvider } from '@/components/ui';
import { SelectedNFTsProvider } from '@/contexts/SelectedNFTsContext';
import { useSession } from '@/auth/SessionProvider';
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
  const { isAuthenticated } = useSession();
  const content = (
    <>
      <TelegramAppHandler />
      <AppRoot className="bg-tg-bg">
        <Header />
        <main className={`h-full`}>
          <Outlet />
        </main>

        {/* <UserMenuComponent size={35} /> */}
        {/* <TanStackRouterDevtools /> */}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </AppRoot>
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
        {/* <ConsoleLogDevtools initialIsOpen={true} onReady={handleConsoleReady} /> */}
        {/* {consoleReady && ( */}
        <AppContent />
        {/* )} */}
      </ToastProvider>
    );
  },
});
