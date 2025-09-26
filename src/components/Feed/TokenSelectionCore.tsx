import { useState } from 'react';
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

interface TokenSelectionCoreProps {
  selectedFavorite: { token: Token };
  requiredTokens: number;
  optionalTokens: number;
  onGenerate: (tokens: Token[]) => void;
  prompt: Prompt;
  showHeader?: boolean;
  onClose?: () => void;
  className?: string;
}

export const TokenSelectionCore = ({
  selectedFavorite,
  requiredTokens,
  optionalTokens,
  onGenerate,
  prompt,
  showHeader = false,
  onClose,
  className = "",
}: TokenSelectionCoreProps) => {
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

  return (
    <div className={`bg-tg-bg border-tg-hint/20 rounded-lg border shadow-lg ${className}`} onClick={handleCloudClick}>
      {/* Header */}
      {showHeader && (
        <div className="border-tg-section-separator flex items-center justify-between border-b p-4">
          <h3 className="text-tg-text text-lg font-semibold">Select NFTs</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-tg-hint hover:text-tg-text text-xl transition-colors"
            >
              ×
            </button>
          )}
        </div>
      )}

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
                  index={requiredTokens + index}
                  onClick={() => handleSlotClick(requiredTokens + index)}
                  size="medium"
                />
              ))}
            </div>
          </div>
        )}

        {/* Selection Interface */}
        {activeSlotIndex !== null && (
          <div className="border-tg-section-separator border-t pt-4">
            {!selectedCollection && !selectedTokenId && (
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  <Button
                    mode={selectionMode === 'favorites' ? 'filled' : 'outline'}
                    size="s"
                    onClick={() => setSelectionMode('favorites')}
                  >
                    Favorites
                  </Button>
                  <Button
                    mode={selectionMode === 'collections' ? 'filled' : 'outline'}
                    size="s"
                    onClick={() => setSelectionMode('collections')}
                  >
                    Collections
                  </Button>
                </div>

                {selectionMode === 'favorites' && (
                  <PickFavoriteNFTs onTokenSelect={handleFavoriteSelect} />
                )}

                {selectionMode === 'collections' && collections && (
                  <SelectCollection
                    collections={collections}
                    onCollectionSelect={handleCollectionSelect}
                  />
                )}

                <div className="flex justify-center">
                  <Button mode="outline" size="s" onClick={handleCloseSelection}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {selectedCollection && !selectedTokenId && (
              <SelectTokenId
                collection={selectedCollection}
                onTokenSelect={setSelectedTokenId}
                onBack={handleBack}
              />
            )}

            {selectedTokenId && selectedCollection && (
              <DisplayNFT
                collection={selectedCollection}
                tokenId={selectedTokenId}
                onClick={handleTokenSelect}
              />
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className={`border-tg-section-separator ${showHeader ? 'absolute inset-x-0 bottom-0 z-10' : 'mt-6'} border-t bg-tg-bg`}>
          <div className="flex w-full justify-center p-4">
            <Button
              mode="filled"
              size="l"
              onClick={handleGenerate}
              disabled={!isGenerationEnabled()}
              className="w-full max-w-sm"
            >
              Generate Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};