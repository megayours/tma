import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '../../auth/ProtectedRoute';
import MyPrompts from '@/components/MyPrompts';

export const Route = createFileRoute('/profile/')({
  component: ProfileLayout,
});

function ProfileLayout() {
  return (
    <ProtectedRoute>
      <div className="profile-layout h-screen">
        {/* This renders the index content when at /profile */}
        <main className="h-screen">
          <div className="flex flex-col gap-2">
            <h1 className="text-tg-text text-2xl font-bold">Your prompts</h1>
            <MyPrompts />
          </div>

          {/* This renders child routes under /profile */}
          {/* <Outlet /> */}
        </main>
      </div>
    </ProtectedRoute>
  );
}
