import { SpinnerFullPage } from '@/components';
import { useSession } from '@/auth/SessionProvider';
import { useGetContents } from '@/hooks/useContents';
import type { Content } from '@/types/content';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/profile/GenerationsTimeline')({
  component: GenerationsTimeline,
});

export function GenerationsTimeline() {
  const { session, isAuthenticating } = useSession();
  const { data, isLoading } = useGetContents(session, session?.id!);
  const timeline = buildTimeline(data?.contents);

  if (isAuthenticating || isLoading) {
    return <SpinnerFullPage text="Loading generations..." />;
  }

  if (!timeline.length) {
    return (
      <div className="text-tg-hint text-center text-sm">
        You have no generations yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeline.map(({ execId, contents }) => (
        <div key={execId} className="mb-6">
          <h2 className="text-tg-text mb-3 text-lg font-semibold">
            Generation Session {execId}
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {contents.map(content => (
              <div
                key={content.id}
                className="bg-tg-section-bg flex items-center gap-3 rounded-xl p-4 shadow-sm"
              >
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={
                      content.url ||
                      content.image ||
                      content.video ||
                      content.gif ||
                      ''
                    }
                    alt={content.prompt?.name || 'Generated content'}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-tg-text truncate text-sm font-medium">
                    {content.prompt?.name || 'Untitled Prompt'}
                  </p>
                  <p className="text-tg-hint text-xs capitalize">
                    Status: {content.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
