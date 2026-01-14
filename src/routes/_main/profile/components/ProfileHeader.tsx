import { Link } from '@tanstack/react-router';
import { Button } from '@telegram-apps/telegram-ui';
import { useSession } from '@/auth/SessionProvider';
import { useGetContents } from '@/hooks/useContents';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

function NotificationButton() {
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const { data } = useGetContents(
    session,
    session?.id!,
    selectedCommunity?.id!
  );
  const unreadCount =
    data?.contents?.filter(c => c.revealedAt === null).length || 0;

  return (
    <Link to="/profile/notifications">
      <div className="relative cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="text-tg-text h-7 w-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <div className="bg-tg-button absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </div>
    </Link>
  );
}

function CreatePromptDropdownButton() {
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const canCreatePrompts = session?.communityPermissions?.some(
    perm =>
      perm.communityId === selectedCommunity?.id &&
      perm.permissions.includes('prompt_editor')
  );
  if (canCreatePrompts !== true) return null;
  return (
    <Link to="/profile/admin">
      <Button mode="plain" size="l">
        <span className="text-tg-button">Create</span>
      </Button>
    </Link>
  );
}

export function ProfileHeader() {
  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <h1 className="text-tg-text text-2xl font-bold">My Artworks</h1>
      <div className="flex items-center gap-2">
        <CreatePromptDropdownButton />
        <NotificationButton />
      </div>
    </div>
  );
}
