import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useStickerPackPurchase } from '@/contexts/StickerPackPurchaseContext';
import { TelegramMainButton } from '@/components/TelegramMainButton';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import { NFTSelector } from './NFTSelector';
import type { Token } from '@/types/response';
import { useSelectedNFTs } from '../../../../contexts/SelectedNFTsContext';

export const Route = createFileRoute(
  '/sticker-packs/$stickerPackId/select-nfts/'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();
  const { stickerPack, setSelectedNFTs, selectedNFTs } =
    useStickerPackPurchase();
  const { data: collections } = useGetSupportedCollections();
  const { selectedFavorite } = useSelectedNFTs();

  // State for selector visibility
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Pre-populate with selectedFavorite if available and nothing is selected yet
  useEffect(() => {
    if (selectedFavorite && selectedNFTs.length === 0) {
      setSelectedNFTs([selectedFavorite.token]);
    }
  }, [selectedFavorite, selectedNFTs.length, setSelectedNFTs]);

  // Open selector if no NFT selected, close if one is selected
  useEffect(() => {
    setIsSelectorOpen(selectedNFTs.length === 0);
  }, [selectedNFTs.length]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      // Replace the selected NFT (max 1 NFT allowed)
      setSelectedNFTs([token]);
      // Close selector after selection
      setIsSelectorOpen(false);
    },
    [setSelectedNFTs]
  );

  const toggleSelector = () => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  const handleContinue = () => {
    if (!selectedNFTs || selectedNFTs.length === 0) {
      alert('Please select at least one NFT.');
      return;
    }

    if (selectedNFTs.length < (stickerPack?.min_tokens_required || 1)) {
      alert(
        `Please select at least ${stickerPack?.min_tokens_required} NFT${stickerPack?.min_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    if (selectedNFTs.length > (stickerPack?.max_tokens_required || 1)) {
      alert(
        `You can select a maximum of ${stickerPack?.max_tokens_required} NFT${stickerPack?.max_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    // Check if there are any paid tiers
    const hasPaidTiers =
      stickerPack?.pricing.basic.amount_cents !== null ||
      stickerPack?.pricing.gold.amount_cents !== null ||
      stickerPack?.pricing.legendary.amount_cents !== null;

    // Skip tier selection if all tiers are free
    if (!hasPaidTiers) {
      navigate({
        to: '/sticker-packs/$stickerPackId/review',
        params: { stickerPackId },
      });
    } else {
      navigate({
        to: '/sticker-packs/$stickerPackId/select-tier',
        params: { stickerPackId },
      });
    }
  };

  if (!stickerPack) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const canContinue =
    selectedNFTs &&
    selectedNFTs.length >= (stickerPack.min_tokens_required || 1) &&
    selectedNFTs.length <= (stickerPack.max_tokens_required || 1);

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* <StepProgressIndicator currentStep={1} /> */}

      <div className="space-y-4">
        {/* NFT Selection - Unified */}
        <div className="rounded-lg p-6">
          {/* Display Selected NFT if available */}
          {selectedNFTs.length > 0 && (
            <div className={`transition-all duration-500 ${
              isSelectorOpen ? 'mb-6' : 'mb-8'
            }`}>
              <h2 className={`text-center text-lg font-semibold transition-all duration-500 ${
                isSelectorOpen ? 'mb-4' : 'mb-6'
              }`}>
                Selected NFT
              </h2>
              <div className={`flex justify-center items-center transition-all duration-500 ${
                isSelectorOpen ? '' : 'py-4'
              }`}>
                {selectedNFTs.map((nft, index) => (
                  <div
                    key="selected-nft"
                    className="flex flex-col items-center gap-3"
                  >
                    {/* NFT Image - Circular with Edit Icon */}
                    <div className="relative cursor-pointer transition-all duration-500 ease-in-out" onClick={toggleSelector}>
                      {nft?.image && (
                        <img
                          src={nft.image}
                          alt={nft?.name || `NFT #${nft?.id || index}`}
                          className={`rounded-full object-cover transition-all duration-500 ease-in-out ${
                            isSelectorOpen ? 'h-24 w-24' : 'h-52 w-52'
                          }`}
                        />
                      )}

                      {/* Edit Icon - Overlay */}
                      <div className={`absolute rounded-full bg-tg-accent-text transition-all duration-500 ease-in-out hover:opacity-90 ${
                        isSelectorOpen ? 'bottom-1 right-1 p-1.5' : 'bottom-3 right-3 p-2.5'
                      }`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`text-white transition-all duration-500 ease-in-out ${
                            isSelectorOpen ? 'h-3 w-3' : 'h-5 w-5'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                    </div>

                    {/* NFT Info Below */}
                    <div className="text-center transition-all duration-500 ease-in-out">
                      <div className={`font-semibold transition-all duration-500 ease-in-out ${
                        isSelectorOpen ? 'text-sm' : 'text-base'
                      }`}>
                        {nft?.name || `NFT #${nft?.id || index}`}
                      </div>
                      <div className={`text-tg-hint transition-all duration-500 ease-in-out ${
                        isSelectorOpen ? 'text-xs' : 'text-sm'
                      }`}>
                        {nft?.contract?.name || 'Unknown Collection'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NFT Selection - Collapsible */}
          {isSelectorOpen && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                {selectedNFTs.length === 0 ? 'Select Your NFT' : 'Change NFT'}
              </h2>
              <NFTSelector
                collections={collections}
                onTokenSelect={handleTokenSelect}
                selectedNFT={selectedNFTs[0] || null}
              />
            </div>
          )}
        </div>

        {/* Navigation Button */}
        <TelegramMainButton
          text="Go Go Go"
          onClick={handleContinue}
          disabled={!canContinue}
          visible={true}
        />
      </div>
    </div>
  );
}
