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

function TelegramAppHandler() {
  const location = useLocation();
  const router = useRouter();
  const pathname = location.pathname;

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

  return null;
}

export const Route = createRootRoute({
  component: () => (
    <>
      <TelegramAppHandler />
      <div className="flex gap-2 p-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>{' '}
        <Link to="/post" className="[&.active]:font-bold">
          Post
        </Link>{' '}
        <Link to="/private" className="[&.active]:font-bold">
          Private
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  ),
});
