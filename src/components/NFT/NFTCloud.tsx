import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SelectCollection } from './SelectCollection';
import { SelectTokenId } from './SelectTokenId';
import { DisplayNFT } from './DisplayNFT';
import type { SupportedCollection } from '@/hooks/useCollections';

interface NFTCloudProps {
  index: number;
  supportedCollections: SupportedCollection[];
}

/**
 * Cloud tooltip component that appears above NFTs when long pressed
 * Shows additional options or information for the selected NFT
 * Now keyboard-aware and positions itself properly when keyboard opens
 */
export const NFTCloud = ({ index, supportedCollections }: NFTCloudProps) => {
  const [selectedCollection, setSelectedCollection] =
    useState<SupportedCollection | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

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
    console.log(
      'Selected token:',
      tokenId,
      'for collection:',
      selectedCollection?.name
    );
    setSelectedTokenId(tokenId);
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  console.log('NFTCloud: supportedCollections:', supportedCollections);

  // Find the custom-input-container element
  const portalContainer = document.getElementById('custom-input-container');

  if (!portalContainer) {
    return null;
  }

  const cloudContent = (
    <div
      className="bg-tg-bg border-tg-hint/20 relative min-h-16 overflow-y-auto rounded-lg border shadow-lg"
      style={{
        minHeight: '64px',
        height: 'auto',
        overflow: 'auto',
        zIndex: 9999,
        position: 'relative',
        pointerEvents: 'auto',
        userSelect: 'auto',
      }}
      data-cloud-index={index} // Used to identify this specific cloud for click-outside detection
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
        <SelectCollection
          collections={supportedCollections || []}
          onCollectionSelect={handleCollectionSelect}
          size="s"
        />
      )}
      {selectedCollection && (
        <SelectTokenId
          collection={selectedCollection}
          onBack={handleBack}
          onTokenSelect={handleTokenSelect}
        />
      )}
      {selectedCollection && selectedTokenId && (
        <DisplayNFT collection={selectedCollection} tokenId={selectedTokenId} />
      )}
    </div>
  );

  return createPortal(cloudContent, portalContainer);
};
