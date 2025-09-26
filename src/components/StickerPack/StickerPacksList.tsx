import { Link } from '@tanstack/react-router';
import { Badge, Button, Cell, Tooltip } from '@telegram-apps/telegram-ui';
import { useRef, useState } from 'react';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { StickerPackItem } from '@/components/StickerPack/StickerPackItem';

export function StickerPacksList() {
  const buttonRef = useRef<HTMLElement>(null!);
  const [showTooltip, setShowTooltip] = useState(false);

  const { data: stickerPacks } = useStickerPacks({
    pagination: {
      page: 1,
      size: 10,
    },
  });

  console.log('STICKER PACKS', stickerPacks);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-row items-center gap-2">
        <h1>Sticker Packs</h1>

        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* <Button
            ref={buttonRef}
            mode="filled"
            size="l"
            disabled
            className="text-tg-text"
          >
            +
          </Button> */}
        </div>
        {showTooltip && <Tooltip targetRef={buttonRef}>Soon</Tooltip>}
      </div>

      {/* All Sticker Packs with Details */}
      <div className="flex flex-col space-y-6 overflow-x-auto pb-20">
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
                  after={
                    <Button mode="filled" size="s">
                      <span className="text-tg-button-text">
                        {stickerPack.pricing.basic.formatted_price
                          ? stickerPack.pricing.basic.formatted_price
                          : 'Free'}
                      </span>
                    </Button>
                  }
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
