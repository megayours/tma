import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useSession } from '@/auth/SessionProvider';
import { useGetContents, useRevealContent } from '@/hooks/useContents';
import { useState } from 'react';
import type { Content } from '@/types/content';

export const Route = createFileRoute('/_main/profile/notifications/')({
  component: NotificationsPage,
});

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  // Convert to milliseconds if timestamp is in seconds
  const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const diff = now - timestampMs;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(timestampMs).toLocaleDateString();
}

function getTimeGroup(timestamp: number): 'Today' | 'This Week' | 'Earlier' {
  const now = Date.now();
  // Convert to milliseconds if timestamp is in seconds
  const timestampMs = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const diff = now - timestampMs;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days < 7) return 'This Week';
  return 'Earlier';
}

function groupContentsByTime(contents: Content[]) {
  const groups: Record<string, Content[]> = {
    Today: [],
    'This Week': [],
    Earlier: [],
  };

  contents.forEach(content => {
    const group = getTimeGroup(content.createdAt);
    groups[group].push(content);
  });

  return groups;
}

function getNotificationMessage(content: Content): string {
  if (content.status === 'processing') {
    return 'Your content is being generated...';
  }
  if (content.status === 'failed') {
    return 'Content generation failed';
  }

  const typeMap = {
    image: 'Image',
    video: 'Video',
    sticker: 'Sticker',
    animated_sticker: 'Animated sticker',
  };

  return `${typeMap[content.type]} generated`;
}

function NotificationItem({
  content,
  onClick,
  isRevealing,
}: {
  content: Content;
  onClick: () => void;
  isRevealing: boolean;
}) {
  const isUnread = content.revealedAt === null;
  const thumbnailUrl =
    content.url || content.image || content.video || content.gif || '';

  return (
    <div
      className="border-tg-section-separator flex cursor-pointer items-center gap-3 border-b px-6 py-3 transition-colors active:bg-tg-secondary-bg/50"
      onClick={onClick}
    >
      {/* Circular thumbnail with unread indicator */}
      <div className="relative h-12 w-12 flex-shrink-0">
        <img
          src={thumbnailUrl}
          alt="Content"
          className={`h-full w-full rounded-full object-cover ${
            isUnread ? 'blur-sm' : ''
          }`}
        />
        {isUnread && (
          <div className="bg-tg-button absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-tg-bg"></div>
        )}
        {isRevealing && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-tg-text text-sm">
          <span className="font-semibold">
            {content.status === 'processing' ? 'Generating...' : 'Your content is ready!'}
          </span>
        </p>
        <p className="text-tg-hint truncate text-xs">
          {getNotificationMessage(content)}
          {' • '}
          {getRelativeTime(content.createdAt)}
        </p>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const { session } = useSession();
  const { data, isLoading } = useGetContents(session, session?.id!);
  const contents = data?.contents || [];
  const revealMutation = useRevealContent(session);
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());

  const handleNotificationClick = async (content: Content) => {
    if (content.revealedAt !== null || revealingIds.has(content.id)) {
      return; // Already revealed or currently revealing
    }

    setRevealingIds(prev => new Set(prev).add(content.id));
    try {
      await revealMutation.mutateAsync(content.id);
    } catch (error) {
      console.error('Failed to reveal content:', error);
    } finally {
      setRevealingIds(prev => {
        const next = new Set(prev);
        next.delete(content.id);
        return next;
      });
    }
  };

  const groupedContents = groupContentsByTime(contents);
  const hasUnread = contents.some(c => c.revealedAt === null);

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <div className="border-tg-section-separator sticky top-0 z-10 border-b bg-tg-bg/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-tg-text text-2xl font-bold">Notifications</h1>
            {hasUnread && (
              <span className="bg-tg-button text-xs font-semibold text-white px-2 py-1 rounded-full">
                {contents.filter(c => c.revealedAt === null).length}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable notification list */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-tg-hint text-sm">Loading notifications...</div>
            </div>
          ) : contents.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-tg-hint text-sm">No notifications yet</p>
                <p className="text-tg-subtitle-text mt-1 text-xs">
                  Generate some content to see notifications here
                </p>
              </div>
            </div>
          ) : (
            <>
              {(Object.keys(groupedContents) as Array<keyof typeof groupedContents>).map(
                groupName =>
                  groupedContents[groupName].length > 0 && (
                    <div key={groupName}>
                      <div className="text-tg-subtitle-text bg-tg-secondary-bg px-6 py-2 text-xs font-semibold uppercase">
                        {groupName}
                      </div>
                      {groupedContents[groupName].map(content => (
                        <NotificationItem
                          key={content.id}
                          content={content}
                          onClick={() => handleNotificationClick(content)}
                          isRevealing={revealingIds.has(content.id)}
                        />
                      ))}
                    </div>
                  )
              )}
            </>
          )}
          <div className="h-20"></div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
