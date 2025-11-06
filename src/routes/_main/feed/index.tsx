import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetRecommendedPrompts } from '@/hooks/usePrompts';
import type { PromptWithContent } from '@/types/content';
import { Spinner } from '@/components/ui';
import { useSession } from '@/auth/SessionProvider';
import {
  useGetUsedCollections,
  type SupportedCollection,
} from '@/hooks/useCollections';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

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
  const [selectedCollections, setSelectedCollections] = useState<
    SupportedCollection[]
  >([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const triggerRef = useRef<HTMLDivElement>(null);
  const typeButtonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {}
  );

  // Fetch used collections
  const { data: usedCollections, isLoading: isLoadingCollections } =
    useGetUsedCollections(6);

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
    tokenCollections:
      selectedCollections.length > 0 ? selectedCollections : undefined,
    enabled: true,
  });

  // Toggle content type selection
  const toggleType = (type: ContentTypeFilter | 'all') => {
    const currentQueryType =
      selectedTypes.length === 0 ? 'all' : selectedTypes[0];

    // If clicking the currently active type, toggle expanded state
    if (currentQueryType === type) {
      setIsExpanded(prev => !prev);
      return;
    }

    // Otherwise, select the new type and collapse
    if (type === 'all') {
      // Clear all filters to show all content
      setSelectedTypes([]);
      setIsExpanded(true);
    } else {
      setSelectedTypes(prev => {
        if (prev.includes(type)) {
          return prev.filter(t => t !== type);
        } else {
          // For now, only allow one selection since API doesn't support multiple
          return [type];
        }
      });
      setIsExpanded(false);
    }
    // Reset pagination when filter changes
    setCurrentPage(1);
    setAllPrompts([]);
    loadedPagesRef.current.clear();
  };

  // Toggle collection selection
  const toggleCollection = (collection: SupportedCollection) => {
    setSelectedCollections(prev => {
      const isSelected = prev.some(c => c.id === collection.id);
      if (isSelected) {
        return prev.filter(c => c.id !== collection.id);
      } else {
        return [...prev, collection];
      }
    });
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

  // GSAP animation for collapsing/expanding type filters
  useGSAP(() => {
    const currentQueryType =
      selectedTypes.length === 0 ? 'all' : selectedTypes[0];

    contentTypes.forEach(({ value }, index) => {
      const button = typeButtonsRef.current[value];
      if (!button) return;

      const isActive = value === currentQueryType;
      const shouldBeVisible = isExpanded || isActive;

      if (shouldBeVisible) {
        // Set display before expanding
        gsap.set(button, { display: 'block' });
        // Expand: animate to auto width and full opacity
        gsap.to(button, {
          width: 'auto',
          opacity: 1,
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem',
          marginRight: isExpanded ? '0.25rem' : 0,
          duration: 0.45,
          ease: 'power2.inOut',
          delay: isExpanded ? index * 0.05 : 0,
        });
      } else {
        // Collapse: animate to 0 width and 0 opacity
        gsap.to(button, {
          width: 0,
          opacity: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginRight: 0,
          borderWidth: 0,
          duration: 0.45,
          ease: 'power2.inOut',
          delay: (contentTypes.length - 1 - index) * 0.05,
          onComplete: () => {
            // Set display none after animation completes
            gsap.set(button, { display: 'none' });
          },
        });
      }
    });
  }, [isExpanded, selectedTypes]);

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
    <div className="flex h-screen flex-col">
      {/* Content type and collection filters */}
      <div
        className="scrollbar-hide border-tg-section-separator bg-tg-bg/80 sticky top-0 z-10 flex shrink-0 gap-1 overflow-x-auto border-b py-3 backdrop-blur-md"
        style={{
          paddingLeft: '0.5rem',
          paddingRight: isExpanded ? '0.5rem' : '0.25rem',
        }}
      >
        {/* Content type filters */}
        {contentTypes.map(({ value, label }) => {
          const isActive =
            value === 'all'
              ? selectedTypes.length === 0
              : selectedTypes.includes(value as ContentTypeFilter);
          return (
            <button
              key={value}
              ref={el => {
                typeButtonsRef.current[value] = el;
              }}
              onClick={() => toggleType(value)}
              style={{ minWidth: 0 }}
              className={`shrink-0 overflow-hidden rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-tg-button text-tg-button-text shadow-md backdrop-blur-sm'
                  : 'border-tg-section-separator text-tg-text bg-tg-bg/60 hover:bg-tg-section-bg/80 border backdrop-blur-sm'
              }`}
            >
              {label}
            </button>
          );
        })}

        {/* Separator */}
        {(usedCollections.length > 0 || isLoadingCollections) && (
          <div className="border-tg-section-separator h-8 w-px shrink-0 border-l" />
        )}

        {/* Collection filters loading placeholders */}
        {isLoadingCollections && (
          <>
            {[1, 2, 3, 4, 5, 6].map(index => (
              <div
                key={`placeholder-${index}`}
                className="border-tg-section-separator bg-tg-bg/60 flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-sm"
              >
                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
              </div>
            ))}
          </>
        )}

        {/* Collection filters */}
        {!isLoadingCollections &&
          usedCollections.map(collection => {
            const isActive = selectedCollections.some(
              c => c.id === collection.id
            );
            return (
              <button
                key={collection.id}
                onClick={() => toggleCollection(collection)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-tg-button text-tg-button-text shadow-md backdrop-blur-sm'
                    : 'border-tg-section-separator text-tg-text bg-tg-bg/60 hover:bg-tg-section-bg/80 border backdrop-blur-sm'
                }`}
              >
                {collection.image && (
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                )}
                <span className="line-clamp-1">{collection.name}</span>
              </button>
            );
          })}
      </div>

      {/* Scrollable content area */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
          {allPrompts.map((prompt: PromptWithContent, index: number) => (
            <div key={prompt.id} className="group flex flex-col gap-2">
              <div className="border-tg-section-separator/50 relative aspect-square w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm dark:from-gray-800 dark:to-gray-900">
                {/* Type Badge */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md">
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
                  <h3 className="text-tg-text line-clamp-1 text-base font-semibold">
                    {prompt.name}
                  </h3>
                  <p className="text-tg-hint text-sm">{prompt.ownerName}</p>
                </div>

                {/* Make it Yours button */}
                {session && (
                  <button
                    onClick={() => handleMakeItYours(prompt)}
                    className="bg-tg-button text-tg-button-text w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all active:scale-95"
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
