import { createPortal } from 'react-dom';
import { NFTSelectionFlow } from './NFTSelectionFlow';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import { filterFavoritesByCollections } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';

interface NFTCloudProps {
  nftIndex: number;
  prompt: Prompt;
  onClose: () => void;
  isCompulsory: boolean;
  updateCompulsoryNFT: (nftIndex: number, newToken: Token) => void;
  updateOptionalNFT: (nftIndex: number, newToken: Token) => void;
}

/**
 * Cloud tooltip component that appears above NFTs when clicked
 * Shows additional options or information for the selected NFT
 * Now keyboard-aware and positions itself properly when keyboard opens
 */
export const NFTCloud = ({
  prompt,
  nftIndex,
  onClose,
  isCompulsory,
  updateCompulsoryNFT,
  updateOptionalNFT,
}: NFTCloudProps) => {
  const { data: collections, isLoading: isLoadingCollections } =
    useGetCollectionsWithPrompt(prompt);

  const { session } = useSession();
  const { favorites } = useGetFavorites(session);

  const filteredFavorites = filterFavoritesByCollections(
    favorites,
    collections
  );
  const handleTokenSelect = (token: Token) => {
    console.log('Selected token from NFTCloud:', token);
    if (isCompulsory) {
      updateCompulsoryNFT(nftIndex, token);
    } else {
      updateOptionalNFT(nftIndex, token);
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
      className="nft-cloud bg-tg-bg border-tg-hint/20 relative min-h-16 overflow-y-auto rounded-lg border shadow-lg"
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
        initialMode={
          favorites && filteredFavorites && filteredFavorites?.length > 0
            ? 'favorites'
            : 'collections'
        }
        isLoadingCollections={isLoadingCollections}
      />
    </div>
  );

  return createPortal(cloudContent, portalContainer);
};
