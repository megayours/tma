import { AiOutlineRetweet } from 'react-icons/ai';
import type { StickerBundles } from '@/hooks/useStickerPacks';

export function Reshared({ stickerPack }: { stickerPack: StickerBundles }) {
  return (
    <div className="h-full w-full">
      <AiOutlineRetweet className="h-full w-full" />
      {stickerPack}
    </div>
  );
}
