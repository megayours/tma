import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

export const Route = createFileRoute('/profile/prompt/new/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <div>Hello "/profile/prompt/new/"!</div>
    </ProtectedRoute>
  );
}
