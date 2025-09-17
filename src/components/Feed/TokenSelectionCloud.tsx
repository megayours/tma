import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@telegram-apps/telegram-ui';
import { TokenSlot } from './TokenSlot';
import { SelectCollection } from '../NFT/SelectCollection';
import { SelectTokenId } from '../NFT/SelectTokenId';
import { DisplayNFT } from '../NFT/DisplayNFT';
import { PickFavoriteNFTs } from '../NFT/PickFavoriteNFTs';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { SupportedCollection } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';

interface TokenSelectionCloudProps {
  selectedFavorite: { token: Token };
  requiredTokens: number;
  optionalTokens: number;
  onClose: () => void;
  onGenerate: (tokens: Token[]) => void;
  prompt: Prompt;
}

export const TokenSelectionCloud = ({
  selectedFavorite,
  requiredTokens,
  optionalTokens,
  onClose,
  onGenerate,
  prompt,
}: TokenSelectionCloudProps) => {
  // Initialize with selectedFavorite as the first required token
  const [selectedTokens, setSelectedTokens] = useState<(Token | null)[]>(() => {
    const tokens = Array(requiredTokens + optionalTokens).fill(null);
    tokens[0] = selectedFavorite.token; // First required token is the selectedFavorite
    return tokens;
  });
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<SupportedCollection | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'favorites' | 'collections'>('favorites');

  const { data: collections } = useGetCollectionsWithPrompt(prompt);

  const handleSlotClick = (index: number) => {
    setActiveSlotIndex(index);
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleTokenSelect = (token: Token) => {
    if (activeSlotIndex !== null) {
      const newTokens = [...selectedTokens];
      newTokens[activeSlotIndex] = token;
      setSelectedTokens(newTokens);
      setActiveSlotIndex(null);
      setSelectedCollection(null);
      setSelectedTokenId(null);
    }
  };

  const handleCollectionSelect = (collection: SupportedCollection) => {
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleFavoriteSelect = (favorite: { token: Token }) => {
    handleTokenSelect(favorite.token);
  };

  const handleCloseSelection = () => {
    setActiveSlotIndex(null);
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleGenerate = () => {
    const allTokens = selectedTokens.filter(Boolean) as Token[];
    onGenerate(allTokens);
  };

  const isGenerationEnabled = () => {
    // Check if all required tokens are filled (first requiredTokens slots)
    return selectedTokens.slice(0, requiredTokens).every(token => token !== null);
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Find the token-selection-container element
  const portalContainer = document.getElementById('token-selection-container');

  if (!portalContainer) {
    return null;
  }

  const cloudContent = (
    <div
      className="bg-tg-bg border-tg-hint/20 relative overflow-y-auto rounded-lg border shadow-lg"
      style={{
        maxHeight: '80vh',
        minHeight: '200px',
        width: '90vw',
        maxWidth: '400px',
        zIndex: 9999,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
      }}
      onClick={handleCloudClick}
    >
      {/* Header */}
      <div className="border-tg-section-separator flex items-center justify-between border-b p-4">
        <h3 className="text-tg-text text-lg font-semibold">Select NFTs</h3>
        <button
          onClick={onClose}
          className="text-tg-hint hover:text-tg-text text-xl transition-colors"
        >
          ×
        </button>
      </div>

      {/* Token Slots Grid */}
      <div className="p-4">
        {/* Required Tokens */}
        {requiredTokens > 0 && (
          <div className="mb-6">
            <div className="mb-3 text-center text-sm font-medium text-tg-text">
              Required NFTs
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: requiredTokens }, (_, index) => (
                <TokenSlot
                  key={`required-${index}`}
                  type={index === 0 ? "favorite" : "required"}
                  token={selectedTokens[index]}
                  index={index === 0 ? undefined : index}
                  onClick={() => handleSlotClick(index)}
                  size={index === 0 ? "large" : "medium"}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Tokens */}
        {optionalTokens > 0 && (
          <div className="mb-6">
            <div className="mb-3 text-center text-sm font-medium text-tg-text">
              Optional NFTs
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: optionalTokens }, (_, index) => (
                <TokenSlot
                  key={`optional-${index}`}
                  type="optional"
                  token={selectedTokens[requiredTokens + index]}
                  index={index}
                  onClick={() => handleSlotClick(requiredTokens + index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-6">
          <Button
            onClick={handleGenerate}
            disabled={!isGenerationEnabled()}
            mode="filled"
            size="l"
            stretched
          >
            Generate Content
          </Button>
        </div>
      </div>

      {/* NFT Selection Modal */}
      {activeSlotIndex !== null && (
        <div className="border-tg-section-separator absolute inset-0 z-10 border-t bg-tg-bg">
          <div className="border-tg-section-separator flex items-center justify-between border-b p-4">
            <h3 className="text-tg-text text-lg font-semibold">Select NFT</h3>
            <button
              onClick={handleCloseSelection}
              className="text-tg-hint hover:text-tg-text text-xl transition-colors"
            >
              ×
            </button>
          </div>

          {!selectedCollection && (
            <div className="flex flex-col p-2">
              {/* Segmented Control */}
              <div className="mb-3">
                <div className="bg-tg-secondary border-tg-section-separator flex rounded-lg border p-1">
                  <button
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      selectionMode === 'favorites'
                        ? 'bg-tg-button text-tg-button-text'
                        : 'text-tg-text hover:bg-tg-hint/10'
                    }`}
                    onClick={() => setSelectionMode('favorites')}
                  >
                    Favorites
                  </button>
                  <button
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      selectionMode === 'collections'
                        ? 'bg-tg-button text-tg-button-text'
                        : 'text-tg-text hover:bg-tg-hint/10'
                    }`}
                    onClick={() => setSelectionMode('collections')}
                  >
                    Collections
                  </button>
                </div>
              </div>

              {/* Content based on selection mode */}
              {selectionMode === 'favorites' && (
                <PickFavoriteNFTs onTokenSelect={handleFavoriteSelect} />
              )}
              {selectionMode === 'collections' && (
                <SelectCollection
                  collections={collections || []}
                  onCollectionSelect={handleCollectionSelect}
                  size="s"
                />
              )}
            </div>
          )}

          {selectedCollection && (
            <>
              <SelectTokenId
                collection={selectedCollection}
                onBack={handleBack}
                onTokenSelect={setSelectedTokenId}
              />

              <div className="h-[300px]">
                {selectedCollection && selectedTokenId && (
                  <DisplayNFT
                    collection={selectedCollection}
                    tokenId={selectedTokenId}
                    onClick={handleTokenSelect}
                  />
                )}
                {selectedCollection && !selectedTokenId && (
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex justify-center">
                      <div className="bg-tg-secondary flex w-64 items-center justify-center rounded-lg">
                        <div className="text-tg-hint text-center text-sm">
                          Select a token ID to view NFT
                        </div>
                      </div>
                    </div>
                    <div className="text-tg-hint text-center text-lg font-medium">
                      {selectedCollection.name}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(cloudContent, portalContainer);
};