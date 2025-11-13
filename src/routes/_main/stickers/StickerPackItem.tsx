import type { StickerBundles } from '@/hooks/useStickerPacks';

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
      <div className="flex items-center justify-between gap-3 px-4 py-2">
        <h2 className="text-lg font-semibold">{stickerPack.name}</h2>
        {getLowestPrice() != 'Free' && (
          <button className="bg-tg-button text-tg-button-text shrink-0 rounded-full px-6 py-2 text-xs font-semibold transition-colors">
            {getLowestPrice()}
          </button>
        )}
      </div>

      {/* Sticker preview grid */}
      <div className="flex items-center justify-center px-4 pb-4">
        <div className="grid w-full max-w-2xl grid-cols-2 gap-1">
          {stickerPack.preview_items.map(
            (item, index) =>
              index < 3 && (
                <div
                  key={item.content_id || index}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <img
                    src={item.preview_url}
                    alt={`${stickerPack.name} preview ${index + 1}`}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
              )
          )}
          {stickerPack.preview_items.length > 3 && (
            <div className="bg-tg-section-separator/60 text-tg-text m-2 flex items-center justify-center rounded-full p-2 text-center text-xs font-semibold">
              +{stickerPack.preview_items.length - 3} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
