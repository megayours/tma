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
  const { data: stickerPackData } = useStickerPack(stickerPack.id, session);
  if (!stickerPackData) {
    return null;
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
