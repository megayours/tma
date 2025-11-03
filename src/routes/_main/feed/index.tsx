import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useGetRecommendedPromptsWithDetails } from '@/hooks/usePrompts';
import type { PromptWithContent } from '@/types/content';
import { ShowContent } from '@/components/Feed/ShowContent';
import { useSession } from '@/auth/SessionProvider';
import { Spinner } from '@/components/ui';

export const Route = createFileRoute('/_main/feed/')({
  component: Feed,
});

export function Feed() {
  const { session } = useSession();
  const [allPrompts, setAllPrompts] = useState<PromptWithContent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Only auto-fetch the first page
  const initialQueryParams = {
    type: 'all' as const,
    excludeUsed: false,
    pagination: {
      page: 1,
      size: 10,
    },
    session,
  };

  const {
    data: initialData,
    isLoading: isInitialLoading,
    error,
  } = useGetRecommendedPromptsWithDetails(initialQueryParams);

  console.log('DATA', initialData);

  // Handle initial data
  useEffect(() => {
    if (initialData.prompts.length > 0) {
      setAllPrompts(initialData.prompts);

      // Update pagination info
      const hasMore = initialData.pagination
        ? initialData.pagination.page < initialData.pagination.totalPages
        : false;

      setHasMorePages(hasMore);
    } else {
      setHasMorePages(false);
    }
  }, [initialData.prompts, initialData.pagination, error]);

  // Manual fetch function for pagination
  const fetchNextPage = async () => {
    if (isFetchingMore || !hasMorePages || isInitialLoading) {
      return;
    }

    const nextPageNum = currentPage + 1;

    setIsFetchingMore(true);
    setCurrentPage(nextPageNum); // Update page immediately

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/discovery/prompts/recommended?type=all&exclude_used=false&page=${nextPageNum}&size=10`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      if (rawData && rawData.data && rawData.data.length > 0) {
        // Map the raw data to the expected format and fetch details for each prompt
        const basePrompts: PromptWithContent[] = rawData.data.map(
          (rawPrompt: any): PromptWithContent => ({
            id: rawPrompt.id,
            name: rawPrompt.name ?? 'Untitled',
            description: rawPrompt.description ?? '',
            image: rawPrompt.image ?? '',
            type: rawPrompt.type as
              | 'images'
              | 'videos'
              | 'stickers'
              | 'gifs'
              | 'animated_stickers',
            published: rawPrompt.published ?? false,
            owner: rawPrompt.owner_id,
            ownerName: rawPrompt.owner_name ?? '',
            hasUserGenerated: rawPrompt.has_generated ?? false,
            publishedAt: rawPrompt.published_at ?? 0,
            generationCount: rawPrompt.generation_count ?? 0,
            latestContentUrl: rawPrompt.latest_content_url,
            minTokens: rawPrompt.min_tokens,
            maxTokens: rawPrompt.max_tokens,
            // Add other required fields with defaults
            additionalContentIds: [],
            lastUsed: 0,
            createdAt: rawPrompt.created_at,
            updatedAt: rawPrompt.updated_at ?? rawPrompt.created_at,
            usageCount: rawPrompt.usage_count ?? 0,
            contracts: [],
            images: [],
            videos: [],
            gifs: [],
            versions: undefined,
            contentId: undefined,
          })
        );

        // Fetch detailed data for each prompt if session exists
        let mappedPrompts = basePrompts;
        if (session) {
          const detailPromises = basePrompts.map(async prompt => {
            try {
              const detailResponse = await fetch(
                `${import.meta.env.VITE_PUBLIC_API_URL}/prompts/${prompt.id}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: session.authToken,
                  },
                }
              );

              if (!detailResponse.ok) {
                console.warn(`Failed to fetch details for prompt ${prompt.id}`);
                return prompt;
              }

              const detailData = await detailResponse.json();
              return {
                ...prompt,
                minTokens: detailData.min_tokens,
                maxTokens: detailData.max_tokens,
                contracts: detailData.contracts || [],
              };
            } catch (error) {
              console.warn(
                `Error fetching details for prompt ${prompt.id}:`,
                error
              );
              return prompt;
            }
          });

          mappedPrompts = await Promise.all(detailPromises);
        }

        setAllPrompts(prev => {
          return [...prev, ...mappedPrompts];
        });

        // Check if there are more pages
        const hasMore = rawData.pagination
          ? rawData.pagination.page < rawData.pagination.totalPages
          : false;
        setHasMorePages(hasMore);
      } else {
        setHasMorePages(false);
      }
    } catch (err) {
      console.error('Failed to fetch next page:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;

        if (
          entry.isIntersecting &&
          hasMorePages &&
          !isFetchingMore &&
          !isInitialLoading
        ) {
          fetchNextPage();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '100px', // Trigger 100px before the element is visible
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    observer.observe(trigger);

    return () => {
      observer.unobserve(trigger);
    };
  }, [
    hasMorePages,
    isFetchingMore,
    isInitialLoading,
    currentPage,
    allPrompts.length,
  ]);

  // Show error state if there's an error and no data
  if (error && allPrompts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-lg font-semibold">
            Failed to load recommendations
          </h2>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('All prompts', allPrompts);

  return (
    <>
      <style>{`
        .scroller {
          overflow-y: auto;
          scrollbar-width: none;
          scroll-snap-type: y mandatory;
          height: 100vh;
          max-height: 100vh;
        }

        .scroller section {
          scroll-snap-align: start;
          height: calc(100vh-2em);
          max-height: calc(100vh - 5em);
        }
      `}</style>
      <article className={`scroller h-screen max-h-screen overflow-y-hidden`}>
        {allPrompts.map((prompt: PromptWithContent, index: number) => (
          <section
            key={prompt.id}
            className={`flex snap-start flex-col overflow-y-hidden pb-20`}
          >
            <ShowContent prompt={prompt} isLoading={isInitialLoading} />
            {/* Place trigger element at the 5th-to-last item */}
            {index === allPrompts.length - 5 && (
              <div
                ref={triggerRef}
                className={`flex h-4 w-full items-center justify-center text-xs opacity-0`}
                style={{ pointerEvents: 'none' }}
              ></div>
            )}
          </section>
        ))}
        {(isFetchingMore || isInitialLoading) && (
          <section className="flex snap-start items-center justify-center py-8">
            <Spinner text="Loading more prompts..." size="lg" />
          </section>
        )}
        {error && allPrompts.length > 0 && (
          <section className="flex snap-start items-center justify-center">
            <div className="p-6 text-center">
              <div className="mb-2 text-sm text-orange-500">⚠️ Warning</div>
              <p className="text-sm text-gray-600">
                Failed to load more content: {error.message}
              </p>
            </div>
          </section>
        )}
      </article>

      {/* Portal container for TokenSelectionCloud */}
      <div id="token-selection-container"></div>
    </>
  );
}
