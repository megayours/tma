import type { StickerBundles } from '../../hooks/useStickerPacks';

export function StickerPackItem({
  stickerPack,
}: {
  stickerPack: StickerBundles;
}) {
  // Determine the lowest non-null price
  const getLowestPrice = () => {
    const prices = [
      stickerPack.pricing.basic.formatted_price,
      stickerPack.pricing.gold.formatted_price,
      stickerPack.pricing.legendary.formatted_price,
    ].filter(price => price !== null);

    if (prices.length === 0) return 'Free';

    // If there's only one price, return it
    if (prices.length === 1) return prices[0];

    // If multiple prices, return the first one with "Starting from"
    return `From ${prices[0]}`;
  };

  return (
    <div className="border-tg-section-separator flex w-full flex-col rounded-tl-lg rounded-bl-lg border-2 p-2 py-4">
      <div className="flex items-center justify-between gap-3 px-4 pb-3">
        <div className="text-xl font-bold">{stickerPack.name}</div>
        <button className="bg-tg-button shrink-0 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-colors">
          {getLowestPrice()}
        </button>
      </div>
      <div className="flex items-center justify-center px-4">
        <div className="grid w-full max-w-2xl grid-cols-5 gap-1.5">
          {stickerPack.preview_items.map((item, index) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
