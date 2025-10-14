import { createFileRoute, Link } from '@tanstack/react-router';
import { StickerPackItem } from '@/routes/landing/StickerPackItem';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useWebAppStartParam } from '@/hooks/useWebAppStartParam';

export const Route = createFileRoute('/landing/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Landing />;
}

export function Landing() {
  console.log('useWebAppStartParam', useWebAppStartParam());
  console.log('useWebAppStartParam', useWebAppStartParam()?.collections);
  const { data: stickerPacks } = useStickerPacks({
    pagination: {
      page: 1,
      size: 10,
    },
    tokenCollections: useWebAppStartParam()?.collections || undefined,
  });

  return (
    <div className="bg-tg-secondary-bg flex h-screen snap-y snap-mandatory flex-col gap-2 overflow-y-scroll">
      {stickerPacks?.data.map(stickerPack => (
        <Link
          key={stickerPack.id}
          to="/sticker-packs/$stickerPackId"
          params={{ stickerPackId: stickerPack.id.toString() }}
          className="bg-tg-section-bg flex shrink-0 snap-start flex-col"
        >
          <StickerPackItem stickerPack={stickerPack} />
          {/* <div className="flex h-20 bg-blue-500">
            <div className="flex flex-1">
              <span className="font-bold text-white">Button</span>
            </div>
          </div> */}
        </Link>
      ))}
      <div className="flex flex-col gap-2">
        <Link to="/sticker-packs">Link to Sticker Packs</Link>
        <Link to="/feed">Link to Feed</Link>
        <Link to="/about">Check about</Link>
      </div>
    </div>
  );
}
