import { Button } from '@telegram-apps/telegram-ui';
import { NFTSelectionFlow } from '@/components/NFT/NFTSelectionFlow';
import { useGetFavorites } from '../../../../hooks/useFavorites';
import { useSession } from '../../../../auth/SessionProvider';
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
  const { favorites } = useGetFavorites(session);

  return (
    <div className="border-tg-section-separator border-t pt-4">
      <NFTSelectionFlow
        collections={collections || []}
        onTokenSelect={onTokenSelect}
        supportedCollections={collections}
        selectedNFT={selectedNFT}
        enableMascotMode={true}
        initialMode={favorites && favorites?.length > 0 ? 'favorites' : 'collections'}
        segmentedControlStyle="buttons"
      />

      <div className="flex justify-center mt-4">
        <Button mode="outline" size="s" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
