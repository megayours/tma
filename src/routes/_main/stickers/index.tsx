import { createFileRoute, Link } from '@tanstack/react-router';
import { StickerPackItem } from '@/routes/_main/stickers/StickerPackItem';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { SpinnerFullPage, TopLoadingBar } from '@/components/ui';

export const Route = createFileRoute('/_main/stickers/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <Landing />;
}

export function Landing() {
  const {
    selectedCommunity: community,
    isLoading: isLoadingCommunity,
    isRefetching,
  } = useSelectCommunity();
  console.log('Selected community in stickers:', community);

  const { data: stickerPacks } = useStickerPacks({
    pagination: {
      page: 1,
      size: 10,
    },
    communityId: community?.id,
  });

  if (isLoadingCommunity && !community)
    return <SpinnerFullPage text="Loading Sticker Packs..." />;

  return (
    <>
      {isRefetching && <TopLoadingBar />}
      <div className="bg-tg-secondary-bg scrollbar-hide flex w-full flex-col items-center gap-2 overflow-y-scroll pt-2">
        {stickerPacks?.data.map(stickerPack => (
          <div
            key={stickerPack.id}
            className="bg-tg-section-bg flex w-full shrink-0 snap-start flex-col items-center"
          >
            <StickerPackItem stickerPack={stickerPack} />
          </div>
        ))}
        <div className="h-20"></div>
        {!import.meta.env.PROD && (
          <div className="flex flex-col gap-2">
            <Link to="/sticker-packs">Link to Sticker Packs</Link>
            <Link to="/profile/notifications">Notifications</Link>
            <Link to="/community">Link to Community</Link>
            <Link to="/about">Check about</Link>
          </div>
        )}
      </div>
    </>
  );
}
