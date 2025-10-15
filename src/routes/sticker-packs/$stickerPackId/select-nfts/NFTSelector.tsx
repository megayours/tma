import { useState, useEffect } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { PickFavoriteNFTs } from '@/components/NFT/PickFavoriteNFTs';
import { SelectCollection } from '@/components/NFT/SelectCollection';
import { SelectTokenId } from '@/components/NFT/SelectTokenId';
import { DisplayNFT } from '@/components/NFT/DisplayNFT';
import type { SupportedCollection } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import { useSession } from '@/auth/SessionProvider';
import { useGetFavorites } from '@/hooks/useFavorites';

interface NFTSelectorProps {
  collections?: SupportedCollection[];
  onTokenSelect: (token: Token) => void;
  selectedNFT?: Token | null;
  onCancel?: () => void;
}

export function NFTSelector({ collections, onTokenSelect, selectedNFT, onCancel }: NFTSelectorProps) {
  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session);
  const [selectionMode, setSelectionMode] = useState<'favorites' | 'collections'>('favorites');
  const [selectedCollection, setSelectedCollection] = useState<SupportedCollection | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  // Switch to collections tab if there are no favorites
  useEffect(() => {
    if (!isLoadingFavorites && (!favorites || favorites.length === 0)) {
      setSelectionMode('collections');
    }
  }, [favorites, isLoadingFavorites]);

  const handleFavoriteSelect = (favorite: { token: Token }) => {
    onTokenSelect(favorite.token);
  };

  const handleCollectionSelect = (collection: SupportedCollection) => {
    setSelectedCollection(collection);
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    // Reset selection after selecting
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleBack = () => {
    setSelectedCollection(null);
    setSelectedTokenId(null);
  };

  const handleCloseSelection = () => {
    setSelectedCollection(null);
    setSelectedTokenId(null);
    // Call parent's onCancel if provided
    if (onCancel) {
      onCancel();
    }
  };

  return (
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
            <PickFavoriteNFTs onTokenSelect={handleFavoriteSelect} selectedNFT={selectedNFT} />
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
  );
}
