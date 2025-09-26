import { Badge } from '@telegram-apps/telegram-ui';
import type { StickerPackDetail } from '@/hooks/useStickerPacks';

interface StickerCollectionHeaderProps {
  stickerPack: StickerPackDetail;
  endDate?: string;
}

export function StickerCollectionHeader({
  stickerPack,
  endDate = '22d',
}: StickerCollectionHeaderProps) {
  const featuredSticker = stickerPack.items[0];

  return (
    <div className="relative rounded-lg p-4">
      {/* Token Type Badge - Top Right */}
      <div className="absolute top-4 right-4">
        <Badge type="number" mode="secondary">
          {stickerPack.min_tokens_required === stickerPack.max_tokens_required
            ? `${stickerPack.min_tokens_required} token${stickerPack.min_tokens_required !== 1 ? 's' : ''} needed`
            : `${stickerPack.min_tokens_required}-${stickerPack.max_tokens_required} tokens needed`}
        </Badge>
      </div>

      <div className="flex w-full flex-col items-center space-y-3">
        {/* Featured Sticker */}
        <div className="flex-shrink-0">
          {featuredSticker?.preview_url ? (
            <img
              src={featuredSticker.preview_url}
              alt={`${stickerPack.name} featured sticker`}
              className="h-32 w-32 rounded-lg object-cover shadow-lg"
            />
          ) : (
            <div className="bg-tg-hint/20 flex h-32 w-32 items-center justify-center rounded-lg shadow-lg">
              <span className="text-tg-hint text-sm">No preview</span>
            </div>
          )}
        </div>

        {/* Collection Info */}
        <div className="w-full space-y-3">
          <div className="flex flex-col items-center space-y-2">
            <h1 className="text-2xl font-bold">{stickerPack.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge type="number" mode="secondary">
                {stickerPack.item_count} stickers
              </Badge>
              <Badge type="number" mode="secondary">
                {stickerPack.type === 'stickers' ? 'Static' : 'Animated'}
              </Badge>
              <Badge
                type="number"
                mode={stickerPack.is_active ? 'secondary' : 'critical'}
              >
                {stickerPack.is_active
                  ? `Active • Ends in ${endDate}`
                  : `Inactive • Ends in ${endDate}`}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
