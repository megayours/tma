import type { StickerPackItem } from '@/hooks/useStickerPacks';

interface StickerPackContentListProps {
  items: StickerPackItem[];
  packName?: string;
}

interface ContentItemProps {
  item: StickerPackItem;
  packName?: string;
  index: number;
}

const ContentItem = ({ item }: ContentItemProps) => {
  const displayUrl = item.thumbnailUrl || item.preview_url;
  return (
    <div className="bg-tg-hint/10 relative flex aspect-square overflow-hidden rounded-lg">
      {displayUrl ? (
        <img
          src={displayUrl}
          className="h-full w-full object-cover"
          alt="Sticker preview"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="bg-tg-hint/20 flex h-full w-full items-center justify-center">
          <span className="text-tg-hint text-xs">No preview</span>
        </div>
      )}
    </div>
  );
};

export const StickerPackContentList = ({
  items,
  packName,
}: StickerPackContentListProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-tg-secondary-bg flex h-32 w-full items-center justify-center rounded-lg">
        <span className="text-tg-hint text-sm">No items available</span>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-3 place-items-center gap-1">
      {items.map((item, index) => (
        <ContentItem
          key={`${item.id}-${index}`}
          item={item}
          packName={packName}
          index={index}
        />
      ))}
    </div>
  );
};
