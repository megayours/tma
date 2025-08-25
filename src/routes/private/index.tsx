import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useAuth } from '@/auth/useAuth';

export const Route = createFileRoute('/private/')({
  component: PrivatePage,
});

function PrivatePage() {
  const { session, isAuthenticated } = useAuth();
  console.log('session', session);

  return (
    <ProtectedRoute>
      Private Page: Authenticated: {isAuthenticated ? 'Yes' : 'No'} Username:{' '}
      {session && session.username} ID: {session && session.id}
    </ProtectedRoute>
  );
}
