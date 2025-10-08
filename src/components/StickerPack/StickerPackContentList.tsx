import { useState } from 'react';
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

const ContentItem = ({ item, packName, index }: ContentItemProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg">
      {imageLoading && (
        <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-300" />
      )}
      {item.preview_url && !imageError ? (
        <img
          src={item.preview_url}
          alt={`${packName || 'Sticker'} ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
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
    <div className="grid grid-cols-3 gap-2 md:gap-4">
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
