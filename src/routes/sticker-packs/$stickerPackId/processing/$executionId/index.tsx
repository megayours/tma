import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPackPurchase } from '@/contexts/StickerPackPurchaseContext';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';
import { StepProgressIndicator } from '@/components/StickerPack/StepProgressIndicator';
import { redirectToTelegramBot } from '@/utils/telegramRedirect';
import { useStickerPackAnimationContext } from '@/contexts/StickerPackAnimationContext';
import { z } from 'zod';

const processingSearchSchema = z.object({
  nft: z.string().optional(),
  tier: z.enum(['basic', 'gold', 'legendary']).optional(),
});

export const Route = createFileRoute(
  '/sticker-packs/$stickerPackId/processing/$executionId/'
)({
  validateSearch: processingSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { executionId } = Route.useParams();
  const search = Route.useSearch();
  const { session } = useSession();
  const { stickerPack, setExecutionId, setSelectedTier } =
    useStickerPackPurchase();
  const { triggerAnimation } = useStickerPackAnimationContext();

  // Track if animations have been triggered to ensure they only run once
  const hasTriggeredProcessing = useRef(false);
  const hasTriggeredCompletion = useRef(false);

  // Sync URL params with context on mount
  useEffect(() => {
    if (executionId) {
      setExecutionId(executionId);
    }
    if (search.tier) {
      setSelectedTier(search.tier);
    }
  }, [executionId, search.tier, setExecutionId, setSelectedTier]);

  const {
    status: executionStatus,
    isCompleted,
    isProcessing,
    progressPercentage,
  } = useExecutionStatus({
    session,
    executionId,
    pollingInterval: 5000, // Poll every 5 seconds
    onComplete: _ => {
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        triggerAnimation('completed', () => {
          // Redirect to Telegram bot after animation completes
          redirectToTelegramBot();
        });
      }
    },
    onError: status => {
      console.error('Execution error:', status);
    },
  });

  // Trigger animation when processing starts
  useEffect(() => {
    if (isProcessing && !hasTriggeredProcessing.current) {
      hasTriggeredProcessing.current = true;
      triggerAnimation('processing');
    }
  }, [isProcessing, triggerAnimation]);

  if (!stickerPack || !executionId) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const hasPaidTiers =
    stickerPack.pricing.basic.amount_cents !== null ||
    stickerPack.pricing.gold.amount_cents !== null ||
    stickerPack.pricing.legendary.amount_cents !== null;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <StepProgressIndicator
        currentStep={4}
        skipTierSelection={!hasPaidTiers}
      />

      <div className="space-y-4">
        {/* Processing Progress */}
        {isProcessing && executionStatus && (
          <div className="bg-tg-secondary-bg rounded-lg p-6 text-center">
            <h2 className="text-tg-text mb-4 text-xl font-semibold">
              Generating Your Sticker Pack
            </h2>
            <p className="text-tg-hint mb-6 text-sm">
              Please wait while we create your personalized stickers
            </p>

            {/* Progress Bar */}
            <div className="bg-tg-bg mb-4 h-4 overflow-hidden rounded-full">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Progress Text */}
            <p className="text-tg-hint text-sm">
              {executionStatus.completed_prompts} of{' '}
              {executionStatus.total_prompts} stickers completed (
              {progressPercentage}%)
            </p>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && executionStatus && (
          <div className="bg-tg-secondary-bg rounded-lg p-6 text-center">
            <h2 className="text-tg-text mb-4 text-2xl font-semibold">
              🎉 Your Sticker Pack is Ready!
            </h2>
            <p className="text-tg-hint mb-6 text-sm">
              All {executionStatus.total_prompts} stickers have been generated
              successfully.
            </p>

            {/* Telegram Link */}
            {executionStatus.telegram_pack_url && (
              <a
                href={executionStatus.telegram_pack_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Add to Telegram
              </a>
            )}
          </div>
        )}

        {/* Error State */}
        {executionStatus?.status === 'error' && (
          <div className="bg-tg-secondary-bg rounded-lg p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold text-red-600">
              Generation Failed
            </h2>
            <p className="text-tg-hint mb-4 text-sm">
              {executionStatus.error_message ||
                'Something went wrong while generating your sticker pack.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
