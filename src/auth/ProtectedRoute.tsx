import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { Link } from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthenticating, isTelegram, user, logout } =
    useAuth();

  // Add your authentication logic here
  // For now, just render children

  if (isAuthenticating) {
    return <div>Loading... isTelegram: {isTelegram ? 'true' : 'false'}</div>;
  }

  if (!isAuthenticated && !isTelegram) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Login with Discord</h1>
        <a
          href={`https://yours-fun-api.testnet.megayours.com/v1/auth/discord/authorize?state=${encodeURIComponent(window.location.pathname)}`}
          className="inline-block rounded bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Login with Discord
        </a>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h2 className="mb-4 text-xl font-semibold">Not Authenticated</h2>
        <p className="mb-4">isTelegram: {isTelegram ? 'true' : 'false'}</p>
        {user && (
          <div className="mb-4 rounded bg-gray-100 p-3">
            <p>User: {user.user?.username || user.username || 'Unknown'}</p>
          </div>
        )}
        <Link
          to="/"
          search={{
            success: undefined,
            error: undefined,
            message: undefined,
            user: undefined,
          }}
          className="text-blue-600 hover:underline"
        >
          Login here
        </Link>
      </div>
    );
  }

  return (
    <div>
      {user && (
        <div className="border-b bg-gray-100 p-2">
          <div className="flex items-center justify-between">
            <span>
              Welcome, {user.user?.username || user.username || 'User'}!
            </span>
            <button
              onClick={logout}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
