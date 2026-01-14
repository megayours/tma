import { Link } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPackExecutions } from '@/hooks/useStickerPack';
import { useContentExecutions } from '@/hooks/useContents';

export function PendingExecutionsWidget() {
  const { session } = useSession();
  const { data: stickerExecutions } = useStickerPackExecutions(
    { status: 'processing', pagination: { page: 1, size: 8 } },
    session
  );
  const { data: contentExecutions } = useContentExecutions(session);

  const stickerCount = stickerExecutions?.data?.length || 0;
  const contentCount =
    contentExecutions?.executions?.filter(
      e => e.status === 'pending' || e.status === 'processing'
    ).length || 0;

  const totalCount = stickerCount + contentCount;

  if (totalCount === 0) return null;

  return (
    <div className="bg-tg-secondary-bg rounded-xl p-4">
      <h2 className="text-tg-text mb-3 text-sm font-semibold">
        Generations in Progress
      </h2>
      <div className="space-y-2">
        {contentCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-tg-hint text-xs">Content</span>
            <div className="flex items-center gap-2">
              <span className="text-tg-text text-xs font-medium">
                {contentCount} pending
              </span>
              {contentExecutions?.executions?.[0] && (
                <Link
                  to="/content/$promptId/processing/$executionId"
                  params={{
                    promptId: 'view',
                    executionId: contentExecutions.executions[0].execution_id,
                  }}
                  className="text-tg-link text-xs"
                >
                  View →
                </Link>
              )}
            </div>
          </div>
        )}
        {stickerCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-tg-hint text-xs">Sticker Packs</span>
            <div className="flex items-center gap-2">
              <span className="text-tg-text text-xs font-medium">
                {stickerCount} processing
              </span>
              {stickerExecutions?.data?.[0] && (
                <Link
                  to="/sticker-packs/$stickerPackId/processing/$executionId"
                  params={{
                    stickerPackId:
                      stickerExecutions.data[0].bundle.id.toString(),
                    executionId: stickerExecutions.data[0].id,
                  }}
                  className="text-tg-link text-xs"
                >
                  View →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
