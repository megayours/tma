import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useMemo } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';
import { useStickerPackAnimationContext } from '@/contexts/StickerPackAnimationContext';
import { z } from 'zod';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { decodeNFT } from '@/utils/nftEncoding';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';

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
  const { stickerPackId, executionId } = Route.useParams();
  const search = Route.useSearch();
  const { session } = useSession();
  const { triggerAnimation } = useStickerPackAnimationContext();
  const navigate = useNavigate();

  // Fetch sticker pack data
  const { data: stickerPack, isLoading: isLoadingStickerPack } = useStickerPack(
    stickerPackId,
    session
  );

  // Decode NFT from URL
  const nftData = useMemo(() => {
    if (!search.nft) return null;
    try {
      return decodeNFT(search.nft);
    } catch (error) {
      console.error('Failed to decode NFT from URL:', error);
      return null;
    }
  }, [search.nft]);

  // Fetch full NFT data from API
  const { data: selectedNFT } = useGetNFTByCollectionAndTokenId(
    nftData?.chain || '',
    nftData?.contractAddress || '',
    nftData?.tokenId || ''
  );

  // Track if animations have been triggered to ensure they only run once
  const hasTriggeredProcessing = useRef(false);
  const hasTriggeredCompletion = useRef(false);

  const {
    status: executionStatus,
    isCompleted,
    isProcessing,
  } = useExecutionStatus({
    session,
    executionId,
    pollingInterval: 5000, // Poll every 5 seconds
    onComplete: _ => {
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        triggerAnimation('completed', () => {
          // Redirect to profile after animation completes
          navigate({ to: '/profile' });
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

  // Loading states
  if (isLoadingStickerPack || !stickerPack || !executionId) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="space-y-4">
        {/* Unified Information Card */}
        {isProcessing && executionStatus && stickerPack && (
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
            <div className="border-tg-hint/20 my-6 border-t" />

            {/* Sticker Pack Details */}
            <div className="mb-6 space-y-2">
              <div>
                <span className="text-tg-hint text-sm font-medium">Sticker Pack: </span>
                <span className="text-tg-text text-sm font-semibold">{stickerPack.name}</span>
              </div>
              {stickerPack.description && (
                <div>
                  <span className="text-tg-hint text-sm font-medium">Description: </span>
                  <span className="text-tg-text text-sm">{stickerPack.description}</span>
                </div>
              )}
              {executionStatus?.effect_style && (
                <div>
                  <span className="text-tg-hint text-sm font-medium">Tier: </span>
                  <span className="text-tg-text text-sm capitalize">{executionStatus.effect_style}</span>
                </div>
              )}
            </div>

            {/* Status Message */}
            <p className="text-tg-hint text-center text-sm">
              We are creating your stickers. You will receive a link when they are completed.
            </p>
          </div>
        )}

        {/* Items List - Collapsible (Commented out for now) */}
        {/* {executionStatus?.items && executionStatus.items.length > 0 && (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <button
              onClick={() => setIsStickersExpanded(!isStickersExpanded)}
              className="flex w-full items-center justify-between"
            >
              <h3 className="text-tg-text text-lg font-semibold">
                Stickers ({executionStatus.completed_prompts}/{executionStatus.total_prompts})
              </h3>
              <svg
                className={`text-tg-text h-5 w-5 transition-transform duration-200 ${
                  isStickersExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isStickersExpanded && (
              <div className="mt-4 space-y-3">
                {executionStatus.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="bg-tg-bg flex items-center gap-3 rounded-lg p-3"
                  >
                    <div className="flex-shrink-0">
                      {item.status === 'completed' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      ) : item.status === 'processing' ? (
                        <div className="flex h-8 w-8 items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                      ) : item.status === 'error' ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="bg-tg-hint/20 h-8 w-8 rounded-full" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="text-tg-text text-sm font-medium">
                        Sticker {index + 1}
                      </div>
                      <div className="text-tg-hint text-xs capitalize">
                        {item.status || 'pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )} */}

        {/* Go to Profile Button */}
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

        {/* Completion Message */}
        {isCompleted && executionStatus && (
          <div className="bg-tg-secondary-bg rounded-lg p-6 text-center">
            <h2 className="text-tg-text mb-4 text-2xl font-semibold">
              🎉 Your Sticker Pack is Ready!
            </h2>
            <p className="text-tg-hint mb-6 text-sm">
              All {executionStatus.total_prompts} stickers have been generated successfully.
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
