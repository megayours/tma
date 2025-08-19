import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useGetRecommendedPrompts } from '@/hooks/usePrompts';
import { LatestImage } from '@/components/lib/LatestContent/LatestImages';
import { LatestVideo } from '@/components/lib/LatestContent/LatestVideos';
import { LatestSticker } from '@/components/lib/LatestContent/LatestStickers';
import type { PromptWithContent } from '@/types/content';

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
        </div>
      </div>

      <div className="bottom-0 h-10 w-full"></div>
    </div>
  );
}

export function Feed() {
  const [currentPage, setCurrentPage] = useState(1);
  const [promptsWithContent, setPromptsWithContent] = useState<
    PromptWithContent[]
  >([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const { data, isLoading } = useGetRecommendedPrompts({
    type: 'all',
    excludeUsed: true,
    pagination: {
      page: currentPage,
      size: 10,
    },
  });

  // Update allPrompts when new data comes in
  useEffect(() => {
    if (data.prompts.length > 0) {
      if (currentPage === 1) {
        setPromptsWithContent(data.prompts);
      } else {
        setPromptsWithContent(prev => [...prev, ...data.prompts]);
      }

      // Check if there are more pages
      if (
        data.pagination &&
        data.pagination.page >= data.pagination.totalPages
      ) {
        setHasMorePages(false);
      }
    }
  }, [data.prompts, data.pagination, currentPage]);

  // Reset loading state when request completes
  useEffect(() => {
    if (!isLoading && isLoadingMore) {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore]);

  const containerRef = useRef<HTMLElement>(null);

  const loadNextPage = () => {
    if (!isLoadingMore && hasMorePages) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isLoadingMore || !hasMorePages) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;

      // Calculate which section is currently visible
      const sectionHeight = clientHeight; // Each section is full height
      const currentSectionIndex = Math.floor(scrollTop / sectionHeight);

      // Check if we're on the third-to-last prompt
      const thirdToLastIndex = promptsWithContent.length > 5 ? 5 : 3;

      if (currentSectionIndex >= thirdToLastIndex && thirdToLastIndex >= 0) {
        loadNextPage();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMore, hasMorePages, promptsWithContent.length]);

  return (
    <>
      <style>{`
        .scroller {
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
          height: 100vh;
          max-height: 100vh;
        }

        .scroller section {
          scroll-snap-align: start;
          height: 100vh;
          min-height: 100vh;
        }
      `}</style>
      <article ref={containerRef} className="scroller">
        {promptsWithContent.map((prompt: PromptWithContent) => (
          // prompt.type !== 'stickers' && (
          <section key={prompt.id} className="flex snap-start flex-col">
            <ShowContent prompt={prompt} isLoading={isLoading} />
          </section>
        ))}
        {isLoadingMore && (
          <section className="flex snap-start items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              <p className="mt-2">Loading more prompts...</p>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
