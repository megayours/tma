import { useAuth } from '@/auth/useAuth';
import { ProfileNavBar } from './ProfileNavBar';

import { Link } from '@tanstack/react-router';

export function NavBar() {
  const { logout, isAuthenticated, session } = useAuth();
  console.log('session', session);

  return (
    <>
      {/* <Section
        title="Navigation"
        description="Navigate to different pages"
      ></Section> */}
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
        <Link
          to="/post"
          className="tg-link px-2 py-1 hover:opacity-80 [&.active]:font-bold"
        >
          Post
        </Link>
        <Link
          to="/private"
          className="tg-link px-2 py-1 hover:opacity-80 [&.active]:font-bold"
        >
          Private
        </Link>
        {isAuthenticated && session && (
          <ProfileNavBar logout={logout} session={session} />
        )}
      </div>
    </>
  );
}
