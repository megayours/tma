import type { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import { Link } from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthenticating, isTelegram } = useAuthContext();

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
          href={`${import.meta.env.VITE_API_URL}/auth/discord/authorize?state=${encodeURIComponent('/')}&redirect_base_url=${encodeURIComponent(window.location.origin)}`}
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

  return <>{children}</>;
}
