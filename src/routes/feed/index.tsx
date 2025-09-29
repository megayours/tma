import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useGetRecommendedPromptsWithDetails } from '@/hooks/usePrompts';
import type { PromptWithContent } from '@/types/content';
import { ShowContent } from '@/components/Feed/ShowContent';
import { useSession } from '@/auth/SessionProvider';
import { viewport } from '@telegram-apps/sdk';

// Debug toggle - set to false to disable all debug functionality
const DEBUG_MODE = false;

export const Route = createFileRoute('/feed/')({
  component: Feed,
});

export function Feed() {
  const { session } = useSession();
  const [allPrompts, setAllPrompts] = useState<PromptWithContent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const isViewportMounted = viewport.isMounted();

  if (DEBUG_MODE) {
    console.log('Feed render:', {
      currentPage,
      totalPrompts: allPrompts.length,
      hasMorePages,
      isFetchingMore,
    });
  }

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

  if (DEBUG_MODE) {
    console.log('🚀 Feed Component Loaded');
    console.log('📋 Initial API Query params:', initialQueryParams);
    console.log('🌍 Environment check:', {
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      API_URL: import.meta.env.VITE_PUBLIC_API_URL,
      BASE_URL: import.meta.env.BASE_URL,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
    });
    console.log(
      '🔗 Full API endpoint will be:',
      `${import.meta.env.VITE_PUBLIC_API_URL}/discovery/prompts/recommended`
    );
  }

  const {
    data: initialData,
    isLoading: isInitialLoading,
    error,
  } = useGetRecommendedPromptsWithDetails(initialQueryParams);

  // Handle initial data
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('Initial data received:', {
        promptsLength: initialData.prompts.length,
        pagination: initialData.pagination,
        error: error?.message,
      });
    }

    if (initialData.prompts.length > 0) {
      setAllPrompts(initialData.prompts);

      // Update pagination info
      const hasMore = initialData.pagination
        ? initialData.pagination.page < initialData.pagination.totalPages
        : false;
      if (DEBUG_MODE) {
        console.log('Initial pagination check:', {
          currentPageFromData: initialData.pagination?.page,
          totalPages: initialData.pagination?.totalPages,
          hasMore,
        });
      }

      setHasMorePages(hasMore);
    } else {
      setHasMorePages(false);
    }
  }, [initialData.prompts, initialData.pagination, error]);

  // Manual fetch function for pagination
  const fetchNextPage = async () => {
    if (isFetchingMore || !hasMorePages || isInitialLoading) {
      if (DEBUG_MODE) {
        console.log('Skipping fetch:', {
          isFetchingMore,
          hasMorePages,
          isInitialLoading,
          currentPage,
        });
      }
      return;
    }

    const nextPageNum = currentPage + 1;
    if (DEBUG_MODE) {
      console.log(
        'Manually fetching page:',
        nextPageNum,
        'current page was:',
        currentPage
      );
    }

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
      if (DEBUG_MODE) {
        console.log('Manual fetch response:', rawData);
      }

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
          if (DEBUG_MODE) {
            console.log(
              'Adding prompts. Previous count:',
              prev.length,
              'Adding:',
              mappedPrompts.length
            );
          }
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

  // Load next page function - now uses manual fetch
  const loadNextPage = () => {
    if (DEBUG_MODE) {
      console.log('loadNextPage called - triggering manual fetch');
    }
    fetchNextPage();
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      if (DEBUG_MODE) {
        console.log('No trigger element found');
      }
      return;
    }

    if (DEBUG_MODE) {
      console.log('Setting up intersection observer with trigger element');
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (DEBUG_MODE) {
          console.log('Intersection observer triggered:', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            hasMorePages,
            isFetchingMore,
            isInitialLoading,
            currentPage,
            totalPrompts: allPrompts.length,
          });
        }

        if (
          entry.isIntersecting &&
          hasMorePages &&
          !isFetchingMore &&
          !isInitialLoading
        ) {
          if (DEBUG_MODE) {
            console.log('Trigger element is visible - calling fetchNextPage');
          }
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
    if (DEBUG_MODE) {
      console.log('Observer attached to trigger element');
    }

    return () => {
      if (DEBUG_MODE) {
        console.log('Cleaning up observer');
      }
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

  return (
    <>
      <style>{`
        .scroller {
          overflow-y: auto;
          scrollbar-width: none;
          scroll-snap-type: y mandatory;
          height: 100vh;
        }

        .scroller section {
          scroll-snap-align: start;
          height: 100vh;
        }
      `}</style>
      <article className={`scroller h-full overflow-y-auto`}>
        {/* Debug panel */}
        {DEBUG_MODE && (
          <div className="bg-opacity-50 fixed top-4 right-4 z-50 rounded bg-black p-2 text-xs text-white">
            <div>Page: {currentPage}</div>
            <div>Items: {allPrompts.length}</div>
            <div>
              Loading: {isFetchingMore || isInitialLoading ? 'Yes' : 'No'}
            </div>
            <div>HasMore: {hasMorePages ? 'Yes' : 'No'}</div>
            <button
              onClick={loadNextPage}
              className="mt-1 rounded bg-blue-500 px-2 py-1 text-xs"
              disabled={isFetchingMore || !hasMorePages || isInitialLoading}
            >
              Load Next
            </button>
            <button
              onClick={() => {
                if (DEBUG_MODE) {
                  console.log('Direct fetch test button clicked');
                }
                fetchNextPage();
              }}
              className="mt-1 rounded bg-green-500 px-2 py-1 text-xs"
              disabled={isFetchingMore || isInitialLoading}
            >
              Test Fetch
            </button>
          </div>
        )}

        {allPrompts.map((prompt: PromptWithContent, index: number) => (
          <section
            key={prompt.id}
            className={`flex snap-start flex-col overflow-y-auto ${isViewportMounted ? 'pb-36' : 'pb-16'}`}
          >
            <ShowContent prompt={prompt} isLoading={isInitialLoading} />

            {/* Place trigger element at the 5th-to-last item */}
            {index === allPrompts.length - 5 && (
              <div
                ref={triggerRef}
                className={`flex h-4 w-full items-center justify-center text-xs ${
                  DEBUG_MODE ? 'bg-red-500 opacity-20' : 'opacity-0'
                }`}
                style={{ pointerEvents: 'none' }}
              >
                {DEBUG_MODE && `TRIGGER (${index + 1}/${allPrompts.length})`}
              </div>
            )}
          </section>
        ))}

        {(isFetchingMore || isInitialLoading) && (
          <section className="flex snap-start items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2">Loading more prompts...</p>
            </div>
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
