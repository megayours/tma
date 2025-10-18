import { useSession } from '@/auth/SessionProvider';
import {
  useStickerPackExecutions,
  type StickerPackExecution,
} from '@/hooks/useStickerPack';
import { useState } from 'react';
import { SpinnerFullPage } from '@/components/ui';

// Loading dots animation component
function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="bg-tg-hint h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
      <div className="bg-tg-hint h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
      <div className="bg-tg-hint h-2 w-2 animate-bounce rounded-full"></div>
    </div>
  );
}

// Sticker pack visualization component
function StickerPackVisualization({
  execution,
}: {
  execution: StickerPackExecution;
}) {
  return (
    <div>
      {/* Sticker Grid - 5 columns like Telegram, compact layout */}
      <div className="grid grid-cols-5 gap-1.5">
        {execution.items?.map((item, index) => (
          <div
            key={item.id || index}
            className="relative aspect-square overflow-hidden rounded-lg"
          >
            {item.status === 'completed' && item.generated_content_url ? (
              // Completed sticker - show image
              <img
                src={item.generated_content_url}
                alt={item.bundle_item.prompt.name}
                className="h-full w-full object-contain p-1"
              />
            ) : item.status === 'processing' || item.status === 'pending' ? (
              // Processing or pending - show loading dots
              <div className="flex h-full w-full items-center justify-center">
                <LoadingDots />
              </div>
            ) : item.status === 'failed' ? (
              // Failed - show error icon
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xl text-red-500">✕</span>
              </div>
            ) : (
              // Fallback - show loading dots
              <div className="flex h-full w-full items-center justify-center">
                <LoadingDots />
              </div>
            )}
          </div>
        ))}

        {/* Fill empty slots if items < total_prompts */}
        {execution.items &&
          execution.items.length < execution.total_prompts &&
          Array.from({
            length: execution.total_prompts - execution.items.length,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="relative aspect-square overflow-hidden rounded-lg"
            >
              <div className="flex h-full w-full items-center justify-center">
                <LoadingDots />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

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
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">
          Error loading sticker packs: {error.message}
        </div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
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
    <div className="space-y-4 p-4">
      {/* Executions List */}
      <div className="space-y-2">
        {data.data.map(execution => (
          <div key={execution.id} className="overflow-hidden rounded-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-tg-text text-base leading-tight font-semibold">
                  {execution.bundle.name} (
                  {execution.effect_style.toUpperCase()})
                </h3>
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
            <div className="px-4 py-2">
              <StickerPackVisualization execution={execution} />
            </div>

            {/* Telegram Link for completed */}
            {execution.status === 'completed' &&
              execution.telegram_pack_url && (
                <div className="px-4 pb-4">
                  <a
                    href={execution.telegram_pack_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-blue-500 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                  >
                    Add to Telegram
                  </a>
                </div>
              )}

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
