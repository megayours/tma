import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
  useRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { isTMA } from '@telegram-apps/bridge';
import { init, backButton } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navbar } from '@/NavBar';
import { useTelegramTheme } from '@/auth/useTelegram';

function TelegramAppHandler() {
  const location = useLocation();
  const router = useRouter();
  const pathname = location.pathname;
  const { isDark, themeParams, isTelegram } = useTelegramTheme();

  useEffect(() => {
    if (isTMA()) {
      init();
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
    return (
      <>
        <TelegramAppHandler />
        <AppRoot>
          <div className="bg-tg-bg h-screen">
            <main className="bg-tg-bg flex-grow pb-16">
              <Outlet />
            </main>
            <div className="bg-tg-link border-tg-section-separator fixed right-0 bottom-0 left-0 z-10 flex h-16 items-center border-t">
              <Navbar />
            </div>
            {/* <TanStackRouterDevtools /> */}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </div>
        </AppRoot>
      </>
    );
  },
});
