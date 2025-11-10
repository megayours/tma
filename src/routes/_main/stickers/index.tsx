import { createFileRoute, Link } from '@tanstack/react-router';
import { StickerPackItem } from '@/routes/_main/stickers/StickerPackItem';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

export const Route = createFileRoute('/_main/stickers/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Landing />;
}

export function Landing() {
  const { selectedCommunity: community } = useSelectCommunity();
  console.log('Selected community in stickers:', community);

  const { data: stickerPacks } = useStickerPacks({
    pagination: {
      page: 1,
      size: 10,
    },
    tokenCollections: community?.collections || undefined,
  });

  return (
    <div className="bg-tg-secondary-bg scrollbar-hide flex flex-col gap-2 overflow-y-scroll pt-2">
      {stickerPacks?.data.map(stickerPack => (
        <Link
          key={stickerPack.id}
          to="/sticker-packs/$stickerPackId"
          params={{ stickerPackId: stickerPack.id.toString() }}
          className="bg-tg-section-bg flex shrink-0 snap-start flex-col"
        >
          <StickerPackItem stickerPack={stickerPack} />
        </Link>
      ))}
      <div className="h-20"></div>
      {!import.meta.env.PROD && (
        <div className="flex flex-col gap-2">
          <Link to="/sticker-packs">Link to Sticker Packs</Link>
          <Link to="/feed">Link to Feed</Link>
          <Link to="/about">Check about</Link>
        </div>
      )}
    </div>
  );
}
