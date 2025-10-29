import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../../../auth/ProtectedRoute';
import MyPrompts from '@/components/MyPrompts';
import { useSession } from '@/auth/SessionProvider';
import { Button } from '@telegram-apps/telegram-ui';
import { PreviewContent } from './PreviewContent';

export const Route = createFileRoute('/profile/admin/')({
  component: ProfileLayout,
});

function RenderAdmin() {
  const { session } = useSession();
  if (!session) {
    return <div>No session available</div>;
  }
  if (parseInt(session.role) < 1) {
    return <div>You are not an admin</div>;
  }
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl">Latest Prompt Creations</h1>
      <PreviewContent />
      <div className="flex flex-row justify-between">
        <h1 className="text-tg-text text-2xl font-bold">Your prompts</h1>
        <Link to="/profile/prompt/create">
          <Button mode="filled" size="s">
            <span className="text-tg-button-text">Create</span>
          </Button>
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
        <main className="h-full pb-16">
          <RenderAdmin />
        </main>
      </div>
    </ProtectedRoute>
  );
}
