import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGetRecommendedPrompts } from '@/hooks/usePrompts';
import type { PromptWithContent } from '@/types/content';
import { Spinner } from '@/components/ui';
import { useSession } from '@/auth/SessionProvider';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useGenerateContentMutation } from '@/hooks/useContents';

export const Route = createFileRoute('/_main/feed/')({
  component: Feed,
});

type ContentTypeFilter = 'images' | 'videos' | 'gifs' | 'stickers' | 'animated_stickers';

export function Feed() {
  const { session } = useSession();
  const { selectedFavorite, isLoadingSelected } = useGetFavorites(session);
  const generateContent = useGenerateContentMutation(session);

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
  const {
    data,
    isLoading,
    error,
  } = useGetRecommendedPrompts({
    type: queryType,
    excludeUsed: false,
    pagination: {
      page: currentPage,
      size: 10,
    },
    enabled: true,
  });

  // Toggle content type selection
  const toggleType = (type: ContentTypeFilter) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        // For now, only allow one selection since API doesn't support multiple
        return [type];
      }
    });
    // Reset pagination when filter changes
    setCurrentPage(1);
    setAllPrompts([]);
    loadedPagesRef.current.clear();
  };

  // Generate content handler
  const handleGenerate = (prompt: PromptWithContent) => {
    if (!selectedFavorite || !session) return;

    // Map prompt type to API type
    let apiType: 'image' | 'video' | 'sticker' | 'animated_sticker';
    switch (prompt.type) {
      case 'images':
        apiType = 'image';
        break;
      case 'videos':
        apiType = 'video';
        break;
      case 'stickers':
        apiType = 'sticker';
        break;
      case 'animated_stickers':
        apiType = 'animated_sticker';
        break;
      case 'gifs':
        apiType = 'image'; // GIFs use image type
        break;
      default:
        console.error('Unsupported prompt type:', prompt.type);
        return;
    }

    // Convert selectedFavorite to inputs array format
    const inputs = [
      {
        chain: selectedFavorite.token.contract.chain,
        contract_address: selectedFavorite.token.contract.address,
        token_id: selectedFavorite.token.id,
      },
    ];

    generateContent.mutate({
      promptId: prompt.id.toString(),
      type: apiType,
      inputs: inputs,
    });
  };

  // Accumulate prompts as new pages load
  useEffect(() => {
    if (data && data.prompts.length > 0 && !loadedPagesRef.current.has(currentPage)) {
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

  const contentTypes: { value: ContentTypeFilter; label: string }[] = [
    { value: 'images', label: 'Images' },
    { value: 'stickers', label: 'Stickers' },
    { value: 'gifs', label: 'GIFs' },
    { value: 'videos', label: 'Videos' },
    { value: 'animated_stickers', label: 'Animated' },
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
            className="mt-4 rounded bg-tg-button px-4 py-2 text-white"
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
      <div className="scrollbar-hide sticky top-0 z-10 flex shrink-0 gap-2 overflow-x-auto border-b border-tg-section-separator bg-tg-bg px-2 py-3">
        {contentTypes.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => toggleType(value)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedTypes.includes(value)
                ? 'bg-tg-button text-tg-button-text'
                : 'border border-tg-section-separator text-tg-text hover:bg-tg-section-bg'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Scrollable content area */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">

      <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3 lg:grid-cols-4">
        {allPrompts.map((prompt: PromptWithContent, index: number) => (
          <div key={prompt.id} className="group relative flex flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
              <div className="flex h-full w-full items-center justify-center p-4">
                {prompt.latestContentUrl ? (
                  <img
                    src={prompt.latestContentUrl}
                    alt={prompt.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-tg-hint">
                    No preview
                  </div>
                )}
              </div>

              {/* Gradient overlay with info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <h3 className="text-sm font-semibold text-white line-clamp-1">
                  {prompt.name}
                </h3>
                <p className="text-xs text-white/80">{prompt.ownerName}</p>

                {/* Generate button */}
                {session && selectedFavorite && (
                  <button
                    onClick={() => handleGenerate(prompt)}
                    disabled={isLoadingSelected || generateContent.isPending}
                    className="mt-2 w-full rounded-full bg-tg-button px-3 py-1.5 text-xs font-medium text-tg-button-text transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {generateContent.isPending ? (
                      'Generating...'
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span>Make it You</span>
                        {selectedFavorite.token.image && (
                          <img
                            src={selectedFavorite.token.image}
                            alt=""
                            className="h-4 w-4 rounded-full"
                          />
                        )}
                      </div>
                    )}
                  </button>
                )}
              </div>
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

      {(isLoading || isFetchingMore) && currentPage > 1 && (
        <div className="flex items-center justify-center py-8">
          <Spinner text="Loading more prompts..." size="lg" />
        </div>
      )}

      {error && allPrompts.length > 0 && (
        <div className="flex items-center justify-center">
          <div className="p-6 text-center">
            <div className="mb-2 text-sm text-orange-500">⚠️ Warning</div>
            <p className="text-sm text-tg-hint">
              Failed to load more content: {error.message}
            </p>
          </div>
        </div>
      )}

      {allPrompts.length === 0 && !isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-tg-hint">No prompts found</div>
        </div>
      )}

        {/* Portal container for TokenSelectionCloud */}
        <div id="token-selection-container" />
      </div>
    </div>
  );
}
