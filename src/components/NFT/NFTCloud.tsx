import { createPortal } from 'react-dom';
import { NFTSelectionFlow } from './NFTSelectionFlow';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { Prompt } from '../../types/prompt';
import { useNFTSetsContext } from '@/contexts/NFTSetsContext';
import type { Token } from '../../types/response';

interface NFTCloudProps {
  setIndex: number;
  nftIndex: number;
  prompt: Prompt;
  onClose: () => void;
  isCompulsory: boolean;
}

/**
 * Cloud tooltip component that appears above NFTs when clicked
 * Shows additional options or information for the selected NFT
 * Now keyboard-aware and positions itself properly when keyboard opens
 */
export const NFTCloud = ({
  prompt,
  setIndex,
  nftIndex,
  onClose,
  isCompulsory,
}: NFTCloudProps) => {
  const { data: collections } = useGetCollectionsWithPrompt(prompt);
  const { updateCompulsoryNFTInSet, updateOptionalNFTInSet } =
    useNFTSetsContext();

  const handleTokenSelect = (token: Token) => {
    if (isCompulsory) {
      updateCompulsoryNFTInSet(setIndex, nftIndex, token);
    } else {
      updateOptionalNFTInSet(setIndex, nftIndex, token);
    }
    onClose();
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
      data-cloud-index={`${setIndex}-${nftIndex}`}
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

  return createPortal(cloudContent, portalContainer);
};
