import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useAuth } from '@/auth/useAuth';

export const Route = createFileRoute('/private/')({
  component: PrivatePage,
});

function PrivatePage() {
  const { user, isAuthenticated } = useAuth();
  console.log('user', user);

  return (
    <ProtectedRoute>
      Private Page: Authenticated: {isAuthenticated ? 'Yes' : 'No'} Username:{' '}
      {user && user.username} ID: {user && user.id}
    </ProtectedRoute>
  );
}
