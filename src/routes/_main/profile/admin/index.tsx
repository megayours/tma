import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import MyPrompts from '@/components/MyPrompts';
import { RecentlyUsedPrompts } from '@/components/RecentlyUsedPrompts';
import { useSession } from '@/auth/SessionProvider';
import { useSelectCommunity } from '../../../../contexts/SelectCommunityContext';

export const Route = createFileRoute('/_main/profile/admin/')({
  component: ProfileLayout,
});

function RenderAdmin() {
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();

  const canCreatePrompts = session?.communityPermissions?.some(
    perm =>
      perm.communityId === selectedCommunity?.id &&
      perm.permissions.includes('prompt_editor')
  );
  if (!session && !selectedCommunity) {
    return <div>No session available</div>;
  }
  console.log('ACCOUNT ROLE:', session);
  if (canCreatePrompts !== true) {
    return (
      <div className="flex min-h-screen flex-col items-center gap-6 px-4">
        <div className="relative h-80 w-full max-w-xs">
          <img
            src="/no-access.jpg"
            alt="Access Denied"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-tg-text text-2xl font-bold">Access Denied</h2>
          <p className="text-tg-hint text-base">
            You don't have permission to access this area, yet.
          </p>
        </div>
        <Link to="/profile">
          <div className="bg-tg-button flex cursor-pointer items-center justify-center rounded-full px-6 py-3 text-base font-semibold">
            <span className="text-tg-button-text">Go Back to Profile</span>
          </div>
        </Link>
      </div>
    );
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
