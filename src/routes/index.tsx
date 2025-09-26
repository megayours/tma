import { createFileRoute } from '@tanstack/react-router';
import { StickerPacksList } from '@/components/StickerPack/StickerPacksList';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="bg-tg-bg text-tg-text">
      <StickerPacksList />
    </div>
  );
}
