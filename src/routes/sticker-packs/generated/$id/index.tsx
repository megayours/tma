import { createFileRoute } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useGetExecution } from '@/hooks/useStickerPack';
import { SpinnerFullPage } from '@/components/ui';
import { StickerPackVisualization } from '@/components/StickerPack/StickerPackVisualization';
import { TelegramMainButton } from '@/components/TelegramMainButton';

export const Route = createFileRoute('/sticker-packs/generated/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { session } = useSession();

  const bundleId = parseInt(id);

  // Fetch the latest execution for this bundle
  const { data: execution, isLoading, error } = useGetExecution(bundleId, session);

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
            <div className="flex-1">
              <h1 className="text-tg-text mb-2 text-2xl font-bold">
                {execution.bundle.name}
              </h1>
              {execution.bundle.description && (
                <p className="text-tg-hint text-sm">
                  {execution.bundle.description}
                </p>
              )}
            </div>
            <span
              className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(execution.status)}`}
            >
              {getStatusLabel(execution.status)}
            </span>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-tg-text text-sm font-medium">Progress</span>
              <span className="text-tg-hint text-sm">
                {execution.completed_prompts} / {execution.total_prompts} stickers
              </span>
            </div>
            <div className="bg-tg-hint/20 h-2 overflow-hidden rounded-full">
              <div
                className="bg-tg-button h-full transition-all duration-300"
                style={{
                  width: `${execution.progress_percentage}%`,
                }}
              />
            </div>
          </div>

          {/* Tier/Style */}
          <div className="mb-4">
            <span className="text-tg-hint text-sm">Style: </span>
            <span className="text-tg-text text-sm font-semibold capitalize">
              {execution.effect_style}
            </span>
          </div>

          {/* NFT Used */}
          {execution.nft_token && (
            <div className="border-tg-hint/20 border-t pt-4">
              <h3 className="text-tg-hint mb-2 text-sm font-semibold">
                NFT Used
              </h3>
              <div className="text-tg-text text-sm">
                <div className="font-medium">
                  {execution.nft_token.contract.name}
                </div>
                <div className="text-tg-hint text-xs">#{execution.nft_token.id}</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {execution.error_message && (
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-xs text-red-700">{execution.error_message}</p>
            </div>
          )}
        </div>

        {/* Sticker Grid */}
        <div className="bg-tg-secondary-bg rounded-lg p-6">
          <h2 className="text-tg-text mb-4 text-lg font-semibold">
            Generated Stickers
          </h2>
          <StickerPackVisualization execution={execution} />
        </div>

        {/* Add to Telegram Button */}
        {execution.status === 'completed' && execution.telegram_pack_url && (
          <TelegramMainButton
            text="Add to Telegram"
            onClick={() => {
              if (execution.telegram_pack_url) {
                window.open(execution.telegram_pack_url, '_blank');
              }
            }}
            visible={true}
          />
        )}
      </div>
    </div>
  );
}
