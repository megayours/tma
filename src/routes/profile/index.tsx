import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '../../auth/ProtectedRoute';
import { StickerList } from './StickerList';
import { useSession } from '../../auth/SessionProvider';
import { Button } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/profile/')({
  component: ProfileLayout,
});

function CreatePromptDropdownButton() {
  const { session } = useSession();
  console.log('session', session);
  if (session?.role && parseInt(session.role) < 1) return null;
  return (
    <Link to="/profile/admin">
      <Button mode="plain" size="l">
        <span className="text-tg-button">Admin</span>
      </Button>
    </Link>
  );
}

function ProfileLayout() {
  return (
    <ProtectedRoute>
      <div className="profile-layout h-screen">
        {/* This renders the index content when at /profile */}
        <main className="flex h-full flex-col gap-4 p-4">
          <div className="flex flex-row items-center justify-between gap-2">
            <h1 className="text-tg-text text-2xl font-bold">
              My Sticker Packs
            </h1>
            <CreatePromptDropdownButton />
          </div>
          <StickerList />
        </main>
      </div>
    </ProtectedRoute>
  );
}
