import { useGetMyPrompts } from '@/hooks/usePrompts';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '@/types/prompt';
import { useNavigate } from '@tanstack/react-router';
import { useGetPreviewContent } from '../hooks/useContents';

const SkeletonBlock = () => (
  <div className="h-full w-full animate-pulse rounded-md bg-gray-300 dark:bg-zinc-700" />
);

export const RenderPreview = ({ prompt }: { prompt: Prompt }) => {
  const { session } = useSession();
  const { data, isLoading } = useGetPreviewContent(session, prompt.id, {
    page: 1,
    size: 1,
  });

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-row gap-2">
        <SkeletonBlock />
      </div>
    );
  }

  return (
    <div
      className={`flex h-full flex-row gap-2 ${
        data?.content.length === 0 ? '' : 'scrollbar-hide overflow-x-scroll'
      }`}
    >
      {data?.content.map(content => (
        <div key={content.id} className="h-full w-full">
          <img
            src={content.image || content.gif || '/public/gifs/loadings.gif'}
            alt={content.id}
            className="block h-full w-full object-contain"
          />
        </div>
      ))}

      {data?.content.length === 0 && (
        <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
          No content
        </div>
      )}
    </div>
  );
};

export default function MyPrompts() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 6,
  });
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading } = useGetMyPrompts(session!, pagination, {
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (data?.pagination.totalPages !== totalPages) {
      setTotalPages(data?.pagination.totalPages);
    }
  }, [data]);

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
          data?.data.map((prompt: Prompt) => (
            <div key={prompt.id}>
              <div className="border-tg-section-separator flex flex-col rounded-lg border p-2">
                <div className="relative flex h-40 items-center justify-center overflow-hidden">
                  <RenderPreview prompt={prompt} />
                </div>

                <h1 className="text-sm font-bold">{prompt.name}</h1>
                <h2 className="text-sm font-medium">
                  {prompt.type?.replaceAll('_', ' ')}
                </h2>

                <div
                  className="bg-tg-button text-tg-button-text mt-2 flex cursor-pointer justify-center rounded-full px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    navigate({
                      to: '/profile/prompt/edit/$promptId',
                      params: { promptId: prompt.id?.toString() ?? '' },
                    });
                  }}
                >
                  Modify
                </div>
              </div>
            </div>
          ))}
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
