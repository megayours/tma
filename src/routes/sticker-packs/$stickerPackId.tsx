import { createFileRoute, Outlet } from '@tanstack/react-router';
import { StickerPackPurchaseProvider } from '@/contexts/StickerPackPurchaseContext';
import { StickerPackAnimationProvider } from '@/contexts/StickerPackAnimationContext';

export const Route = createFileRoute('/sticker-packs/$stickerPackId')({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <StickerPackPurchaseProvider>
      <StickerPackAnimationProvider>
        <Outlet />
      </StickerPackAnimationProvider>
    </StickerPackPurchaseProvider>
  );
}
