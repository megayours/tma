import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useTelegramTheme } from '@/auth/useTelegram';
import { SpinnerFullPage } from '@/components/ui';

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
  const [dotLottieInstance, setDotLottieInstance] = useState<DotLottie | null>(
    null
  );

  const { data: stickerPack, isLoading } = useStickerPack(
    stickerPackId,
    session
  );

  // Success haptic feedback
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
  }, [isTelegram]);

  // Listen for animation complete event
  useEffect(() => {
    if (!dotLottieInstance) return;

    const handleComplete = () => {
      console.log('Confetti animation completed');
      setShowConfetti(false);
    };

    dotLottieInstance.addEventListener('complete', handleComplete);

    return () => {
      dotLottieInstance.removeEventListener('complete', handleComplete);
    };
  }, [dotLottieInstance]);

  const handleViewMyPacks = () => {
    navigate({
      to: '/profile',
    });
  };

  const handleGoHome = () => {
    navigate({
      to: '/',
    });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-4">
      {/* Confetti animation */}
      {showConfetti && (
        <DotLottieReact
          dotLottieRefCallback={setDotLottieInstance}
          className="pointer-events-none fixed bottom-0 left-1/2 z-50 h-2/3 w-[150vw] -translate-x-1/2"
          src="/lotties/confetti-full.lottie"
          loop={false}
          autoplay
        />
      )}

      <div className="space-y-6 text-center">
        {/* Success Icon */}
        <div className="mb-4 text-6xl">🎉</div>

        {/* Success Message */}
        <h1 className="text-tg-text text-3xl font-bold">Payment Successful!</h1>

        <div className="space-y-2">
          <p className="text-tg-text text-lg">
            Your sticker pack is being generated
          </p>
          {stickerPack && (
            <p className="text-tg-hint">
              "{stickerPack.name}" will be ready soon
            </p>
          )}
        </div>

        {executionId && (
          <div className="bg-tg-secondary-bg mt-6 rounded-lg p-4">
            <p className="text-tg-hint mb-2 text-sm">Order ID:</p>
            <code className="bg-tg-hint/10 rounded px-2 py-1 font-mono text-xs">
              {executionId}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col space-y-3">
          <Button
            mode="filled"
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
          <p className="text-tg-hint text-sm">
            You'll be notified when your stickers are ready!
          </p>
        </div>
      </div>
    </div>
  );
}
