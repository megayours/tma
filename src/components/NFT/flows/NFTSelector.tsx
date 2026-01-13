import { Button } from '@telegram-apps/telegram-ui';
import { NFTSelectionFlow } from './NFTSelectionFlow';
import {
  useGetFavorites,
  filterFavoritesByCollections,
} from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { type SupportedCollection } from '@/hooks/useCollections';
import type { Token } from '@/types/response';

interface NFTSelectorProps {
  collections?: SupportedCollection[];
  onTokenSelect: (token: Token) => void;
  selectedNFT?: Token | null;
  onCancel?: () => void;
}

export function NFTSelector({
  collections,
  onTokenSelect,
  selectedNFT,
  onCancel,
}: NFTSelectorProps) {
  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session);
  const filteredFavorites = filterFavoritesByCollections(
    favorites,
    collections
  );

  if (isLoadingFavorites) {
    return null;
  }

  return (
    <div className="border-tg-section-separator border-t pt-4">
      <NFTSelectionFlow
        collections={collections || []}
        onTokenSelect={onTokenSelect}
        supportedCollections={collections}
        selectedNFT={selectedNFT}
        enableMascotMode={true}
        initialMode={
          favorites && filteredFavorites && filteredFavorites?.length > 0
            ? 'favorites'
            : 'collections'
        }
        segmentedControlStyle="buttons"
      />

      <div className="mt-4 flex justify-center">
        <Button mode="outline" size="s" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
