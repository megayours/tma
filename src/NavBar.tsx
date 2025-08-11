import { useAuth } from '@/auth/useAuth';
import { Link } from '@tanstack/react-router';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <>
      <div className="tg-text flex h-full w-full items-center justify-around p-2">
        <Link
          to="/"
          className="tg-link px-2 py-1 hover:opacity-80 [&.active]:font-bold"
        >
          Home
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
      </div>
      {isAuthenticated && (
        <div className="bg-tg-link tg-text border-tg-section-separator border-t p-2">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold">Hello {user?.username}</h1>
            <button
              onClick={logout}
              className="tg-button rounded px-3 py-1 text-sm transition-opacity hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}
