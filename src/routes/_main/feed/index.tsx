import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetRecommendedPrompts } from '@/hooks/usePrompts';
import type { PromptWithContent } from '@/types/content';
import { Spinner } from '@/components/ui';
import { useSession } from '@/auth/SessionProvider';

export const Route = createFileRoute('/_main/feed/')({
  component: Feed,
});

type ContentTypeFilter =
  | 'images'
  | 'videos'
  | 'gifs'
  | 'stickers'
  | 'animated_stickers';

// Helper function to get display label for prompt type
const getTypeLabel = (
  type: 'images' | 'videos' | 'stickers' | 'gifs' | 'animated_stickers'
): string => {
  switch (type) {
    case 'images':
      return 'Image';
    case 'videos':
      return 'GIF'; // Display videos as GIF
    case 'stickers':
      return 'Sticker';
    case 'gifs':
      return 'GIF';
    case 'animated_stickers':
      return 'Animated';
    default:
      return type;
  }
};

export function Feed() {
  const { session } = useSession();
  const navigate = useNavigate();

  const [allPrompts, setAllPrompts] = useState<PromptWithContent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ContentTypeFilter[]>([]);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const triggerRef = useRef<HTMLDivElement>(null);

  // Determine query type based on selections
  const queryType: ContentTypeFilter | 'all' =
    selectedTypes.length === 0 ? 'all' : selectedTypes[0];

  // Fetch current page using the hook
  const { data, isLoading, error } = useGetRecommendedPrompts({
    type: queryType,
    excludeUsed: false,
    pagination: {
      page: currentPage,
      size: 10,
    },
    enabled: true,
  });

  // Toggle content type selection
  const toggleType = (type: ContentTypeFilter | 'all') => {
    if (type === 'all') {
      // Clear all filters to show all content
      setSelectedTypes([]);
    } else {
      setSelectedTypes(prev => {
        if (prev.includes(type)) {
          return prev.filter(t => t !== type);
        } else {
          // For now, only allow one selection since API doesn't support multiple
          return [type];
        }
      });
    }
    // Reset pagination when filter changes
    setCurrentPage(1);
    setAllPrompts([]);
    loadedPagesRef.current.clear();
  };

  // Navigate to content creation flow
  const handleMakeItYours = (prompt: PromptWithContent) => {
    navigate({
      to: '/content/$promptId/details',
      params: { promptId: prompt.id.toString() },
    });
  };

  // Accumulate prompts as new pages load
  useEffect(() => {
    if (
      data &&
      data.prompts.length > 0 &&
      !loadedPagesRef.current.has(currentPage)
    ) {
      console.log('Loading page:', currentPage);
      setAllPrompts(prev => {
        // Avoid duplicates by checking if page was already added
        const existingIds = new Set(prev.map(p => p.id));
        const newPrompts = data.prompts.filter(p => !existingIds.has(p.id));
        if (newPrompts.length === 0) return prev; // Don't update if no new prompts
        return [...prev, ...newPrompts];
      });
      loadedPagesRef.current.add(currentPage);
      setIsFetchingMore(false);
    }
  }, [data, currentPage]);

  // Check if there are more pages
  const hasMorePages = data?.pagination
    ? data.pagination.page < data.pagination.totalPages
    : false;

  // Fetch next page when triggered
  const fetchNextPage = useCallback(() => {
    if (!isLoading && !isFetchingMore && hasMorePages) {
      setIsFetchingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, isFetchingMore, hasMorePages]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observer.observe(trigger);
    return () => observer.unobserve(trigger);
  }, [fetchNextPage]);

  const contentTypes: { value: ContentTypeFilter | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'images', label: 'Images' },
    { value: 'stickers', label: 'Stickers' },
    { value: 'videos', label: 'Gifs' },
    { value: 'animated_stickers', label: 'Animated Stickers' },
  ];

  // Show error state if there's an error and no data
  if (error && allPrompts.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-lg font-semibold">
            Failed to load recommendations
          </h2>
          <p className="text-tg-hint">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-tg-button mt-4 rounded px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col pb-24">
      {/* Content type filter */}
      <div className="scrollbar-hide border-tg-section-separator bg-tg-bg sticky top-0 z-10 flex shrink-0 gap-2 overflow-x-auto border-b px-2 py-3">
        {contentTypes.map(({ value, label }) => {
          const isActive =
            value === 'all'
              ? selectedTypes.length === 0
              : selectedTypes.includes(value as ContentTypeFilter);
          return (
            <button
              key={value}
              onClick={() => toggleType(value)}
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-tg-button text-tg-button-text'
                  : 'border-tg-section-separator text-tg-text hover:bg-tg-section-bg border'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Scrollable content area */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3 lg:grid-cols-4">
          {allPrompts.map((prompt: PromptWithContent, index: number) => (
            <div key={prompt.id} className="group flex flex-col gap-2">
              <div className="bg-tg-bg relative aspect-square w-full overflow-hidden rounded-lg">
                {/* Type Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-tg-button text-tg-button-text rounded-full px-2 py-0.5 text-xs font-semibold shadow-md">
                    {getTypeLabel(prompt.type)}
                  </span>
                </div>

                <div className="flex h-full w-full items-center justify-center p-4">
                  {prompt.latestContentUrl ? (
                    <img
                      src={prompt.latestContentUrl}
                      alt={prompt.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-tg-hint flex h-full w-full items-center justify-center">
                      No preview
                    </div>
                  )}
                </div>
              </div>

              {/* Info below image */}
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-tg-text line-clamp-1 text-sm font-semibold">
                    {prompt.name}
                  </h3>
                  <p className="text-tg-hint text-xs">{prompt.ownerName}</p>
                </div>

                {/* Make it Yours button */}
                {session && (
                  <button
                    onClick={() => handleMakeItYours(prompt)}
                    className="bg-tg-button text-tg-button-text w-full rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-90"
                  >
                    Make it Yours
                  </button>
                )}
              </div>
              {/* Place trigger element at the 5th-to-last item */}
              {index === allPrompts.length - 5 && (
                <div
                  ref={triggerRef}
                  className="flex h-4 w-full items-center justify-center text-xs opacity-0"
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </div>
          ))}
        </div>

        {(isLoading || isFetchingMore) && (
          <div className="flex items-center justify-center py-8">
            <Spinner
              text={
                currentPage === 1
                  ? 'Loading prompts...'
                  : 'Loading more prompts...'
              }
              size="lg"
            />
          </div>
        )}

        {error && allPrompts.length > 0 && (
          <div className="flex items-center justify-center">
            <div className="p-6 text-center">
              <div className="mb-2 text-sm text-orange-500">⚠️ Warning</div>
              <p className="text-tg-hint text-sm">
                Failed to load more content: {error.message}
              </p>
            </div>
          </div>
        )}

        {allPrompts.length === 0 && !isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-tg-hint text-center">No prompts found</div>
          </div>
        )}

        {/* Portal container for TokenSelectionCloud */}
        <div id="token-selection-container" />
      </div>
    </div>
  );
}
