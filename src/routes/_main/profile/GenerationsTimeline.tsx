import { SpinnerFullPage } from '@/components';
import { useSession } from '@/auth/SessionProvider';
import { useGetContents } from '@/hooks/useContents';
import { useGetUserMemes } from '@/hooks/useMemes';
import type { Content } from '@/types/content';
import type { Meme } from '@/types/meme';
import { createFileRoute, Link } from '@tanstack/react-router';
import { StickerList } from './StickerList';
import { useState, useEffect, useMemo } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';
import { Button } from '@telegram-apps/telegram-ui';
import { useSelectCommunity } from '../../../contexts/SelectCommunityContext';

export const Route = createFileRoute('/_main/profile/GenerationsTimeline')({
  component: GenerationsTimeline,
});

type TimelineItem =
  | { kind: 'content'; data: Content }
  | { kind: 'meme'; data: Meme };

export function GenerationsTimeline() {
  const { session, isAuthenticating } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const [page, setPage] = useState(1);
  const [allContents, setAllContents] = useState<Content[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useGetContents(
    session,
    session?.id!,
    selectedCommunity?.id!,
    undefined,
    { page, size: 20 }
  );

  // Fetch user's memes
  const { data: memesData } = useGetUserMemes(session, { page, size: 20 });

  // Merge contents and memes, sorted by created_at
  const allGenerations = useMemo((): TimelineItem[] => {
    const contents: TimelineItem[] = allContents.map(c => ({ kind: 'content' as const, data: c }));
    const memes: TimelineItem[] = memesData?.data?.map(m => ({ kind: 'meme' as const, data: m })) || [];

    const combined: TimelineItem[] = [...contents, ...memes];

    return combined.sort((a, b) => {
      const aTime = a.kind === 'content' ? (a.data.createdAt || 0) : (a.data.created_at || 0);
      const bTime = b.kind === 'content' ? (b.data.createdAt || 0) : (b.data.created_at || 0);
      return bTime - aTime;
    });
  }, [allContents, memesData]);

  const timeline = buildTimeline(allGenerations);

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
      {timeline.map(({ execId, items }) => {
        const firstItem = items[0];

        if (items.length === 1) {
          if (firstItem.kind === 'content') {
            return (
              <div
                key={execId}
                className="border-tg-section-separator mb-3 border-b pb-3 last:border-b-0"
              >
                <SingleContent content={firstItem.data} />
              </div>
            );
          } else if (firstItem.kind === 'meme') {
            return (
              <div
                key={execId}
                className="border-tg-section-separator mb-3 border-b pb-3 last:border-b-0"
              >
                <SingleMeme meme={firstItem.data} />
              </div>
            );
          }
        } else if (items.length > 1 && firstItem.kind === 'content') {
          const contentItems = items
            .filter((item): item is { kind: 'content'; data: Content } => item.kind === 'content')
            .map(item => item.data);
          return (
            <div
              key={execId}
              className="border-tg-section-separator mb-3 border-b pb-3 last:border-b-0"
            >
              <StickerList selectedContents={contentItems} />
            </div>
          );
        }

        return null;
      })}

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
  const { session } = useSession();

  console.log('Creator ID:', content.creatorId, 'Type:', typeof content.creatorId);
  console.log('Session ID:', session?.id, 'Type:', typeof session?.id);
  console.log('Are they equal?', content.creatorId === session?.id);

  const isOwner = content.creatorId === session?.id;

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
    <div className="flex items-center gap-3 overflow-hidden rounded-xl px-2 py-3">
      <Link
        {...linkProps}
        className="flex flex-1 items-center gap-3 overflow-hidden transition-opacity hover:opacity-80 active:scale-[0.99]"
      >
        {/* Thumbnail Image - Left */}
        {content.status === 'processing' ? (
          <div className="bg-tg-hint/30 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg">
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
              poster={content.thumbnailUrl || '/logo.png'}
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

      {/* Modify Button - Only shown if user is the creator */}
      {isOwner && content.promptId && (
        <Link
          to="/profile/admin/prompt/edit/$promptId"
          params={{ promptId: String(content.promptId) }}
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            mode="bezeled"
            size="s"
            className="whitespace-nowrap"
          >
            Modify
          </Button>
        </Link>
      )}
    </div>
  );
}

function SingleMeme({ meme }: { meme: Meme }) {
  const linkProps =
    meme.status === 'processing'
      ? {
          to: '/memes/$templateId/processing/$memeId' as const,
          params: {
            templateId: String(meme.template.id),
            memeId: String(meme.id),
          },
        }
      : {
          to: '/memes/$templateId/success' as const,
          params: { templateId: String(meme.template.id) },
          search: { memeId: meme.id },
        };

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-xl px-2 py-3">
      <Link
        {...linkProps}
        className="flex flex-1 items-center gap-3 overflow-hidden transition-opacity hover:opacity-80 active:scale-[0.99]"
      >
        {/* Thumbnail Image - Left */}
        {meme.status === 'processing' ? (
          <div className="bg-tg-hint/30 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg">
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
              src={meme.url || ''}
              alt="Generated meme"
              className="h-full w-full object-cover"
              poster={meme.thumbnail_url || '/logo.png'}
            />
          </div>
        )}

        {/* Content Info - Middle */}
        <div className="min-w-0 flex-1">
          <h3 className="text-tg-text truncate text-sm font-semibold text-wrap">
            {meme.template.name}
          </h3>
          <p className="text-tg-hint truncate text-xs text-wrap">
            {meme.tokens.length} character{meme.tokens.length > 1 ? 's' : ''}
          </p>
          <div>
            <div className="bg-tg-button text-tg-button-text inline-flex items-center justify-center rounded-2xl px-2">
              <span className="text-sm">meme</span>
            </div>
          </div>
        </div>

        {/* Actions - Right */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
              meme.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : meme.status === 'processing'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {meme.status}
          </span>
        </div>
      </Link>
    </div>
  );
}

function buildTimeline(items?: TimelineItem[]) {
  if (!items) return [];

  const grouped = items.reduce<Record<string, TimelineItem[]>>((acc, item) => {
    let execId: string;
    if (item.kind === 'content') {
      execId = String(item.data.executionId || item.data.id);
    } else {
      execId = String(item.data.id);
    }

    if (!acc[execId]) {
      acc[execId] = [];
    }
    acc[execId].push(item);
    return acc;
  }, {});

  return Object.entries(grouped).map(([execId, groupedItems]) => ({
    execId,
    items: groupedItems,
  }));
}
