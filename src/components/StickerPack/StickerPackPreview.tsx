import { type StickerPackItem } from '@/hooks/useStickerPacks';

interface StickerPackPreviewProps {
  previewItems: StickerPackItem[];
  packName: string;
  maxItems?: number;
}

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
    <div className="flex flex-row gap-2 overflow-x-auto pb-2">
      {previewItems.map((item, index) => (
        <div
          key={`${item.id}-${item.bundle_id}-${index}`}
          className="bg-tg-secondary-bg relative flex-shrink-0 rounded-lg"
          style={{
            width: '250px',
            height: '250px',
          }}
        >
          <img
            src={item.preview_url}
            alt={`${packName} preview ${index + 1}`}
            className="h-full w-full object-cover transition-transform hover:scale-110"
            loading="lazy"
            onError={e => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="flex h-full w-full items-center justify-center text-xs text-tg-hint">
                    N/A
                  </div>
                `;
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};
