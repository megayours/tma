import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge, Button, Cell, Tooltip } from '@telegram-apps/telegram-ui';
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

  const { data: stickerPacks } = useStickerPacks({
    pagination: {
      page: 1,
      size: 10,
    },
  });

  console.log('STICKER PACKS', stickerPacks);
  return (
    <div>
      <div className="flex flex-row items-center gap-2">
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
        <div className="bg-tg-secondary-bg mb-4 flex items-center gap-3 rounded-lg p-3">
          <img
            src={selectedFavorite.token.image || ''}
            alt="Selected NFT"
            className="border-tg-link h-10 w-10 rounded-full border-2 object-cover"
          />
          <div className="flex flex-col">
            <span className="text-tg-text text-sm font-medium">
              Using for sticker generation:
            </span>
            <span className="text-tg-hint text-xs">
              {selectedFavorite.token.name ||
                `Token #${selectedFavorite.token.id}`}
            </span>
          </div>
        </div>
      )}

      {!selectedFavorite && !isLoadingSelected && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="text-sm text-yellow-600">
            ⚠️ No NFT selected. Select an NFT from the profile menu to
            personalize your sticker packs.
          </div>
        </div>
      )}

      {/* All Sticker Packs with Details */}
      <div className="flex flex-col space-y-6 overflow-x-auto pb-20 pl-2">
        {stickerPacks &&
          stickerPacks.data.length > 0 &&
          stickerPacks.data.map(stickerPack => (
            <div
              key={stickerPack.id}
              className="border-tg-section-separator flex flex-col space-y-2 rounded-tl-lg rounded-bl-lg border-2 border-r-0 p-2 pr-0"
            >
              <Link
                to="/sticker-packs/$stickerPackId"
                params={{ stickerPackId: stickerPack.id.toString() }}
                className="block"
              >
                <Cell
                  {...(stickerPack.description && {
                    titleBadge: (
                      <Badge type="number" large={false} mode="secondary">
                        {stickerPack.min_tokens_required ===
                        stickerPack.max_tokens_required
                          ? `${stickerPack.min_tokens_required} token${stickerPack.min_tokens_required !== 1 ? 's' : ''}`
                          : `${stickerPack.min_tokens_required}-${stickerPack.max_tokens_required} tokens`}
                      </Badge>
                    ),
                  })}
                  description={`${stickerPack.item_count} stickers`}
                >
                  {stickerPack.name}
                </Cell>
              </Link>
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
