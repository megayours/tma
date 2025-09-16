import { createFileRoute } from '@tanstack/react-router';
import { Button, Cell, Tooltip } from '@telegram-apps/telegram-ui';
import { useRef, useState } from 'react';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { StickerPackItem } from '@/components/StickerPack/StickerPackItem';
import { PurchaseButton } from '@/components/StickerPack/PurchaseButton';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';

export const Route = createFileRoute('/sticker-packs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useSession();
  const buttonRef = useRef<HTMLElement>(null!);
  const [showTooltip, setShowTooltip] = useState(false);
  const { selectedFavorite } = useSelectedNFTs();
  const { isLoadingSelected } = useGetFavorites(session);

  const { data: stickerPacks } = useStickerPacks(
    {
      pagination: {
        page: 1,
        size: 10,
      },
    },
    session
  );

  console.log('STICKER PACKS', stickerPacks);
  return (
    <div>
      <div className="flex flex-row gap-2 items-center">
        <h1>Sticker Packs</h1>

        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Button
            ref={buttonRef}
            mode="filled"
            size="l"
            disabled
            className="text-tg-text"
          >
            +
          </Button>
        </div>
        {showTooltip && <Tooltip targetRef={buttonRef}>Soon</Tooltip>}
      </div>

      {/* Selected NFT Display */}
      {selectedFavorite && !isLoadingSelected && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-tg-secondary-bg rounded-lg">
          <img
            src={selectedFavorite.token.image || ''}
            alt="Selected NFT"
            className="h-10 w-10 rounded-full object-cover border-2 border-tg-link"
          />
          <div className="flex flex-col">
            <span className="text-tg-text text-sm font-medium">
              Using for sticker generation:
            </span>
            <span className="text-tg-hint text-xs">
              {selectedFavorite.token.name || `Token #${selectedFavorite.token.id}`}
            </span>
          </div>
        </div>
      )}

      {(!selectedFavorite && !isLoadingSelected) && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-yellow-600 text-sm">
            ⚠️ No NFT selected. Select an NFT from the profile menu to personalize your sticker packs.
          </div>
        </div>
      )}

      {/* All Sticker Packs with Details */}
      <div className="flex flex-col space-y-6 overflow-x-auto">
        {stickerPacks &&
          stickerPacks.data.length > 0 &&
          stickerPacks.data.map(stickerPack => (
            <div key={stickerPack.id} className="flex flex-col space-y-2">
              <Cell
                subtitle={stickerPack.description}
                description={`${stickerPack.item_count} stickers`}
                after={<PurchaseButton stickerPackId={stickerPack.id} />}
              ></Cell>
              <StickerPackItem
                stickerPack={stickerPack}
                onPurchase={stickerPack => {
                  console.log(`Purchase sticker pack: ${stickerPack.name}`);
                }}
              />
            </div>
          ))}

        {stickerPacks && stickerPacks.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-tg-hint text-lg">No sticker packs available</p>
            <p className="text-tg-hint mt-1 text-sm">
              Check back later for new packs!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
