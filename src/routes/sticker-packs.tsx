import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';

export const Route = createFileRoute('/sticker-packs')({
  component: () => (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  ),
});
