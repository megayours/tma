import type { ReactNode } from 'react';
import { useAuth } from './useAuth';
import { Link } from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isAuthenticating, isTelegram, user } = useAuth();
  // Add your authentication logic here
  // For now, just render children

  console.log('isAuthenticated', isAuthenticated);
  console.log('isAuthenticating', isAuthenticating);
  console.log('useaaaaar', user);

  if (isAuthenticating) {
    return <div>Loading... isTelegram: {isTelegram ? 'true' : 'false'}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        Not authenticated <Link to="/">Login here</Link>
        isTelegram: {isTelegram ? 'true' : 'false'}
        {user && <div>{user.user.username}</div>}
      </div>
    );
  }

  return <>{children}</>;
}
