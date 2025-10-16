import { Badge } from '@telegram-apps/telegram-ui';
import type { StickerPackDetail } from '@/hooks/useStickerPacks';

interface StickerCollectionHeaderProps {
  stickerPack: StickerPackDetail;
  endDate?: string;
}

export function StickerCollectionHeader({
  stickerPack,
  endDate = undefined,
}: StickerCollectionHeaderProps) {
  return (
    <div className="relative rounded-lg p-2">
      <div className="flex w-full flex-col items-center">
        {/* Collection Info */}
        <div className="w-full">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold">{stickerPack.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge type="number" mode="secondary">
                {stickerPack.item_count} stickers
              </Badge>
              {stickerPack.type === 'animated_stickers' && (
                <Badge type="number" mode="secondary">
                  Animated
                </Badge>
              )}
              {endDate && (
                <Badge
                  type="number"
                  mode={stickerPack.is_active ? 'secondary' : 'critical'}
                >
                  {stickerPack.is_active ? `Ends in ${endDate}` : `Inactive`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
