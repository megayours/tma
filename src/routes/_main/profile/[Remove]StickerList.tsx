import { useSession } from '@/auth/SessionProvider';
import { useStickerPackExecutions } from '@/hooks/useStickerPack';
import { useState } from 'react';
import { SpinnerFullPage } from '@/components/ui';
import { StickerPackVisualization } from '@/components/StickerPack/StickerPackVisualization';
import { Link } from '@tanstack/react-router';

export function StickerList() {
  const { session } = useSession();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, error } = useStickerPackExecutions(
    {
      pagination: {
        page,
        size: pageSize,
      },
    },
    session
  );

  if (isLoading) {
    return <SpinnerFullPage text="Loading your sticker packs..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-red-600">
          Error loading sticker packs: {error.message}
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-tg-hint text-center text-lg">
          No sticker packs yet
        </div>
        <p className="text-tg-hint mt-2 text-center text-sm">
          Create your first sticker pack to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Executions List */}
      <div className="space-y-2">
        {data.data.map(execution => (
          <div key={execution.id} className="overflow-hidden rounded-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pt-4">
              <div className="min-w-0 flex-1">
                <Link
                  to="/sticker-packs/generated/$id"
                  params={{ id: execution.id.toString() }}
                >
                  <h3 className="text-tg-text text-base leading-tight font-semibold">
                    {execution.bundle.name}
                    {execution.effect_style !== 'basic' &&
                      ` (${execution.effect_style.toUpperCase()})`}
                  </h3>
                </Link>
                {execution.nft_token && (
                  <div className="text-tg-hint mt-0.5 truncate text-xs">
                    {execution.nft_token.contract.name} #
                    {execution.nft_token.id}
                  </div>
                )}
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  execution.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : execution.status === 'processing'
                      ? 'bg-blue-100 text-blue-700'
                      : execution.status === 'failed'
                        ? 'bg-red-100 text-red-700'
                        : execution.status === 'pending_payment'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                }`}
              >
                {execution.completed_prompts}/{execution.total_prompts}
              </span>
            </div>

            {/* Sticker Grid Visualization */}
            <div className="py-2">
              <StickerPackVisualization execution={execution} />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pb-4">
              {/* Telegram Link for completed */}
              {execution.status === 'completed' &&
                execution.telegram_pack_url && (
                  <a
                    href={execution.telegram_pack_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-tg-button text-tg-button-text block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors"
                  >
                    Add to Telegram
                  </a>
                )}

              {/* Regenerate Link */}
              <Link
                to="/sticker-packs/generated/$id"
                params={{ id: execution.id.toString() }}
                className="border-tg-button text-tg-button hover:bg-tg-button/10 block rounded-lg border-2 py-2.5 text-center text-sm font-semibold transition-colors"
              >
                Regenerate
              </Link>
            </div>

            {/* Error Message */}
            {execution.status === 'failed' && execution.error_message && (
              <div className="mx-4 mb-4 rounded-lg bg-red-50 p-3">
                <p className="text-xs text-red-700">
                  {execution.error_message}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-tg-text disabled:text-tg-hint bg-tg-secondary-bg rounded-lg px-4 py-2 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-tg-text">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage(p => Math.min(data.pagination.totalPages, p + 1))
            }
            disabled={page === data.pagination.totalPages}
            className="text-tg-text disabled:text-tg-hint bg-tg-secondary-bg rounded-lg px-4 py-2 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
