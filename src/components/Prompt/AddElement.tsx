import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdAddCircleOutline } from 'react-icons/md';
import { NFTSelectionFlow } from '../NFT/flows';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import type { Prompt } from '../../types/prompt';

interface AddElementProps {
  prompt: Prompt;
  addOptionalNFT: (newToken: Token) => void;
  optionalNFTs: Token[];
  maxOptionalTokens: number;
}

export const AddElement = ({ prompt, addOptionalNFT, optionalNFTs, maxOptionalTokens }: AddElementProps) => {
  const [showAddCloud, setShowAddCloud] = useState(false);

  const { data: collections } = useGetCollectionsWithPrompt(prompt);

  const currentOptionalCount = optionalNFTs.length;
  const canAddOptionalNFT = currentOptionalCount < maxOptionalTokens;

  const handleAddClick = () => {
    if (canAddOptionalNFT) {
      setShowAddCloud(true);
    }
  };

  const handleTokenSelect = (token: Token) => {
    addOptionalNFT(token);
    setShowAddCloud(false);
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.add-cloud')) {
        setShowAddCloud(false);
      }
    };

    if (showAddCloud) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddCloud]);

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
            ? 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:brightness-110 cursor-pointer'
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

      {showAddCloud &&
        (() => {
          const portalContainer = document.getElementById(
            'custom-input-container'
          );
          if (!portalContainer) return null;

          const addCloudContent = (
            <div
              className="add-cloud bg-tg-bg border-tg-hint/20 relative min-h-16 overflow-y-auto rounded-lg border shadow-lg"
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
              onClick={handleCloudClick}
              onWheel={e => {
                e.stopPropagation();
              }}
            >
              <NFTSelectionFlow
                collections={collections || []}
                onTokenSelect={handleTokenSelect}
                enableMascotMode={true}
                segmentedControlStyle="inline"
                className="p-2"
              />
            </div>
          );

          return createPortal(addCloudContent, portalContainer);
        })()}
    </>
  );
};
