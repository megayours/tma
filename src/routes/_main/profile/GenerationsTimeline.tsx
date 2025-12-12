import { SpinnerFullPage } from '@/components';
import { useSession } from '@/auth/SessionProvider';
import { useGetContents } from '@/hooks/useContents';
import type { Content } from '@/types/content';
import { createFileRoute, Link } from '@tanstack/react-router';
import { StickerList } from './StickerList';
import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';
import { Button } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/_main/profile/GenerationsTimeline')({
  component: GenerationsTimeline,
});

export function GenerationsTimeline() {
  const { session, isAuthenticating } = useSession();
  const [page, setPage] = useState(1);
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [hasMore, setHasMore] = useState(true);

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
        // Create a map to update or add contents (this replaces old content with updated data)
        const contentMap = new Map(prev.map(c => [c.id, c]));

        // Update existing or add new contents
        data.contents.forEach(content => {
          contentMap.set(content.id, content);
        });

        return Array.from(contentMap.values());
      });

      // Update hasMore based on pagination
      const totalPages = data.pagination?.totalPages || 1;
      setHasMore(page < totalPages);
    }
  }, [data, page]);

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  if (isAuthenticating || !session || (isLoading && page === 1)) {
    return <SpinnerFullPage text="Loading generations..." />;
  }

  if (!timeline.length && !isLoading && session) {
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

      {/* Explicit pagination controls */}
      <div className="mt-6 flex flex-col items-center gap-2">
        {isFetching && (
          <div className="text-tg-hint text-sm">Loading more...</div>
        )}
        {hasMore && !isFetching && (
          <Button
            mode="filled"
            size="l"
            onClick={handleLoadMore}
            className="w-full"
          >
            Load More
          </Button>
        )}
        {!hasMore && timeline.length > 0 && (
          <div className="text-tg-hint text-sm">No more items to load</div>
        )}
      </div>
    </div>
  );
}

function SingleContent({ content }: { content: Content }) {
  const linkProps =
    content.status === 'processing'
      ? {
          to: '/content/$promptId/processing/$executionId' as const,
          params: {
            promptId: String(content.promptId),
            executionId: String(content.executionId || content.id),
          },
        }
      : {
          to: '/content/$promptId/success' as const,
          params: { promptId: String(content.promptId) },
          search: { executionId: content.executionId || content.id },
        };

  return (
    <Link
      {...linkProps}
      className="flex items-center gap-3 overflow-hidden rounded-xl px-2 py-3 transition-opacity hover:opacity-80 active:scale-[0.99]"
    >
      {/* Thumbnail Image - Left */}
      {content.status === 'processing' ? (
        <div className="bg-tg-hint/30 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg">
          <DotLottieReact
            src="/lotties/loader.lottie"
            loop
            autoplay
            className="h-24 w-24"
          />
        </div>
      ) : (
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
          <MediaDisplay
            src={content.url || ''}
            alt="Generated content"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Content Info - Middle */}
      <div className="min-w-0 flex-1">
        <h3 className="text-tg-text truncate text-sm font-semibold text-wrap">
          {content.prompt?.name || 'Generated Content'}
        </h3>
        {content.token && (
          <p className="text-tg-hint truncate text-xs text-wrap">
            {content.token.contract.name} #{content.token.id}
          </p>
        )}
        <div>
          <div className="bg-tg-button text-tg-button-text inline-flex items-center justify-center rounded-2xl px-2">
            <span className="text-sm">{content.type}</span>
          </div>
        </div>
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
      </div>
    </Link>
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
