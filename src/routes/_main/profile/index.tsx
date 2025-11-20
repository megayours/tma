import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { StickerList } from './StickerList';
import { useSession } from '@/auth/SessionProvider';
import { Blockquote, Button } from '@telegram-apps/telegram-ui';
import { requestWriteAccess } from '@telegram-apps/sdk-react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useStickerPackExecutions } from '@/hooks/useStickerPack';
import { ContentList } from './ContentList';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useGetContents } from '@/hooks/useContents';

export const Route = createFileRoute('/_main/profile/')({
  component: ProfileLayout,
});

function NotificationButton() {
  const { session } = useSession();
  const { data } = useGetContents(session, session?.id!);
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
  if (session?.role && parseInt(session.role) < 1) return null;
  return (
    <Link to="/profile/admin">
      <Button mode="plain" size="l">
        <span className="text-tg-button">Admin</span>
      </Button>
    </Link>
  );
}

function AuthorizeBotMessages() {
  // const isRequesting = useSignal(isRequestingWriteAccess);
  // const writeAccessPromise = useSignal(requestWriteAccessPromise);
  const launchParams = useLaunchParams(true);
  const allowsWriteToPm = launchParams?.tgWebAppData?.user?.allowsWriteToPm;
  const { session } = useSession();
  const { data: processingExecutions } = useStickerPackExecutions(
    { status: 'processing', pagination: { page: 1, size: 1 } },
    session
  );

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

  if (
    allowsWriteToPm &&
    processingExecutions?.data?.length &&
    processingExecutions.data.length > 0
  ) {
    return (
      <Blockquote type="text">
        <h1 className="text-tg-accent-text text-sm font-semibold">
          Generation in progress
        </h1>
        <span className="text-tg-button text-xs">
          You'll receive notifications in the{' '}
          <a
            href={import.meta.env.VITE_PUBLIC_BOT_URL}
            className="text-tg-link underline"
          >
            chat
          </a>{' '}
          when ready.
        </span>
      </Blockquote>
    );
  }

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
        <main className="flex h-full flex-col gap-4 p-6">
          <div className="flex flex-row items-center justify-between gap-2">
            <h1 className="text-tg-text text-2xl font-bold">My Artworks</h1>
            <div className="flex items-center gap-2">
              <CreatePromptDropdownButton />
              <NotificationButton />
            </div>
          </div>
          {isTelegram && (
            <div>
              <AuthorizeBotMessages />
            </div>
          )}
          <ContentList />
          <StickerList />
        </main>
      </div>
      <div className="h-20"></div>
    </ProtectedRoute>
  );
}
