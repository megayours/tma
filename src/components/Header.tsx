import { Link } from '@tanstack/react-router';
import { viewport, useSignal } from '@telegram-apps/sdk-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useStickerPackExecutions } from '../hooks/useStickerPack';
import { useSession } from '../auth/SessionProvider';
import { useTelegramTheme } from '../auth/useTelegram';
import { useCommunityId } from '../hooks/useCommunities';

const ProcessingBadge = () => {
  const { session } = useSession();
  const { data: processingExecutions } = useStickerPackExecutions(
    { status: 'processing' },
    session
  );

  const totalPrompts =
    processingExecutions?.data.reduce(
      (acc, execution) => acc + execution.total_prompts,
      0
    ) || 0;
  const completedPrompts =
    processingExecutions?.data.reduce(
      (acc, execution) => acc + execution.completed_prompts,
      0
    ) || 0;

  const processingCount = processingExecutions?.data?.length || 0;
  const hasProcessing = processingCount > 0;
  const progressPercentage =
    totalPrompts > 0 ? (completedPrompts / totalPrompts) * 100 : 0;

  if (!hasProcessing) return null;

  return (
    <Link
      to="/profile"
      className="relative flex flex-row items-center gap-1 overflow-hidden rounded-full bg-blue-300 px-2 py-0.5 transition-all hover:brightness-110 active:scale-95"
      title={`${processingCount} sticker pack${processingCount > 1 ? 's' : ''} generating... (${completedPrompts}/${totalPrompts} prompts)`}
    >
      {/* Progress bar background */}
      <div
        className="absolute inset-0 bg-blue-600 transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      />

      {/* Content on top of progress bar */}
      <div className="relative z-10 flex flex-row items-center gap-1">
        <div className="h-3 w-3">
          <DotLottieReact
            src="/lotties/loader.lottie"
            loop
            autoplay
            className="h-full w-full"
          />
        </div>
        <span className="text-[10px] font-medium text-white">
          {processingCount}
        </span>
      </div>
    </Link>
  );
};

const HeaderBrand = () => {
  const { isDark } = useTelegramTheme();
  const communityId = useCommunityId();
  console.log('HeaderBrand render, communityId:', communityId);
  // TODO: Use communityId for community-specific logic
  void communityId;

  return (
    <div className="flex flex-row items-center gap-2">
      <Link to="/">
        <h1
          className={`text-xl font-bold ${
            isDark ? 'text-[#03FFC2]' : 'text-black'
          }`}
        >
          Yours.fun
        </h1>
      </Link>
      <ProcessingBadge />
    </div>
  );
};

export const Header = () => {
  const isViewportMounted = useSignal(viewport.isMounted);
  const isViewportMounting = useSignal(viewport.isMounting);
  const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);
  const viewportSafeAreaInsets = useSignal(viewport.safeAreaInsets);

  return (
    <>
      {isViewportMounted && !isViewportMounting && (
        // Optimistically take the space
        <div
          className="w-full"
          style={{
            marginTop: viewportSafeAreaInsets.top,
            height: contentSafeAreaInsets.top,
          }}
        >
          <div
            className={`flex h-full flex-row items-center justify-center gap-4`}
          >
            <HeaderBrand />
          </div>
        </div>
      )}

      {!isViewportMounted && (
        <div
          className="flex h-12 items-center justify-end p-4"
          style={{
            marginTop:
              contentSafeAreaInsets.top + viewportSafeAreaInsets.top + 5,
          }}
        >
          {!isViewportMounted && (
            <div className="absolute left-1/2 -translate-x-1/2">
              <HeaderBrand />
            </div>
          )}
        </div>
      )}
    </>
  );
};
