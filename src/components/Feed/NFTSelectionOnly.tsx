import { useState, useEffect } from 'react';
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

interface NFTSelectionOnlyProps {
  selectedFavorite: { token: Token } | null;
  requiredTokens: number;
  optionalTokens: number;
  onTokensChange: (tokens: Token[]) => void;
  prompt: Prompt;
  showHeader?: boolean;
  onClose?: () => void;
  className?: string;
}

export const NFTSelectionOnly = ({
  selectedFavorite,
  requiredTokens,
  optionalTokens,
  onTokensChange,
  prompt,
  showHeader = false,
  onClose,
  className = '',
}: NFTSelectionOnlyProps) => {
  // Initialize with selectedFavorite as the first required token (if available)
  const [selectedTokens, setSelectedTokens] = useState<(Token | null)[]>(() => {
    const tokens = Array(requiredTokens + optionalTokens).fill(null);
    if (selectedFavorite) {
      tokens[0] = selectedFavorite.token; // First required token is the selectedFavorite
    }
    return tokens;
  });

  // Update selectedTokens when selectedFavorite becomes available (handle race condition)
  useEffect(() => {
    if (selectedFavorite && !selectedTokens[0]) {
      const updatedTokens = [...selectedTokens];
      updatedTokens[0] = selectedFavorite.token;
      setSelectedTokens(updatedTokens);
    }
  }, [selectedFavorite, selectedTokens]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<SupportedCollection | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    'favorites' | 'collections'
  >('favorites');

  const { data: collections } = useGetCollectionsWithPrompt(prompt);

  // Notify parent when tokens change
  useEffect(() => {
    const allTokens = selectedTokens.filter(Boolean) as Token[];
    onTokensChange(allTokens);
  }, [selectedTokens]); // Remove onTokensChange from dependencies

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

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`bg-tg-bg border-tg-hint/20 rounded-lg border shadow-lg ${className}`}
      onClick={handleCloudClick}
    >
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
            <div className="text-tg-text mb-3 text-center text-sm font-medium">
              Required NFTs
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4">
              {Array.from({ length: requiredTokens }, (_, index) => (
                <TokenSlot
                  key={`required-${index}`}
                  type={index === 0 ? 'favorite' : 'required'}
                  token={selectedTokens[index]}
                  index={index === 0 ? undefined : index}
                  onClick={() => handleSlotClick(index)}
                  size={index === 0 ? 'large' : 'medium'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Tokens */}
        {optionalTokens > 0 && (
          <div className="mb-6">
            <div className="text-tg-text mb-3 text-center text-sm font-medium">
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
                    mode={
                      selectionMode === 'collections' ? 'filled' : 'outline'
                    }
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
                  <Button
                    mode="outline"
                    size="s"
                    onClick={handleCloseSelection}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {selectedCollection && (
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
      </div>
    </div>
  );
};
