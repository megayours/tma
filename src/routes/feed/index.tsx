import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useGetPrompts } from '@/hooks/usePrompts';
import { LatestImage } from '@/components/lib/LatestContent/LatestImages';
import { LatestVideo } from '@/components/lib/LatestContent/LatestVideos';
import type { Prompt } from '@/types/prompt';
import { Card, CardContent } from '@/components/ui/Card';
import { Banner } from '@telegram-apps/telegram-ui';
import { FaArrowRight } from 'react-icons/fa';

export const Route = createFileRoute('/feed/')({
  component: Feed,
});

function ShowContent({
  prompt,
  isLoading,
}: {
  prompt: Prompt;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>No content found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-10">
      <div className="flex flex-col items-center justify-center gap-4">
        <h2 className="text-center text-2xl font-bold">{prompt.name}</h2>
        <p className="max-w-md text-center text-gray-600">
          {prompt.description}
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center">
        {prompt.type === 'images' && <LatestImage prompt={prompt} />}
        {prompt.type === 'videos' && <LatestVideo prompt={prompt} />}
      </div>

      <div className="bottom-0 h-10 w-full"></div>
    </div>
  );
}

export function Feed() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const { prompts, isLoading } = useGetPrompts({
    filters: {
      sortBy: 'last_used',
      sortOrder: 'desc',
    },
    pagination: {
      page: currentPage,
      size: 10,
    },
  });

  // Update allPrompts when new data comes in
  useEffect(() => {
    if (prompts.data.length > 0) {
      if (currentPage === 1) {
        setAllPrompts(prompts.data);
      } else {
        setAllPrompts(prev => [...prev, ...prompts.data]);
      }

      // Check if there are more pages
      if (
        prompts.pagination &&
        prompts.pagination.page >= prompts.pagination.totalPages
      ) {
        setHasMorePages(false);
      }
    }
  }, [prompts.data, prompts.pagination, currentPage]);

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
      const thirdToLastIndex = allPrompts.length - 3;

      if (currentSectionIndex >= thirdToLastIndex && thirdToLastIndex >= 0) {
        loadNextPage();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMore, hasMorePages, allPrompts.length]);

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
        {allPrompts.map(
          (prompt: Prompt) =>
            prompt.type !== 'stickers' && (
              <section key={prompt.id} className="flex snap-start flex-col">
                <ShowContent prompt={prompt} isLoading={isLoading} />
              </section>
            )
        )}
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
