import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { usePurchase } from '@/hooks/usePurchase';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';
import { StickerCollectionHeader } from '@/components/StickerPack/StickerCollectionHeader';
import { TierSelector } from '@/components/StickerPack/TierSelector';
import { InlineTokenSelection } from '@/components/Feed/InlineTokenSelection';
import type { Token } from '@/types/response';

export const Route = createFileRoute('/sticker-packs/$stickerPackId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const { session } = useSession();
  const { selectedNFTs, selectedFavorite } = useSelectedNFTs();
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

  const { purchaseStickerPack, isPending, state } = usePurchase(session, {
    onSuccess: data => {
      console.log('Purchase successful:', data);
    },
    onError: error => {
      console.error('Purchase failed:', error);
    },
  });

  // Handle token selection from inline component
  const handleTokenGenerate = (tokens: Token[]) => {
    setSelectedTokensForGeneration(tokens);
  };

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
      <div className="mt-6 space-y-6">
        {/* Header Section */}
        <StickerCollectionHeader stickerPack={stickerPack} />

        {/* Description Section */}
        {stickerPack.description && (
          <div className="bg-tg-secondary-bg rounded-lg p-4">
            <h2 className="mb-2 text-base font-semibold">Launch Details</h2>
            <p className="text-tg-text text-sm">{stickerPack.description}</p>
          </div>
        )}

        {/* NFT Selection */}
        <InlineTokenSelection
          selectedFavorite={
            selectedFavorite ||
            (selectedTokensForGeneration.length > 0
              ? { token: selectedTokensForGeneration[0] }
              : selectedNFTs && selectedNFTs.length > 0
                ? { token: selectedNFTs[0] }
                : {
                    token: {
                      contract: { chain: '', address: '', name: '' },
                      id: '',
                      name: 'Default',
                      image: '',
                      description: '',
                      attributes: {},
                      owner: '',
                    },
                  })
          }
          requiredTokens={stickerPack.min_tokens_required}
          optionalTokens={Math.max(
            0,
            stickerPack.max_tokens_required - stickerPack.min_tokens_required
          )}
          onGenerate={handleTokenGenerate}
          prompt={{
            id: 1,
            name: `Generate stickers for ${stickerPack.name}`,
            prompt: `Generate stickers for ${stickerPack.name}`,
            createdAt: Date.now(),
            version: 1,
          }}
        />

        {/* Tier Selection */}
        <div className="rounded-lg p-2">
          <TierSelector
            stickerPackId={stickerPackId}
            selectedTier={selectedTier}
            onTierSelect={setSelectedTier}
            disabled={isPending}
          />
        </div>

        {/* Purchase Button */}
        <div className="rounded-lg">
          <div className="flex flex-col space-y-4">
            <Button
              mode="filled"
              size="l"
              onClick={handlePurchase}
              disabled={!canPurchase}
              className={`w-full font-semibold ${
                state === 'processing'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : state === 'success'
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : state === 'error'
                      ? 'bg-red-500 hover:bg-red-600'
                      : ''
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span>
                  {state === 'processing'
                    ? 'Processing...'
                    : state === 'success'
                      ? 'Generation Started!'
                      : state === 'error'
                        ? 'Failed - Try Again'
                        : stickerPack.pricing[selectedTier].amount_cents ===
                            null
                          ? `Generate ${selectedTokensForGeneration.length} Sticker${selectedTokensForGeneration.length !== 1 ? 's' : ''}`
                          : `Purchase & Generate`}
                </span>
                {state !== 'processing' &&
                  state !== 'success' &&
                  state !== 'error' && (
                    <span className="font-bold">
                      {stickerPack.pricing[selectedTier].formatted_price ||
                        'Free'}
                    </span>
                  )}
              </div>
            </Button>

            {state === 'success' && (
              <p className="text-tg-hint text-center text-sm">
                You'll be notified when your stickers are ready!
              </p>
            )}

            {!canPurchase && (
              <p className="text-center text-sm text-red-500">
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
