import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '../../auth/ProtectedRoute';

export const Route = createFileRoute('/profile/')({
  component: ProfileLayout,
});

function ProfileLayout() {
  return (
    <ProtectedRoute>
      <div className="profile-layout">
        {/* Optional: Add profile-specific navigation here */}
        <nav className="profile-nav mb-4">
          <h1 className="mb-4 text-2xl font-bold">Profile</h1>
          {/* You can add navigation links here if needed */}
        </nav>

        {/* This renders all child routes under /profile */}
        <main className="profile-content">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
