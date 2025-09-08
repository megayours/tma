import {
  createRootRoute,
  Outlet,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { isTMA } from '@telegram-apps/bridge';
import { init, backButton, expandViewport } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { NavBar } from '@/components/lib/auth/NavBar';
import { useTelegramTheme } from '@/auth/useTelegram';
import { ToastProvider } from '@/components/ui';

function TelegramAppHandler() {
  const location = useLocation();
  const router = useRouter();
  const pathname = location.pathname;
  const { isDark, themeParams, isTelegram } = useTelegramTheme();

  useEffect(() => {
    if (isTMA()) {
      init();

      // Expand the app to full screen using the proper SDK method
      if (expandViewport.isAvailable()) {
        expandViewport();
        console.log('Telegram Mini App expanded to full screen');
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
    }
  }, [pathname, router]);

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

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    const shouldHideNavBar = location.pathname.startsWith(
      '/profile/prompt/edit'
    );

    return (
      <ToastProvider>
        {/* <ConsoleLogDevtools initialIsOpen={true} onReady={handleConsoleReady} /> */}
        {/* {consoleReady && ( */}
        <>
          <TelegramAppHandler />
          <AppRoot>
            <div className="bg-tg-bg h-screen overflow-hidden">
              <main
                className={`bg-tg-bg h-full overflow-y-auto ${shouldHideNavBar ? '' : 'pb-16'}`}
              >
                <Outlet />
              </main>
              {!shouldHideNavBar && (
                <div className="fixed right-0 bottom-0 left-0 z-10 flex h-16 items-center">
                  <NavBar />
                </div>
              )}
              {/* <TanStackRouterDevtools /> */}
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </div>
          </AppRoot>
        </>
        {/* )} */}
      </ToastProvider>
    );
  },
});
