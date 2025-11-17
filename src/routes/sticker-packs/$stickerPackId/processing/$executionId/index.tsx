import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPackAnimationContext } from '@/contexts/StickerPackAnimationContext';
import { z } from 'zod';
import { useStickerPackExecutionById } from '@/hooks/useStickerPack';
import { decodeNFT } from '@/utils/nftEncoding';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { SpinnerFullPage } from '@/components/ui';
import { StickerPackVisualization } from '@/components/StickerPack/StickerPackVisualization';
import {
  useLaunchParams,
  requestWriteAccess,
  hapticFeedback,
} from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';

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

const EnableNotifications = () => {
  const launchParams = useLaunchParams(true);
  const allowsWriteToPm = launchParams?.tgWebAppData?.user?.allowsWriteToPm;

  const handleEnableNotifications = () => {
    if (requestWriteAccess.isAvailable()) {
      requestWriteAccess();
    }
    if (!allowsWriteToPm) {
      return (
        <div className="bg-tg-secondary-bg mx-auto max-w-md rounded-xl p-4">
          <div className="mb-3 flex items-center justify-center gap-2"></div>
          <button
            onClick={handleEnableNotifications}
            className="bg-tg-button text-tg-button-text w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
          >
            Enable Notifications <span className="text-sm">🔔</span>
          </button>
        </div>
      );
    }
  };
  return null;
};

function RouteComponent() {
  const { executionId } = Route.useParams();
  const search = Route.useSearch();
  const { session } = useSession();
  const { triggerAnimation } = useStickerPackAnimationContext();
  const { isTelegram } = useTelegramTheme();
  const navigate = useNavigate();

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [dotLottieInstance, setDotLottieInstance] = useState<DotLottie | null>(
    null
  );

  // Fetch execution data by execution ID
  const { data: execution, isLoading: isLoadingExecution } =
    useStickerPackExecutionById(executionId, session);

  // Extract sticker pack and NFT from execution
  const stickerPack = execution?.bundle;
  const nftToken = execution?.nft_token;

  // Decode NFT from URL (fallback if not in execution)
  const nftData = useMemo(() => {
    if (!search.nft) return null;
    try {
      return decodeNFT(search.nft);
    } catch (error) {
      console.error('Failed to decode NFT from URL:', error);
      return null;
    }
  }, [search.nft]);

  // Fetch full NFT data from API (fallback if not in execution)
  const { data: selectedNFT } = useGetNFTByCollectionAndTokenId(
    nftData?.chain || nftToken?.contract?.chain || '',
    nftData?.contractAddress || nftToken?.contract?.address || '',
    nftData?.tokenId || nftToken?.id || ''
  );

  // Track if animations have been triggered to ensure they only run once
  const hasTriggeredProcessing = useRef(false);
  const hasTriggeredCompletion = useRef(false);

  // Derive status flags from execution
  const isProcessing = execution?.status === 'processing';
  const isCompleted = execution?.status === 'completed';
  const isError = execution?.status === 'failed';

  // Trigger animation when processing starts
  useEffect(() => {
    if (isProcessing && !hasTriggeredProcessing.current) {
      hasTriggeredProcessing.current = true;
      triggerAnimation('processing');
    }
  }, [isProcessing, triggerAnimation]);

  // Trigger confetti and haptic feedback when completed
  useEffect(() => {
    if (isCompleted && !hasTriggeredCompletion.current) {
      hasTriggeredCompletion.current = true;
      setShowConfetti(true);

      // Trigger success haptic feedback
      if (isTelegram) {
        try {
          if (hapticFeedback && hapticFeedback.notificationOccurred) {
            hapticFeedback.notificationOccurred('success');
          }
        } catch (error) {
          console.warn('Haptic feedback not available:', error);
        }
      }
    }
  }, [isCompleted, isTelegram]);

  // Listen for confetti animation complete event
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

  // Loading states
  if (isLoadingExecution || !execution || !executionId) {
    return <SpinnerFullPage text="Loading..." />;
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
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

      <div className="space-y-4">
        {/* Unified Information Card */}
        {isProcessing && execution && stickerPack && (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <h2 className="text-tg-text mb-6 text-center text-xl font-semibold">
              Creating Your Stickers
            </h2>

            {/* NFT Display */}
            {selectedNFT && (
              <div className="mb-6 flex flex-col items-center">
                <img
                  src={selectedNFT.image || '/nfts/not-available.png'}
                  alt={selectedNFT.name || `NFT #${selectedNFT.id}`}
                  className="mb-3 h-24 w-24 rounded-full object-cover"
                />
                <div className="text-tg-text text-center font-semibold">
                  {selectedNFT.name || `NFT #${selectedNFT.id}`}
                </div>
                <div className="text-tg-hint text-center text-sm">
                  {selectedNFT.contract.name}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-tg-hint/20 my-2 border-t" />

            {/* Status Message */}
            <div className="text-center">
              <p className="text-tg-hint text-sm">
                We're creating your stickers! This usually takes a few minutes.
              </p>
            </div>

            {isTelegram && <EnableNotifications />}

            {/* Show execution items during processing */}
            <div className="mt-6">
              <h3 className="text-tg-text mb-4 text-lg font-semibold">
                Generated Stickers ({execution.completed_prompts}/
                {execution.total_prompts})
              </h3>
              <StickerPackVisualization execution={execution} />
            </div>
            {/* Link to the in-generation sticker pack */}
            <div className="">
              <button
                onClick={() =>
                  navigate({ to: `/sticker-packs/generated/${executionId}` })
                }
                className="text-tg-link text-sm font-medium hover:underline"
              >
                View Sticker Pack Details →
              </button>
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate({ to: '/profile' })}
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Go to Profile
            </button>
          </div>
        )}

        {isCompleted && execution && (
          <div className="bg-tg-secondary-bg flex flex-col gap-2 rounded-lg p-6 text-center">
            <h2 className="text-tg-text text-2xl font-semibold">
              🎉 Your Sticker Pack is Ready!
            </h2>
            <p className="text-tg-hint text-sm">
              All {execution.total_prompts} stickers have been generated
              successfully.
            </p>

            {/* show the stickers */}
            <div className="mt-6">
              <StickerPackVisualization execution={execution} />
            </div>

            {/* Telegram Link */}
            {execution.telegram_pack_url && (
              <a
                href={execution.telegram_pack_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-tg-button inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Add to Telegram
              </a>
            )}
            {/* Link to generated sticker pack */}
            <div className="">
              <button
                onClick={() =>
                  navigate({ to: `/sticker-packs/generated/${executionId}` })
                }
                className="text-tg-link text-sm font-medium hover:underline"
              >
                View Sticker Pack Details →
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && execution && (
          <div className="bg-tg-secondary-bg rounded-lg p-6 text-center">
            <h2 className="mb-4 text-xl font-semibold text-red-600">
              Generation Failed
            </h2>
            <p className="text-tg-hint mb-4 text-sm">
              {execution.error_message ||
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
