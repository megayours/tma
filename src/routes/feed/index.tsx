import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useGetRecommendedPrompts } from '@/hooks/usePrompts';
import { LatestImage } from '@/components/lib/LatestContent/LatestImages';
import { LatestVideo } from '@/components/lib/LatestContent/LatestVideos';
import { LatestSticker } from '@/components/lib/LatestContent/LatestStickers';
import { LatestAnimatedSticker } from '@/components/lib/LatestContent/LatestAnimatedStickers';
import type { PromptWithContent } from '@/types/content';

// Debug toggle - set to false to disable all debug functionality
const DEBUG_MODE = false;

// Array of background GIF files
const backgroundGifs = [
  '/backgrounds/doodle-heart.gif',
  '/backgrounds/doodle-muscle.gif',
  '/backgrounds/doodle-skate.gif',
  '/backgrounds/doodle-star.gif',
  '/backgrounds/doodle-stars.gif',
  '/backgrounds/doodle-sticker.gif',
];

// Function that randomly returns one GIF from the array
const getRandomBackgroundGif = (): string => {
  const randomIndex = Math.floor(Math.random() * backgroundGifs.length);
  return backgroundGifs[randomIndex];
};

export const Route = createFileRoute('/feed/')({
  component: Feed,
});

function ShowContent({
  prompt,
}: {
  prompt: PromptWithContent;
  isLoading: boolean;
}) {
  // if (isLoading) {
  //   return (
  //     <div className="flex h-full items-center justify-center">
  //       <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }

  if (!prompt) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>No content found</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <div className="flex w-full flex-1 items-center justify-center">
        <div className="absolute top-5 left-5">
          <h1>{prompt.name}</h1>
          <p>{prompt.ownerName}</p>
        </div>
        <div className="h-full max-h-screen w-full">
          {prompt.type === 'images' && (
            <LatestImage prompt={prompt} bg={getRandomBackgroundGif()} />
          )}
          {prompt.type === 'videos' && (
            <LatestVideo prompt={prompt} bg={getRandomBackgroundGif()} />
          )}
          {prompt.type === 'stickers' && (
            <LatestSticker prompt={prompt} bg={getRandomBackgroundGif()} />
          )}
          {prompt.type === 'animated_stickers' && (
            <LatestAnimatedSticker
              prompt={prompt}
              bg={getRandomBackgroundGif()}
            />
          )}
        </div>
      </div>

      <div className="bottom-0 h-10 w-full"></div>
    </div>
  );
}

export function Feed() {
  const [allPrompts, setAllPrompts] = useState<PromptWithContent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

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
  } = useGetRecommendedPrompts(initialQueryParams);

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
        // Map the raw data to the expected format
        const mappedPrompts: PromptWithContent[] = rawData.data.map(
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
        <div className="p-6 text-center">
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
          scroll-snap-type: y mandatory;
          height: 100%;
        }

        .scroller section {
          scroll-snap-align: start;
          height: 100vh;
          min-height: 100vh;
        }
      `}</style>
      <article className="scroller h-full">
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
          <section key={prompt.id} className="flex snap-start flex-col">
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
    </>
  );
}
