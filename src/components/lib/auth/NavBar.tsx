import { useAuthContext } from '@/auth/AuthProvider';
import { ProfileNavBar } from './ProfileNavBar';
import { CreatePostButton } from '@/components/ui/CreatePostButton';

import { Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Button } from '@telegram-apps/telegram-ui';

export function NavBar() {
  const { logout, isAuthenticated, isAuthenticating, session } =
    useAuthContext();
  console.log('session', session);

  if (!isAuthenticated) {
    return (
      <div className="bg-tg-bg text-tg-text mb-6 flex h-full w-full items-center justify-around p-4">
        <a
          href={`https://yours-fun-api.testnet.megayours.com/v1/auth/discord/authorize?state=${encodeURIComponent('/')}&redirect_base_url=${encodeURIComponent(window.location.origin)}`}
          className="h-full w-full"
        >
          <Button
            size="l"
            mode="filled"
            stretched={true}
            loading={isAuthenticating}
          >
            Login with Discord
          </Button>
        </a>
      </div>
    );
  }

  return (
    <>
      {/* <Section
        title="Navigation"
        description="Navigate to different pages"
      ></Section> */}
      <ProtectedRoute>
        <div className="bg-tg-bg text-tg-text flex h-full w-full items-center justify-around px-4 py-4 pb-6">
          <Link
            to="/"
            className="tg-link px-2 py-1 hover:opacity-80 [&.active]:font-bold"
          >
            Feed
          </Link>
          <Link
            to="/about"
            className="tg-link px-2 py-1 hover:opacity-80 [&.active]:font-bold"
          >
            About
          </Link>
          <CreatePostButton />
          <Link
            to="/private"
            className="tg-link px-2 py-1 hover:opacity-80 [&.active]:font-bold"
          >
            Private
          </Link>
          {isAuthenticated && session && <ProfileNavBar logout={logout} />}
        </div>
      </ProtectedRoute>
    </>
  );
}
