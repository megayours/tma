import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useSession } from '@/auth/SessionProvider';
import { Blockquote, Button } from '@telegram-apps/telegram-ui';
import { requestWriteAccess } from '@telegram-apps/sdk-react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useStickerPackExecutions } from '@/hooks/useStickerPack';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useGetContents, useContentExecutions } from '@/hooks/useContents';
import { GenerationsTimeline } from './GenerationsTimeline';
import { useSelectCommunity } from '../../../contexts/SelectCommunityContext';

export const Route = createFileRoute('/_main/profile/')({
  component: ProfileLayout,
});

function NotificationButton() {
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const { data } = useGetContents(session, session?.id!, selectedCommunity?.id!);
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
          <div className="bg-tg-button absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
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

function PendingExecutionsWidget() {
  const { session } = useSession();
  const { data: stickerExecutions } = useStickerPackExecutions(
    { status: 'processing', pagination: { page: 1, size: 8 } },
    session
  );
  const { data: contentExecutions } = useContentExecutions(session);

  const stickerCount = stickerExecutions?.data?.length || 0;
  const contentCount =
    contentExecutions?.executions?.filter(
      e => e.status === 'pending' || e.status === 'processing'
    ).length || 0;

  const totalCount = stickerCount + contentCount;

  if (totalCount === 0) return null;

  return (
    <div className="bg-tg-secondary-bg rounded-xl p-4">
      <h2 className="text-tg-text mb-3 text-sm font-semibold">
        Generations in Progress
      </h2>
      <div className="space-y-2">
        {contentCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-tg-hint text-xs">Content</span>
            <div className="flex items-center gap-2">
              <span className="text-tg-text text-xs font-medium">
                {contentCount} pending
              </span>
              {contentExecutions?.executions?.[0] && (
                <Link
                  to="/content/$promptId/processing/$executionId"
                  params={{
                    promptId: 'view',
                    executionId: contentExecutions.executions[0].execution_id,
                  }}
                  className="text-tg-link text-xs"
                >
                  View →
                </Link>
              )}
            </div>
          </div>
        )}
        {stickerCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-tg-hint text-xs">Sticker Packs</span>
            <div className="flex items-center gap-2">
              <span className="text-tg-text text-xs font-medium">
                {stickerCount} processing
              </span>
              {stickerExecutions?.data?.[0] && (
                <Link
                  to="/sticker-packs/$stickerPackId/processing/$executionId"
                  params={{
                    stickerPackId:
                      stickerExecutions.data[0].bundle.id.toString(),
                    executionId: stickerExecutions.data[0].id,
                  }}
                  className="text-tg-link text-xs"
                >
                  View →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthorizeBotMessages() {
  const launchParams = useLaunchParams(true);
  const allowsWriteToPm = launchParams?.tgWebAppData?.user?.allowsWriteToPm;

  const handleRequestAccess = async () => {
    if (requestWriteAccess.isAvailable()) {
      try {
        const result = await requestWriteAccess();
        console.log('Write access result:', result);
      } catch (err) {
        console.error('Write access error:', err);
      }
    } else {
      console.log('requestWriteAccess is not available');
    }
  };

  if (!allowsWriteToPm) {
    return (
      <Blockquote type="text">
        <span className="text-tg-button">
          Authorize Bot Messages Allowed: {allowsWriteToPm ? 'Yes' : 'No'}
        </span>
        <Button mode="filled" size="s" onClick={handleRequestAccess}>
          Request Access
        </Button>
      </Blockquote>
    );
  }

  return null;
}

export function ProfileLayout() {
  const { isTelegram } = useTelegramTheme();

  return (
    <ProtectedRoute>
      <div className="profile-layout h-screen">
        {/* This renders the index content when at /profile */}
        <main className="flex h-full flex-col p-6">
          <div className="flex flex-row items-center justify-between gap-2">
            <h1 className="text-tg-text text-2xl font-bold">My Artworks</h1>
            <div className="flex items-center gap-2">
              <CreatePromptDropdownButton />
              <NotificationButton />
            </div>
          </div>
          <PendingExecutionsWidget />
          {isTelegram && (
            <div>
              <AuthorizeBotMessages />
            </div>
          )}

          {/* REMOVED FILTERS AS IT WAS A BIT BUGGED*/}
          {/* Content Type Filters */}
          {/* <div className="border-tg-section-separator border-b pb-3">
            <ProfileFilters
              contentTypes={contentTypes}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              typeButtonsRef={typeButtonsRef}
            />
          </div> */}

          {/* Timeline with filter */}
          <GenerationsTimeline />
        </main>
      </div>
      <div className="h-20"></div>
    </ProtectedRoute>
  );
}
