import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPackExecutionById } from '@/hooks/useStickerPack';
import { SpinnerFullPage } from '@/components/ui';
import { NFTUsedDisplay } from './NFTUsedDisplay';
import { GeneratedStickers } from './GeneratedStickers';
import { ProcessingTimeCountdown } from './ProcessingTimeCountdown';

export const Route = createFileRoute('/sticker-packs/generated/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { session } = useSession();

  // Fetch execution status by execution ID
  const {
    data: execution,
    isLoading,
    error,
  } = useStickerPackExecutionById(id, session);

  if (isLoading) {
    return <SpinnerFullPage text="Loading sticker pack..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-tg-destructive-text mb-4 text-6xl">⚠️</div>
            <h2 className="text-tg-text mb-2 text-xl font-semibold">
              Failed to load sticker pack
            </h2>
            <p className="text-tg-hint">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 text-6xl">📦</div>
            <h2 className="text-tg-text mb-2 text-xl font-semibold">
              No sticker pack found
            </h2>
            <p className="text-tg-hint">
              No executions found for this sticker pack bundle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pending Payment';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
      case 'error':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-tg-secondary-bg rounded-lg p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <h1 className="text-tg-text mb-2 flex-[2] text-2xl font-bold">
                  {execution.bundle.name}
                </h1>
                <div className="flex flex-[1] items-center justify-end gap-2">
                  {execution.status === 'completed' &&
                  execution.telegram_pack_url ? (
                    <a
                      href={execution.telegram_pack_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-tg-button text-tg-button-text rounded-lg p-1.5 text-center text-sm whitespace-nowrap transition-colors"
                    >
                      Add to Telegram
                    </a>
                  ) : execution.status === 'processing' ? (
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold ${getStatusColor(execution.status)}`}
                    >
                      <div>{getStatusLabel(execution.status)}</div>
                      <ProcessingTimeCountdown
                        queueInfo={execution.queueInfo}
                      />
                    </div>
                  ) : (
                    <span
                      className={`flex items-center justify-center rounded-full px-2 align-middle text-xs font-semibold ${getStatusColor(execution.status)}`}
                    >
                      {getStatusLabel(execution.status)}
                    </span>
                  )}
                </div>
              </div>
              {execution.bundle.description && (
                <p className="text-tg-hint text-sm">
                  {execution.bundle.description}
                </p>
              )}
            </div>
          </div>
          {/* NFT Used */}
          {execution.nft_token && (
            <NFTUsedDisplay nftToken={execution.nft_token} />
          )}

          {/* Error Message */}
          {execution.error_message && (
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-700">{execution.error_message}</p>
            </div>
          )}
        </div>

        {/* Sticker Grid */}
        <GeneratedStickers execution={execution} />
      </div>
    </div>
  );
}
