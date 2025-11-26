import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import MyPrompts from '@/components/MyPrompts';
import { RecentlyUsedPrompts } from '@/components/RecentlyUsedPrompts';
import { useSession } from '@/auth/SessionProvider';

export const Route = createFileRoute('/_main/profile/admin/')({
  component: ProfileLayout,
});

function RenderAdmin() {
  const { session } = useSession();
  if (!session) {
    return <div>No session available</div>;
  }
  if (isNaN(parseInt(session.role)) || parseInt(session.role) < 1) {
    return <div>You are not an admin</div>;
  }
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      {/* Recently Used Section */}
      <RecentlyUsedPrompts />

      {/* Your Prompts Section */}
      <div className="flex flex-row justify-between">
        <h1 className="text-tg-text text-2xl font-bold">Your prompts</h1>
        <Link to="/profile/admin/prompt/create">
          <div className="bg-tg-button flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-sm font-semibold">
            <span className="text-tg-button-text">Create</span>
          </div>
        </Link>
      </div>
      <MyPrompts />
    </div>
  );
}

function ProfileLayout() {
  return (
    <ProtectedRoute>
      <div className="profile-layout h-screen">
        {/* This renders the index content when at /profile */}
        <main className="pb-16">
          <div className="bg-tg-bg rounded-l-xl px-2">
            <RenderAdmin />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
