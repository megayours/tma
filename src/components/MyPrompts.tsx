import { useGetMyPrompts } from '@/hooks/usePrompts';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '@/types/prompt';
import { Link, useNavigate } from '@tanstack/react-router';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import type { Content } from '@/types/content';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';

const SkeletonBlock = () => (
  <div className="h-full w-full animate-pulse rounded-md bg-gray-300 dark:bg-zinc-700" />
);

export const RenderPreview = ({
  previews,
  isLoading,
  prompt,
}: {
  previews: Content[];
  isLoading: boolean;
  prompt: Prompt;
}) => {
  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-row gap-2">
        <SkeletonBlock />
      </div>
    );
  }

  // Fall back to prompt's own images/videos/gifs if no previews
  const fallbackImage =
    prompt.images?.[0] ||
    prompt.videos?.[0] ||
    prompt.gifs?.[0] ||
    prompt.stickers?.[0] ||
    prompt.animatedStickers?.[0];

  if (previews.length === 0 && fallbackImage) {
    return (
      <div className="flex h-full w-full flex-row gap-2">
        <div className="h-full w-full">
          <MediaDisplay
            src={fallbackImage}
            alt={prompt.name}
            className="block h-full w-full object-contain"
            poster={prompt.thumbnails?.[0] || '/logo.png'}
          />
        </div>
      </div>
    );
  }

  const firstContent = previews.length > 0 ? previews[0] : null;

  return (
    <div className="flex h-full w-full flex-row gap-2">
      {firstContent ? (
        <div className="h-full w-full">
          {firstContent.status == 'processing' ? (
            <DotLottieReact src={'/lotties/loader.lottie'} loop autoplay />
          ) : (
            <MediaDisplay
              src={
                firstContent.image ||
                firstContent.gif ||
                '/public/gifs/loadings.gif'
              }
              alt={firstContent.id}
              className="block h-full w-full object-contain"
              poster={firstContent.thumbnailUrl || '/logo.png'}
            />
          )}
        </div>
      ) : previews.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
          No content
        </div>
      ) : null}
    </div>
  );
};

export default function MyPrompts() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 6,
  });
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading } = useGetMyPrompts(
    session!,
    pagination,
    {
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    undefined,
    'created_at',
    'desc',
    selectedCommunity
  );

  useEffect(() => {
    if (data?.pagination?.totalPages) {
      setTotalPages(data.pagination.totalPages);
    }
  }, [data?.pagination?.totalPages]);

  if (!session) return <div>No session available</div>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border-tg-section-separator flex flex-col gap-2 rounded-lg border p-2"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden">
                <SkeletonBlock />
              </div>
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-zinc-700" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-300 dark:bg-zinc-700" />
              <div className="h-8 w-full animate-pulse rounded-full bg-gray-300 dark:bg-zinc-700" />
            </div>
          ))}

        {!isLoading &&
          data?.data.map(prompt => {
            const promptPreviews =
              prompt.images?.[0] ||
              prompt.videos?.[0] ||
              prompt.gifs?.[0] ||
              prompt.stickers?.[0] ||
              prompt.animatedStickers?.[0];

            console.log('Prompt Previews:', prompt);
            return (
              <div key={prompt.id}>
                <div className="border-tg-section-separator flex flex-col rounded-lg border p-2">
                  <div className="relative flex h-40 items-center justify-center overflow-hidden">
                    <Link
                      to="/profile/admin/prompt/edit/$promptId"
                      params={{ promptId: prompt.id?.toString() }}
                    >
                      <MediaDisplay
                        src={promptPreviews as string}
                        alt={prompt.name}
                        className="block h-full w-full object-contain"
                        poster={prompt.thumbnails?.[0] || '/logo.png'}
                      />
                    </Link>
                  </div>

                  <h1 className="text-sm font-bold">{prompt.name}</h1>
                  <h2 className="text-sm font-medium">
                    {prompt.type?.replaceAll('_', ' ')}
                  </h2>

                  <div
                    className="bg-tg-button text-tg-button-text mt-2 flex cursor-pointer justify-center rounded-full px-4 py-2 text-sm font-semibold"
                    onClick={() => {
                      navigate({
                        to: '/profile/admin/prompt/edit/$promptId',
                        params: { promptId: prompt.id?.toString() ?? '' },
                      });
                    }}
                  >
                    Modify
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center">
        <Pagination
          page={pagination.page}
          setPage={page => setPagination({ ...pagination, page })}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
