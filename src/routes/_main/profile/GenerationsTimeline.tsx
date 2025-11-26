import { SpinnerFullPage } from '@/components';
import { useSession } from '@/auth/SessionProvider';
import { useGetContents } from '@/hooks/useContents';
import type { Content } from '@/types/content';
import { createFileRoute, Link } from '@tanstack/react-router';
import { StickerList } from './StickerList';
import { useState, useEffect, useRef } from 'react';

// Minimum number of timeline items to show before stopping initial fetch
const MIN_TIMELINE_ITEMS = 10;

export const Route = createFileRoute('/_main/profile/GenerationsTimeline')({
  component: GenerationsTimeline,
});

export function GenerationsTimeline() {
  const { session, isAuthenticating } = useSession();
  const [page, setPage] = useState(1);
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, isFetching } = useGetContents(
    session,
    session?.id!,
    undefined,
    { page, size: 20 }
  );

  const timeline = buildTimeline(allContents);

  // Accumulate contents as pages are fetched
  useEffect(() => {
    if (data?.contents) {
      setAllContents(prev => {
        // Deduplicate by content ID
        const newContents = data.contents.filter(
          newContent => !prev.some(existing => existing.id === newContent.id)
        );
        return [...prev, ...newContents];
      });

      // Update hasMore based on pagination
      const totalPages = data.pagination?.totalPages || 1;
      setHasMore(page < totalPages);
    }
  }, [data, page]);

  // Auto-fetch more pages until we have minimum timeline items
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      timeline.length < MIN_TIMELINE_ITEMS &&
      hasMore
    ) {
      setPage(prev => prev + 1);
    }
  }, [timeline.length, hasMore, isLoading, isFetching]);

  // Infinite scroll: load more when scrolling to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  if (isAuthenticating || (isLoading && page === 1)) {
    return <SpinnerFullPage text="Loading generations..." />;
  }

  if (!timeline.length && !isLoading) {
    return (
      <div className="text-tg-hint text-center text-sm">
        You have no generations yet.
      </div>
    );
  }

  return (
    <div className="pb-20">
      {timeline.map(({ execId, contents }) => (
        <div
          key={execId}
          className="border-tg-section-separator mb-3 border-b pb-3 last:border-b-0"
        >
          {contents.length === 1 && <SingleContent content={contents[0]} />}
          {contents.length > 1 && <StickerList selectedContents={contents} />}
        </div>
      ))}

      {/* Infinite scroll sentinel */}
      <div
        ref={observerTarget}
        className="flex h-10 items-center justify-center"
      >
        {isFetching && page > 1 && (
          <div className="text-tg-hint text-sm">Loading more...</div>
        )}
      </div>
    </div>
  );
}

function SingleContent({ content }: { content: Content }) {
  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-xl px-2 py-3">
      {/* Thumbnail Image - Left */}
      <Link
        to="/content/$promptId/success"
        params={{ promptId: String(content.promptId) }}
        search={{ executionId: content.executionId || content.id }}
        className="flex-shrink-0"
      >
        <img
          src={content.url || ''}
          alt="Generated content"
          className="h-20 w-20 cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-90"
        />
      </Link>

      {/* Content Info - Middle */}
      <div className="min-w-0 flex-1">
        <h3 className="text-tg-text truncate text-sm font-semibold">
          {content.prompt?.name || 'Generated Content'}
        </h3>
        {content.token && (
          <p className="text-tg-hint truncate text-xs">
            {content.token.contract.name} #{content.token.id}
          </p>
        )}
      </div>

      {/* Actions - Right */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
            content.status === 'completed'
              ? 'bg-green-100 text-green-700'
              : content.status === 'processing'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {content.status}
        </span>
        <button
          onClick={() => {
            if (content.url) {
              navigator.clipboard.writeText(content.url);
            }
          }}
          className="text-tg-link text-xs hover:underline"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function buildTimeline(contents?: Content[]) {
  if (!contents) return [];

  const grouped = contents.reduce<Record<string, Content[]>>((acc, content) => {
    const execId = String(content.executionId || content.id);
    if (!acc[execId]) {
      acc[execId] = [];
    }
    acc[execId].push(content);
    return acc;
  }, {});

  return Object.entries(grouped).map(([execId, groupedContents]) => ({
    execId,
    contents: groupedContents,
  }));
}
