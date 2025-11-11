import { useGetMyPrompts } from '@/hooks/usePrompts';
import { useEffect, useState } from 'react';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '@/types/prompt';
import { useNavigate } from '@tanstack/react-router';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';

const SkeletonCard = () => (
  <div className="h-48 w-[150px] shrink-0 animate-pulse rounded-lg bg-gray-300 dark:bg-zinc-700" />
);

const PromptCard = ({ prompt }: { prompt: Prompt }) => {
  const navigate = useNavigate();

  // Get the first available content URL
  const getContentUrl = () => {
    if (prompt.stickers && prompt.stickers.length > 0)
      return prompt.stickers[0];
    if (prompt.gifs && prompt.gifs.length > 0) return prompt.gifs[0];
    if (prompt.images && prompt.images.length > 0) return prompt.images[0];
    if (prompt.videos && prompt.videos.length > 0) return prompt.videos[0];
    return null;
  };

  const contentUrl = getContentUrl();

  return (
    <div
      onClick={() =>
        navigate({
          to: '/profile/prompt/edit/$promptId',
          params: { promptId: prompt.id!.toString() },
        })
      }
      className="bg-tg-section-bg hover:bg-tg-section-bg/80 flex h-48 w-[150px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-lg transition-colors"
    >
      {/* Content Preview */}
      <div className="relative flex h-32 w-full items-center justify-center bg-white p-2">
        {contentUrl ? (
          <img
            src={contentUrl}
            alt={prompt.name || 'Prompt content'}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-tg-hint flex h-full w-full items-center justify-center text-xs">
            No content
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3 className="text-tg-text line-clamp-2 text-xs font-semibold">
          {prompt.name || 'Untitled'}
        </h3>
        <div className="text-tg-hint text-xs">
          v{prompt.versions?.[0]?.version || 0}
        </div>
      </div>
    </div>
  );
};

export function RecentlyUsedPrompts() {
  const { session } = useSession();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading } = useGetMyPrompts(
    session!,
    pagination,
    {
      sortBy: 'updated_at',
      sortOrder: 'desc',
    },
    undefined,
    'updated_at',
    'desc'
  );

  useEffect(() => {
    if (data?.pagination.totalPages !== totalPages) {
      setTotalPages(data?.pagination.totalPages);
    }
  }, [data]);

  if (!session) return null;

  const handlePrevious = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  const handleNext = () => {
    if (pagination.page < totalPages) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-tg-text text-xl font-bold">Prompt Previews</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={pagination.page === 1 || isLoading}
            className="text-tg-button hover:bg-tg-section-bg disabled:text-tg-hint flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <IoChevronBackOutline size={20} />
          </button>
          <span className="text-tg-hint text-sm">
            {pagination.page} / {totalPages || 1}
          </span>
          <button
            onClick={handleNext}
            disabled={pagination.page >= totalPages || isLoading}
            className="text-tg-button hover:bg-tg-section-bg disabled:text-tg-hint flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <IoChevronForwardOutline size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
        <div className="flex gap-2">
          {isLoading &&
            Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}

          {!isLoading &&
            data?.data?.map((prompt: Prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}

          {!isLoading && (!data?.data || data.data.length === 0) && (
            <div className="text-tg-hint flex h-48 w-full items-center justify-center text-sm">
              No recently used prompts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
