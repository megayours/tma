import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SelectCollection } from './SelectCollection';
import { SelectTokenId } from './SelectTokenId';
import { DisplayNFT } from './DisplayNFT';
import { PickFavoriteNFTs } from './PickFavoriteNFTs';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { Prompt } from '../../types/prompt';
import { useNFTSetsContext } from '@/contexts/NFTSetsContext';
import type { Token } from '../../types/response';

interface NFTCloudProps {
  setIndex: number;
  nftIndex: number;
  prompt: Prompt;
  onClose: () => void;
}

/**
 * Cloud tooltip component that appears above NFTs when long pressed
 * Shows additional options or information for the selected NFT
 * Now keyboard-aware and positions itself properly when keyboard opens
 */
export const NFTCloud = ({
  prompt,
  setIndex,
  nftIndex,
  onClose,
}: NFTCloudProps) => {
  const { data: collections } = useGetCollectionsWithPrompt(prompt);
  const [selectedCollection, setSelectedCollection] =
    useState<SupportedCollection | null>(null);
  const [selectedTokenId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    'favorites' | 'collections'
  >('favorites');
  const { updateNFTInSet } = useNFTSetsContext();

  const handleCollectionSelect = (collection: SupportedCollection) => {
    console.log('NFTCloud: Collection selected:', collection.name);
    // Remove focus from any active textarea to prevent keyboard from opening
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
  };

  const handleTokenSelect = (tokenId: string) => {
    const newToken = {
      contract: selectedCollection! as SupportedCollection,
      id: tokenId,
    };
    updateNFTInSet(setIndex, nftIndex, newToken);
  };

  const handleSelectFavorite = (favorite: { token: Token }) => {
    const newToken = favorite.token;

    console.log('newToken', newToken);
    updateNFTInSet(setIndex, nftIndex, newToken);
    onClose(); // Close the cloud
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Find the custom-input-container element
  const portalContainer = document.getElementById('custom-input-container');

  if (!portalContainer) {
    return null;
  }

  const cloudContent = (
    <div
      className="bg-tg-bg border-tg-hint/20 relative min-h-16 overflow-y-auto rounded-lg border shadow-lg"
      style={{
        maxHeight: '60vh',
        minHeight: '64px',
        height: 'auto',
        overflow: 'auto',
        zIndex: 9999,
        position: 'relative',
        pointerEvents: 'auto',
        userSelect: 'auto',
      }}
      data-cloud-index={`${setIndex}-${nftIndex}`} // Used to identify this specific cloud for click-outside detection
      onClick={handleCloudClick}
      onWheel={e => {
        e.stopPropagation();
        console.log('NFTCloud wheel event:', e.deltaY);
      }}
      onScroll={e => {
        console.log('NFTCloud scroll event:', e.currentTarget.scrollTop);
      }}
    >
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
            <PickFavoriteNFTs onTokenSelect={handleSelectFavorite} />
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
            onTokenSelect={handleTokenSelect}
          />

          <div className="h-[336px]">
            {selectedCollection && selectedTokenId && (
              <DisplayNFT
                collection={selectedCollection}
                tokenId={selectedTokenId}
              />
            )}
            {selectedCollection && !selectedTokenId && (
              <div className="flex flex-col gap-4 p-4">
                {/* Placeholder image with same height as DisplayNFT */}
                <div className="flex justify-center">
                  <div className="bg-tg-secondary flex w-64 items-center justify-center rounded-lg">
                    <div className="text-tg-hint text-center text-sm">
                      Select a token ID to view NFT
                    </div>
                  </div>
                </div>

                {/* Placeholder title */}
                <div className="text-tg-hint text-center text-lg font-medium">
                  {selectedCollection.name}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return createPortal(cloudContent, portalContainer);
};
