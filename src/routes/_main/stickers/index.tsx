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

// Skeleton placeholder component for loading state - matches StickerPackItem structure
const StickerPackSkeleton = () => (
  <div className="bg-tg-section-bg flex w-full flex-col rounded-lg">
    {/* Header with title and price button */}
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      {/* Title placeholder */}
      <div className="h-7 max-w-xs flex-1 animate-pulse rounded bg-gray-300 dark:bg-zinc-700" />
      {/* Price button placeholder */}
      <div className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-gray-300 dark:bg-zinc-700" />
    </div>

    {/* Sticker preview grid */}
    <div className="flex flex-col items-center gap-1 px-4 pb-4">
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className="grid grid-cols-2 items-center gap-1 md:grid-cols-4">
          {/* Three sticker placeholders */}
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="max0h048 relative aspect-square h-48 w-full overflow-hidden rounded-lg"
            >
              <div className="h-48 w-full animate-pulse rounded-lg bg-gray-300 dark:bg-zinc-700" />
            </div>
          ))}
          {/* "+ X more" placeholder */}
          <div className="bg-tg-secondary-bg flex h-full w-full items-center justify-center rounded-xl font-bold shadow">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-300 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
      {/* Bottom actions: Reshared count and share button */}
      <div className="flex w-full flex-row justify-end gap-4 pt-2">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-300 dark:bg-zinc-700" />
        <div className="h-6 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-zinc-700" />
      </div>
    </div>
  </div>
);

export function Landing() {
  const {
    selectedCommunity: community,
    isLoading: isLoadingCommunity,
    isRefetching,
  } = useSelectCommunity();
  console.log('Selected community in stickers:', community);

  const { data: stickerPacks, isLoading: isLoadingStickerPacks } =
    useStickerPacks({
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
      {(isRefetching || isLoadingStickerPacks) && <TopLoadingBar />}
      <div className="bg-tg-secondary-bg scrollbar-hide flex w-full flex-col items-center gap-2 overflow-y-scroll pt-2">
        {isLoadingStickerPacks && !stickerPacks ? (
          // Show skeleton placeholders while loading
          <>
            {[...Array(3)].map((_, index) => (
              <StickerPackSkeleton key={index} />
            ))}
          </>
        ) : (
          // Show actual sticker packs
          stickerPacks?.data.map(stickerPack => (
            <StickerPackItem key={stickerPack.id} stickerPack={stickerPack} />
          ))
        )}
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
