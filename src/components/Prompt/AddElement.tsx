import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdAddCircleOutline } from 'react-icons/md';
import { useNFTSetsContext } from '@/contexts/NFTSetsContext';
import { SelectCollection } from '../NFT/SelectCollection';
import { SelectTokenId } from '../NFT/SelectTokenId';
import { DisplayNFT } from '../NFT/DisplayNFT';
import { PickFavoriteNFTs } from '../NFT/PickFavoriteNFTs';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { SupportedCollection } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import type { Prompt } from '../../types/prompt';

interface AddElementProps {
  prompt: Prompt;
  setIndex: number;
}

export const AddElement = ({ prompt, setIndex }: AddElementProps) => {
  const [showAddCloud, setShowAddCloud] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<SupportedCollection | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<
    'favorites' | 'collections'
  >('favorites');

  const { optionalNFTs, maxOptionalTokens, addOptionalNFT } =
    useNFTSetsContext();
  const { data: collections } = useGetCollectionsWithPrompt(prompt);

  // Check if we can add more optional NFTs to this set
  const currentOptionalCount = optionalNFTs[setIndex]?.length || 0;
  const canAddOptionalNFT = currentOptionalCount < maxOptionalTokens;

  // Handle add button click
  const handleAddClick = () => {
    if (canAddOptionalNFT) {
      setShowAddCloud(true);
    }
  };

  const handleCollectionSelect = (collection: SupportedCollection) => {
    // Remove focus from any active textarea to prevent keyboard from opening
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleTokenSelect = (token: Token) => {
    addOptionalNFT(setIndex, token);
    setShowAddCloud(false);
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleSelectFavorite = (favorite: { token: Token }) => {
    addOptionalNFT(setIndex, favorite.token);
    setShowAddCloud(false);
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle click outside to close cloud
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`[data-cloud-index="add-${setIndex}"]`)) {
        setShowAddCloud(false);
        setSelectedCollection(null);
        setSelectedTokenId(null);
      }
    };

    if (showAddCloud) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddCloud, setIndex]);

  // Don't render if max optional tokens is 0
  if (maxOptionalTokens === 0) {
    return null;
  }

  return (
    <>
      {/* Larger plus button to add an optional NFT to the set - styled like NFTItem */}
      <div
        className={`flex h-8 flex-row items-center justify-center gap-2 rounded-full px-2 transition-colors ${
          canAddOptionalNFT
            ? 'bg-tg-secondary-bg hover:bg-tg-section-separator cursor-pointer'
            : 'bg-tg-hint/20 cursor-not-allowed opacity-50'
        }`}
        onClick={handleAddClick}
      >
        <div className="flex items-center">
          <MdAddCircleOutline className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium">
          {canAddOptionalNFT ? 'Add Optional' : `Max ${maxOptionalTokens}`}
        </span>
      </div>

      {/* Add Cloud Portal */}
      {showAddCloud &&
        (() => {
          const portalContainer = document.getElementById(
            'custom-input-container'
          );
          if (!portalContainer) return null;

          const addCloudContent = (
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
              data-cloud-index={`add-${setIndex}`}
              onClick={handleCloudClick}
              onWheel={e => {
                e.stopPropagation();
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

                  <div className="h-[356px]">
                    {selectedCollection && selectedTokenId && (
                      <DisplayNFT
                        collection={selectedCollection}
                        tokenId={selectedTokenId}
                        onClick={handleTokenSelect}
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

          return createPortal(addCloudContent, portalContainer);
        })()}
    </>
  );
};
