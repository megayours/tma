import { useState } from 'react';
import { type StickerPackItem } from '@/hooks/useStickerPacks';

interface StickerPackPreviewProps {
  previewItems: StickerPackItem[];
  packName: string;
  maxItems?: number;
}

interface PreviewItemProps {
  item: StickerPackItem;
  packName: string;
  index: number;
}

const PreviewItem = ({ item }: PreviewItemProps) => {
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const handleVideoLoad = () => {
    setVideoLoading(false);
  };

  const handleVideoError = () => {
    setVideoLoading(false);
    setVideoError(true);
  };

  return (
    <div
      className="bg-tg-secondary-bg relative flex-shrink-0 rounded-lg"
      style={{
        width: '250px',
        height: '250px',
      }}
    >
      {videoLoading && (
        <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-300" />
      )}
      {!videoError ? (
        <video
          src={item.preview_url}
          className="h-full w-full object-cover transition-transform hover:scale-110"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        />
      ) : (
        <div className="text-tg-hint flex h-full w-full items-center justify-center text-xs">
          N/A
        </div>
      )}
    </div>
  );
};

export const StickerPackPreview = ({
  previewItems,
  packName,
}: StickerPackPreviewProps) => {
  if (!previewItems.length) {
    return (
      <div className="bg-tg-secondary-bg flex h-20 w-full items-center justify-center rounded-lg">
        <span className="text-tg-hint text-sm">No preview available</span>
      </div>
    );
  }

  return (
    <div className="scrollbar-hide flex flex-row gap-2 overflow-x-auto overflow-y-hidden pb-2">
      {previewItems.map((item, index) => (
        <PreviewItem
          key={`${item.id}-${item.bundle_id}-${index}`}
          item={item}
          packName={packName}
          index={index}
        />
      ))}
    </div>
  );
};
