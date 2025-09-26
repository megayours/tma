import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
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
  return <StickerPackContent />;
}

function StickerPackContent() {
  const { stickerPackId } = Route.useParams();
  const { executionId: urlExecutionId } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const { selectedFavorite } = useSelectedNFTs();
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
      console.log('Purchase successful:', data);

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
    onComplete: status => {
      console.log('Execution completed:', status);
    },
    onError: status => {
      console.error('Execution error:', status);
    },
  });

  // Handle token selection from NFT selection component
  const handleTokensChange = useCallback((tokens: Token[]) => {
    setSelectedTokensForGeneration(tokens);
  }, []);

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
      {/* Confetti animation for successful generation */}
      {isCompleted && (
        <DotLottieReact
          className="pointer-events-none fixed bottom-0 left-1/2 z-50 h-2/3 w-[150vw] -translate-x-1/2"
          src="/lotties/confetti-full.lottie"
          loop={false}
          autoplay
        />
      )}

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

          {/* NFT Selection */}
          <div className="flex-1">
            <NFTSelectionOnly
              selectedFavorite={selectedFavorite}
              requiredTokens={stickerPack.min_tokens_required}
              optionalTokens={Math.max(
                0,
                stickerPack.max_tokens_required -
                  stickerPack.min_tokens_required
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

          {/* Show purchase button for initial state, error state, or when pending */}
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
        {stickerPack.preview_items && stickerPack.preview_items.length > 0 && (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <h2 className="mb-4 text-lg font-semibold">Preview Stickers</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stickerPack.preview_items.map((item, index) => (
                <div
                  key={`${item.content_id}-${index}`}
                  className="bg-tg-hint/10 aspect-square overflow-hidden rounded-lg"
                >
                  {item.preview_url ? (
                    <img
                      src={item.preview_url}
                      alt={`${stickerPack.name} preview ${index + 1}`}
                      className="h-full w-full object-cover transition-transform hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="bg-tg-hint/20 flex h-full w-full items-center justify-center">
                      <span className="text-tg-hint text-xs">No preview</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
