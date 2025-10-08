import { StickerPackPreview } from './StickerPackPreview';
import { useStickerPack, type StickerBundles } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';

interface StickerPackItemProps {
  stickerPack: StickerBundles;
  onPurchase: (stickerPack: StickerBundles) => void;
}

export function StickerPackItem({
  stickerPack,
  // onPurchase,
}: StickerPackItemProps) {
  const { session } = useSession();
  const { data: stickerPackData, isLoading } = useStickerPack(
    stickerPack.id,
    session
  );

  if (isLoading || !stickerPackData) {
    return (
      <div className="space-y-2">
        <div className="scrollbar-hide flex flex-row gap-2 overflow-x-auto overflow-y-hidden pb-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="bg-gray-300 relative flex-shrink-0 rounded-lg animate-pulse"
              style={{
                width: '250px',
                height: '250px',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <StickerPackPreview
        previewItems={stickerPackData.items}
        packName={stickerPackData.name}
      />
    </div>
  );
}
