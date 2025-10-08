import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { usePurchase } from '@/hooks/usePurchase';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';
import { StickerCollectionHeader } from '@/components/StickerPack/StickerCollectionHeader';
import { TierSelector } from '@/components/StickerPack/TierSelector';
import { NFTSelectionOnly } from '@/components/Feed/NFTSelectionOnly';
import { PurchaseButton } from '@/components/StickerPack/PurchaseButton';
import { TelegramMainButton } from '@/components/TelegramMainButton';
import { useTelegramTheme } from '@/auth/useTelegram';
import { StickerPackContentList } from '@/components/StickerPack/StickerPackContentList';
import {
  StickerPackAnimationProvider,
  useStickerPackAnimationContext,
} from '@/contexts/StickerPackAnimationContext';
import { StickerPackPurchaseProvider } from '@/contexts/StickerPackPurchaseContext';
import { redirectToTelegramBot } from '@/utils/telegramRedirect';
import type { Token } from '@/types/response';

interface StickerPackSearch {
  executionId?: string;
}

export const Route = createFileRoute('/sticker-packs/$stickerPackId/')({
  validateSearch: (search): StickerPackSearch => ({
    executionId: search.executionId as string,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();

  // Redirect to the new multi-step flow
  useEffect(() => {
    navigate({
      to: '/sticker-packs/$stickerPackId/details',
      params: { stickerPackId },
      replace: true,
    });
  }, [stickerPackId, navigate]);

  return null;
}

// Keep the old single-page flow component for reference/fallback
function RouteComponentOld() {
  return (
    <StickerPackAnimationProvider>
      <StickerPackContent />
    </StickerPackAnimationProvider>
  );
}

interface StickerPreviewItemProps {
  item: { content_id: string; preview_url?: string };
  stickerPackName: string;
  index: number;
}

function StickerPreviewItem({
  item,
  stickerPackName,
  index,
}: StickerPreviewItemProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg">
      {item.preview_url && !imageError ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-300" />
          )}
          <img
            src={item.preview_url}
            alt={`${stickerPackName} preview ${index + 1}`}
            className="h-full w-full object-cover transition-transform hover:scale-110"
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <div className="bg-tg-hint/20 flex h-full w-full items-center justify-center">
          <span className="text-tg-hint text-xs">No preview</span>
        </div>
      )}
    </div>
  );
}

