import { Link } from '@tanstack/react-router';
import type { StickerBundles } from '@/hooks/useStickerPacks';
import { Reshared } from './Reshared';
import { ShareMessage } from './ShareMessage';

export function StickerPackItem({
  stickerPack,
}: {
  stickerPack: StickerBundles;
}) {
  const getLowestPrice = () => {
    const prices = [
      stickerPack.pricing.basic.formatted_price,
      stickerPack.pricing.gold.formatted_price,
      stickerPack.pricing.legendary.formatted_price,
    ].filter(price => price !== null);

    if (prices.length === 0) return 'Free';
    if (prices.length === 1) return prices[0];
    return `From ${prices[0]}`;
  };

  return (
    <div className="bg-tg-section-bg flex w-full flex-col rounded-lg">
      {/* Header with title and price button */}
      <div className="flex items-center justify-between gap-1 px-4 py-2">
        <Link
          to="/sticker-packs/$stickerPackId"
          params={{ stickerPackId: stickerPack.id.toString() }}
        >
          <h2 className="text-xl font-semibold">{stickerPack.name}</h2>
        </Link>
        <Link
          to="/sticker-packs/$stickerPackId"
          params={{ stickerPackId: stickerPack.id.toString() }}
        >
          <button className="bg-tg-button shrink-0 rounded-full px-6 py-2 text-sm font-semibold text-white transition-colors">
            {getLowestPrice() == 'Free' ? 'Get' : getLowestPrice()}
          </button>
        </Link>
      </div>

      {/* Sticker preview grid */}
      <div className="flex flex-row items-end justify-end gap-1 px-4 pb-4">
        <Link
          to="/sticker-packs/$stickerPackId"
          params={{ stickerPackId: stickerPack.id.toString() }}
        >
          <div className="grid w-full max-w-2xl grid-cols-3 gap-1">
            {stickerPack.preview_items.map(
              (item, index) =>
                index < 5 && (
                  <div
                    key={item.content_id || index}
                    className="relative aspect-square overflow-hidden rounded-lg"
                  >
                    <img
                      src={item.preview_url}
                      alt={`${stickerPack.name} preview ${index + 1}`}
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )
            )}
            {stickerPack.item_count > 5 && (
              <div className="p-4">
                <div className="bg-tg-secondary-bg flex h-full w-full items-center justify-center rounded-xl shadow">
                  {stickerPack.item_count - 5} more
                </div>
              </div>
            )}
          </div>
        </Link>
        <div className="flex w-10 flex-col items-center justify-end gap-4 self-end pb-4">
          <Link
            to="/sticker-packs/$stickerPackId"
            params={{ stickerPackId: stickerPack.id.toString() }}
          >
            <Reshared amount={stickerPack.item_count} />
          </Link>
          <ShareMessage
            url={import.meta.env.VITE_PUBLIC_BOT_URL || ''}
            startApp={`/sticker-packs/${stickerPack.id}`}
            withCommunity={true}
          />
        </div>
      </div>
    </div>
  );
}
