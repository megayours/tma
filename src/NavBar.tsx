import { useAuth } from '@/auth/useAuth';

import { Link } from '@tanstack/react-router';

export function Navbar() {
  const { logout, isAuthenticated } = useAuth();

  return (
    <>
      {/* <Section
        title="Navigation"
        description="Navigate to different pages"
      ></Section> */}
      <div className="bg-tg-bg text-tg-text flex h-full w-full items-center justify-around p-2">
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
        {isAuthenticated && (
          <button
            onClick={logout}
            className="tg-button rounded px-3 py-1 text-sm transition-opacity hover:opacity-90"
          >
            Logout
          </button>
        )}
      </div>
    </>
  );
}
