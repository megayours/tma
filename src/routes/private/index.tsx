import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useAuth } from '@/auth/useAuth';

export const Route = createFileRoute('/private/')({
  component: PrivatePage,
});

function PrivatePage() {
  const { user } = useAuth();
  console.log('user', user);

  if (!user) return <div>No user</div>;
  return (
    <ProtectedRoute>Private Page: Authenticated: {user && user}</ProtectedRoute>
  );
}
