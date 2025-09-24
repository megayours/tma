import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useTelegramTheme } from '@/auth/useTelegram';

interface SuccessSearch {
  executionId?: string;
}

export const Route = createFileRoute('/sticker-packs/$stickerPackId/success')({
  validateSearch: (search): SuccessSearch => ({
    executionId: search.executionId as string,
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { stickerPackId } = Route.useParams();
  const { executionId } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const [showConfetti, setShowConfetti] = useState(true);

  const {
    data: stickerPack,
    isLoading,
  } = useStickerPack(stickerPackId, session);

  // Success haptic feedback and hide confetti after 3 seconds
  useEffect(() => {
    // Trigger success haptic feedback
    if (isTelegram) {
      try {
        if (hapticFeedback && hapticFeedback.notificationOccurred) {
          hapticFeedback.notificationOccurred('success');
        }
      } catch (error) {
        console.warn('SuccessPage: Haptic feedback not available:', error);
      }
    }

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isTelegram]);

  const handleBackToStickerPack = () => {
    navigate({
      to: '/sticker-packs/$stickerPackId',
      params: { stickerPackId },
      search: { executionId },
    });
  };

  const handleViewMyPacks = () => {
    navigate({
      to: '/profile/my-sticker-packs',
    });
  };

  const handleGoHome = () => {
    navigate({
      to: '/',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 min-h-screen flex flex-col items-center justify-center">
      {/* Confetti animation */}
      {showConfetti && (
        <DotLottieReact
          className="pointer-events-none fixed bottom-0 left-1/2 z-50 h-2/3 w-[150vw] -translate-x-1/2"
          src="/lotties/confetti-full.lottie"
          loop={false}
          autoplay
        />
      )}

      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="text-6xl mb-4">🎉</div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-tg-text">
          Payment Successful!
        </h1>

        <div className="space-y-2">
          <p className="text-lg text-tg-text">
            Your sticker pack is being generated
          </p>
          {stickerPack && (
            <p className="text-tg-hint">
              "{stickerPack.name}" will be ready soon
            </p>
          )}
        </div>

        {executionId && (
          <div className="bg-tg-secondary-bg rounded-lg p-4 mt-6">
            <p className="text-sm text-tg-hint mb-2">Order ID:</p>
            <code className="text-xs font-mono bg-tg-hint/10 px-2 py-1 rounded">
              {executionId}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3 mt-8">
          <Button
            mode="filled"
            size="l"
            onClick={handleBackToStickerPack}
            className="w-full"
          >
            View Generation Progress
          </Button>

          <Button
            mode="outline"
            size="l"
            onClick={handleViewMyPacks}
            className="w-full"
          >
            My Sticker Packs
          </Button>

          <Button
            mode="plain"
            size="m"
            onClick={handleGoHome}
            className="text-tg-hint"
          >
            Back to Home
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-tg-hint">
            You'll be notified when your stickers are ready!
          </p>
        </div>
      </div>
    </div>
  );
}