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

  const {
    status: executionStatus,
    isCompleted,
    isProcessing,
  } = useExecutionStatus({
    session,
    executionId,
    pollingInterval: 5000, // Poll every 5 seconds
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
                <span className="text-tg-hint text-sm font-medium">
                  Sticker Pack:{' '}
                </span>
                <span className="text-tg-text text-sm font-semibold">
                  {stickerPack.name}
                </span>
              </div>
              {stickerPack.description && (
                <div>
                  <span className="text-tg-hint text-sm font-medium">
                    Description:{' '}
                  </span>
                  <span className="text-tg-text text-sm">
                    {stickerPack.description}
                  </span>
                </div>
              )}
              {executionStatus?.effect_style && (
                <div>
                  <span className="text-tg-hint text-sm font-medium">
                    Tier:{' '}
                  </span>
                  <span className="text-tg-text text-sm capitalize">
                    {executionStatus.effect_style}
                  </span>
                </div>
              )}
            </div>

            {/* Status Message */}
            <div className="text-center">
              <p className="text-tg-hint mb-4 text-sm">
                We're creating your stickers! This usually takes a few minutes.
              </p>
              <p className="text-tg-hint mb-3 text-sm font-semibold">
                To receive notifications when ready:
              </p>
              <div className="text-tg-text mb-3 flex items-center justify-center gap-2 text-sm">
                <span>📱</span>
                <span>
                  Send{' '}
                  <code className="bg-tg-bg rounded px-1.5 py-0.5 font-mono text-xs">
                    /status
                  </code>{' '}
                  in our{' '}
                  <a
                    href={import.meta.env.VITE_PUBLIC_BOT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tg-link hover:underline"
                  >
                    Telegram bot
                  </a>
                </span>
              </div>
              <div className="text-tg-hint mb-2 text-xs italic">
                (Required to get notified via Telegram)
              </div>
              <div className="text-tg-text flex items-center justify-center gap-2 text-sm">
                <span>👤</span>
                <span>Or check your profile's "My Generations" section</span>
              </div>
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
                className="bg-tg-button inline-block rounded-lg px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Add to Telegram
              </a>
            )}

            {/* show the stickers */}
            {/* {executionStatus.items && (
              <div className="grid grid-cols-5 gap-2">
                {executionStatus.items.map((sticker, index) => (
                  <img
                    key={index}
                    src={
                      sticker.generated_content_url ||
                      sticker.bundle_item.preview_url
                    }
                    alt={sticker.bundle_item.prompt.name}
                  />
                ))}
              </div>
            )} */}
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
