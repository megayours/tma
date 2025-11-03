import { createFileRoute, Link } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { StickerList } from './StickerList';
import { useSession } from '@/auth/SessionProvider';
import { Blockquote, Button } from '@telegram-apps/telegram-ui';
import { requestWriteAccess } from '@telegram-apps/sdk-react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useStickerPackExecutions } from '@/hooks/useStickerPack';
import { useTelegramTheme } from '@/auth/useTelegram';

export const Route = createFileRoute('/_main/profile/')({
  component: ProfileLayout,
});

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
            <h1 className="text-tg-text text-2xl font-bold">
              My Sticker Packs
            </h1>
            <CreatePromptDropdownButton />
          </div>
          {isTelegram && (
            <div>
              <AuthorizeBotMessages />
            </div>
          )}
          <StickerList />
        </main>
      </div>
    </ProtectedRoute>
  );
}
