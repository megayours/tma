import { createFileRoute } from '@tanstack/react-router';
import { StickerPacksList } from '@/components/StickerPack/StickerPacksList';

export const Route = createFileRoute('/sticker-packs/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <StickerPacksList />;
}
