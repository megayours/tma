import { useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { PickFavoriteNFTs } from '../selection/PickFavoriteNFTs';
import { SelectCollection } from '../selection/SelectCollection';
import { SelectTokenId } from '../selection/SelectTokenId';
import { SelectMascot } from '../selection/SelectMascot';
import { DisplayNFT } from '../display/DisplayNFT';
import type { SupportedCollection } from '@/hooks/useCollections';
import type { Token } from '@/types/response';

export interface NFTSelectionFlowProps {
  collections: SupportedCollection[];
  onTokenSelect: (token: Token) => void;
  supportedCollections?: SupportedCollection[];
  selectedNFT?: Token | null;
  enableMascotMode?: boolean;
  className?: string;
  initialMode?: 'favorites' | 'collections';
  hideSegmentedControl?: boolean;
  segmentedControlStyle?: 'inline' | 'buttons';
  isLoadingCollections?: boolean;
}

export const NFTSelectionFlow = ({
  collections,
  onTokenSelect,
  supportedCollections,
  selectedNFT,
  enableMascotMode = true,
  className = '',
  initialMode = 'favorites',
  hideSegmentedControl = false,
  segmentedControlStyle = 'inline',
  isLoadingCollections = false,
}: NFTSelectionFlowProps) => {
  const [selectedCollection, setSelectedCollection] = useState<SupportedCollection | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'favorites' | 'collections'>(initialMode);

  const handleCollectionSelect = (collection: SupportedCollection) => {
    // Blur textarea to prevent keyboard from opening (mobile UX)
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleSelectFavorite = (favorite: { token: Token }) => {
    onTokenSelect(favorite.token);
  };

  const renderSegmentedControl = () => {
    if (hideSegmentedControl) return null;

    if (segmentedControlStyle === 'buttons') {
      return (
        <div className="flex justify-center gap-2 mb-3">
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
      );
    }

    return (
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
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {!selectedCollection && (
        <div className="flex flex-col">
          {renderSegmentedControl()}

          {selectionMode === 'favorites' && (
            <PickFavoriteNFTs
              onTokenSelect={handleSelectFavorite}
              selectedNFT={selectedNFT}
              supportedCollections={supportedCollections}
            />
          )}
          {selectionMode === 'collections' && (
            <SelectCollection
              collections={collections}
              onCollectionSelect={handleCollectionSelect}
              isLoading={isLoadingCollections}
            />
          )}
        </div>
      )}

      {selectedCollection && (
        <>
          {enableMascotMode && selectedCollection.size < 15 ? (
            <SelectMascot
              collection={selectedCollection}
              onBack={handleBack}
              onTokenSelect={setSelectedTokenId}
              onSubmitNFT={onTokenSelect}
            />
          ) : (
            <>
              <SelectTokenId
                collection={selectedCollection}
                onBack={handleBack}
                onTokenSelect={setSelectedTokenId}
              />

              <div className="h-[356px]">
                {selectedTokenId ? (
                  <DisplayNFT
                    collection={selectedCollection}
                    tokenId={selectedTokenId}
                    onClick={onTokenSelect}
                  />
                ) : (
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
        </>
      )}
    </div>
  );
};