function StickerPackContent() {
  const { stickerPackId } = Route.useParams();
  const { executionId: urlExecutionId } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const { selectedFavorite } = useSelectedNFTs();
  const { triggerAnimation } = useStickerPackAnimationContext();
  const {
    data: stickerPack,
    isLoading,
    error,
  } = useStickerPack(stickerPackId, session);

  const [selectedTier, setSelectedTier] = useState<
    'basic' | 'gold' | 'legendary'
  >('basic');
  const [selectedTokensForGeneration, setSelectedTokensForGeneration] =
    useState<Token[]>([]);
  const [executionId, setExecutionId] = useState<string | null>(
    urlExecutionId || null
  );

  const { purchaseStickerPack, isPending, state } = usePurchase(session, {
    onSuccess: data => {
      // Trigger animation for successful purchases
      if (data.status === 'processing' || data.status === 'completed') {
        triggerAnimation(
          data.status,
          data.status === 'completed'
            ? () => {
                // Redirect to Telegram bot after animation completes
                redirectToTelegramBot();
              }
            : undefined
        );
      }

      // If payment is required, navigate to checkout page
      if (data.status === 'pending_payment' && data.checkout) {
        navigate({
          to: '/sticker-packs/$stickerPackId/checkout',
          params: { stickerPackId },
          search: {
            executionId: data.execution_id,
            clientSecret: data.checkout.client_secret,
            publishableKey: data.checkout.publishable_key,
            selectedTier,
            selectedTokens: encodeURIComponent(
              JSON.stringify(selectedTokensForGeneration)
            ),
          },
        });
      } else {
        // Free tier or direct processing
        setExecutionId(data.execution_id);
      }
    },
    onError: error => {
      console.error('Purchase failed:', error);
    },
  });

  // Use execution status hook for polling when we have an execution ID
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
      triggerAnimation('completed', () => {
        // Redirect to Telegram bot after animation completes
        redirectToTelegramBot();
      });
    },
    onError: status => {
      console.error('Execution error:', status);
    },
  });

  // Handle token selection from NFT selection component
  const handleTokensChange = useCallback((tokens: Token[]) => {
    setSelectedTokensForGeneration(tokens);
  }, []);

  // Trigger animation when processing starts
  useEffect(() => {
    if (isProcessing) {
      triggerAnimation('processing');
    }
  }, [isProcessing, triggerAnimation]);

  const handlePurchase = () => {
    if (
      !selectedTokensForGeneration ||
      selectedTokensForGeneration.length === 0
    ) {
      alert('Please select NFTs first.');
      return;
    }

    if (
      selectedTokensForGeneration.length <
      (stickerPack?.min_tokens_required || 1)
    ) {
      alert(
        `Please select at least ${stickerPack?.min_tokens_required} NFT${stickerPack?.min_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    purchaseStickerPack(
      parseInt(stickerPackId),
      selectedTokensForGeneration,
      selectedTier
    );
  };

  const canPurchase =
    selectedTokensForGeneration &&
    selectedTokensForGeneration.length >=
      (stickerPack?.min_tokens_required || 1) &&
    selectedTokensForGeneration.length <=
      (stickerPack?.max_tokens_required || 1) &&
    !isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading sticker pack...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">
          Error loading sticker pack: {error.message}
        </div>
      </div>
    );
  }

  if (!stickerPack) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Sticker pack not found</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="space-y-2">
        {/* Header Section */}
        <StickerCollectionHeader stickerPack={stickerPack} />

        <div className="flex flex-col gap-4">
          {/* Description Section */}
          {stickerPack.description && (
            <div className="bg-tg-secondary-bg flex-1 rounded-lg p-2">
              <h2 className="text-base font-semibold">Launch Details</h2>
              <p className="text-tg-text text-sm">{stickerPack.description}</p>
            </div>
          )}
        </div>

        {/* Full Sticker Pack Content List */}
        {stickerPack?.items && stickerPack.items.length > 0 && (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <h2 className="mb-4 text-lg font-semibold">All Stickers</h2>
            <StickerPackContentList
              items={stickerPack.items}
              packName={stickerPack.name}
            />
          </div>
        )}
        {/* NFT Selection */}
        <div className="flex-1">
          <NFTSelectionOnly
            selectedFavorite={selectedFavorite}
            requiredTokens={stickerPack.min_tokens_required}
            optionalTokens={Math.max(
              0,
              stickerPack.max_tokens_required - stickerPack.min_tokens_required
            )}
            onTokensChange={handleTokensChange}
            prompt={{
              id: 1,
              name: `Generate stickers for ${stickerPack.name}`,
              prompt: `Generate stickers for ${stickerPack.name}`,
              createdAt: Date.now(),
              version: 1,
            }}
          />
        </div>

        {/* Tier Selection */}
        {stickerPack.pricing['basic'].amount_cents !== null && (
          <div className="rounded-lg p-2">
            <TierSelector
              stickerPackId={stickerPackId}
              selectedTier={selectedTier}
              onTierSelect={setSelectedTier}
              disabled={isPending}
            />
          </div>
        )}

        {/* Payment/Generation Section */}
        <div className="rounded-lg p-2">
          {/* Show processing progress */}
          {isProcessing && executionStatus && (
            <div className="bg-tg-bg border-tg-hint/20 rounded-lg border p-6 text-center">
              <h3 className="text-tg-text mb-4 text-lg font-semibold">
                Generating Your Sticker Pack
              </h3>
              <div className="bg-tg-secondary-bg mb-4 h-3 overflow-hidden rounded-full">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-tg-hint text-sm">
                {executionStatus.completed_prompts} of{' '}
                {executionStatus.total_prompts} stickers completed
              </p>
            </div>
          )}
          {/* Show completion message */}
          {isCompleted && executionStatus && (
            <div className="bg-tg-bg border-tg-hint/20 rounded-lg border p-6 text-center">
              <h3 className="text-tg-text mb-4 text-xl font-semibold">
                🎉 Your Sticker Pack is Ready!
              </h3>
              <p className="text-tg-hint mb-4 text-sm">
                All {executionStatus.total_prompts} stickers have been
                generated.
              </p>
              {executionStatus.telegram_pack_url && (
                <a
                  href={executionStatus.telegram_pack_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Add to Telegram
                </a>
              )}
            </div>
          )}
          Show purchase button for initial state, error state, or when pending
          {(state === 'idle' || state === 'error' || isPending) && (
            <>
              {/* Telegram Main Button */}
              <TelegramMainButton
                text={
                  isPending
                    ? 'Processing...'
                    : state === 'error'
                      ? 'Failed - Try Again'
                      : stickerPack.pricing[selectedTier].amount_cents === null
                        ? `Generate ${selectedTokensForGeneration.length} Sticker${selectedTokensForGeneration.length !== 1 ? 's' : ''}`
                        : `Purchase & Generate ${stickerPack.pricing[selectedTier].formatted_price || ''}`
                }
                onClick={handlePurchase}
                disabled={!canPurchase}
                loading={isPending}
                visible={true}
                hasShineEffect={
                  stickerPack.pricing[selectedTier].amount_cents !== null
                }
              />

              {/* Fallback Purchase Button for non-Telegram */}
              {!isTelegram && (
                <div className="flex flex-col space-y-4">
                  <PurchaseButton
                    stickerPackId={parseInt(stickerPackId)}
                    price={
                      !isPending && state !== 'error'
                        ? stickerPack.pricing[selectedTier].formatted_price ||
                          'Free'
                        : undefined
                    }
                  />
                </div>
              )}
            </>
          )}
          {/* Error handling */}
          {state === 'error' && (
            <p className="mt-4 text-center text-sm text-red-500">
              Something went wrong. Please try again.
            </p>
          )}
          {/* Validation messages */}
          {!canPurchase && state === 'idle' && (
            <p className="mt-4 text-center text-sm text-red-500">
              {!selectedTokensForGeneration ||
              selectedTokensForGeneration.length === 0
                ? 'Please select NFTs above'
                : selectedTokensForGeneration.length <
                    (stickerPack?.min_tokens_required || 1)
                  ? `Need ${(stickerPack?.min_tokens_required || 1) - selectedTokensForGeneration.length} more NFT${(stickerPack?.min_tokens_required || 1) - selectedTokensForGeneration.length !== 1 ? 's' : ''}`
                  : selectedTokensForGeneration.length >
                      (stickerPack?.max_tokens_required || 1)
                    ? `Too many NFTs selected (max ${stickerPack?.max_tokens_required})`
                    : 'Invalid selection'}
            </p>
          )}
        </div>

        {/* Preview Grid */}
        {(stickerPack?.preview_items && stickerPack.preview_items.length > 0) ||
        isLoading ? (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <h2 className="mb-4 text-lg font-semibold">Preview Stickers</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {isLoading
                ? // Show loading placeholders when sticker pack is loading
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`loading-${index}`}
                      className="aspect-square animate-pulse rounded-lg bg-gray-300"
                    />
                  ))
                : // Show actual preview items
                  stickerPack.preview_items?.map((item, index) => (
                    <StickerPreviewItem
                      key={`${item.content_id}-${index}`}
                      item={item}
                      stickerPackName={stickerPack.name}
                      index={index}
                    />
                  ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
