import { createFileRoute, Outlet } from '@tanstack/react-router';
import { StickerPackAnimationProvider } from '@/contexts/StickerPackAnimationContext';

export const Route = createFileRoute('/sticker-packs/$stickerPackId')({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <StickerPackAnimationProvider>
      <Outlet />
    </StickerPackAnimationProvider>
  );
}
