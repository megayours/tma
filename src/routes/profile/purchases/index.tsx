import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { hapticFeedback } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';

interface PurchasesSearch {
  execution_id?: string;
}

export const Route = createFileRoute('/profile/purchases/')({
  validateSearch: (search): PurchasesSearch => ({
    execution_id: search.execution_id as string,
  }),
  component: PurchasesPage,
});

function PurchasesPage() {
  const { execution_id } = Route.useSearch();
  const { isTelegram } = useTelegramTheme();
  const [showConfetti, setShowConfetti] = useState(!!execution_id);

  // Success haptic feedback and hide confetti after 3 seconds
  useEffect(() => {
    if (execution_id) {
      // Trigger success haptic feedback for successful purchase
      if (isTelegram) {
        try {
          if (hapticFeedback && hapticFeedback.notificationOccurred) {
            hapticFeedback.notificationOccurred('success');
          }
        } catch (error) {
          console.warn('PurchasesPage: Haptic feedback not available:', error);
        }
      }

      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [execution_id, isTelegram]);

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* Confetti animation for successful purchase */}
      {showConfetti && execution_id && (
        <DotLottieReact
          className="pointer-events-none fixed bottom-0 left-1/2 z-50 h-2/3 w-[150vw] -translate-x-1/2"
          src="/lotties/confetti-full.lottie"
          loop={false}
          autoplay
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-tg-text">My Purchases</h1>
        </div>

        {/* Success Message for recent purchase */}
        {execution_id && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-green-700 mb-4">
              Your sticker pack is being generated and will be ready soon.
            </p>
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-2">Order ID:</p>
              <code className="text-xs font-mono bg-green-200 px-2 py-1 rounded">
                {execution_id}
              </code>
            </div>
          </div>
        )}

        {/* Purchases List */}
        <div className="bg-tg-secondary-bg rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Purchase History</h2>

          {/* TODO: Replace with actual purchases data */}
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-tg-hint">
              Your purchase history will appear here.
            </p>
            {execution_id && (
              <p className="text-sm text-tg-hint mt-2">
                Your recent purchase (ID: {execution_id.substring(0, 8)}...) is being processed.
              </p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-sm text-tg-hint">
            You'll be notified when your stickers are ready!
          </p>
        </div>
      </div>
    </div>
  );
}