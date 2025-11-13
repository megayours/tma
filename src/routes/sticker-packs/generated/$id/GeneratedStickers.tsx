import type {
  StickerPackExecution,
  StickerPackExecutionItem,
} from '@/hooks/useStickerPack';
import { useRegenerateItem } from '@/hooks/useStickerPack';
import { useSession } from '@/auth/SessionProvider';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';

interface GeneratedStickersProps {
  execution: StickerPackExecution;
}

interface StickerItemProps {
  item: StickerPackExecutionItem;
  onRegenerate: (itemId: number) => void;
  isPending: boolean;
}

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

function StickerItem({ item, onRegenerate, isPending }: StickerItemProps) {
  const renderStickerContent = () => {
    if (item.status === 'completed' && item.generated_content_url) {
      return (
        <img
          src={item.generated_content_url}
          alt={item.bundle_item.prompt.name}
          className="h-full w-full object-contain"
        />
      );
    }

    if (item.status === 'processing' || item.status === 'pending') {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingDots />
        </div>
      );
    }

    if (item.status === 'failed') {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-xl text-red-500">✕</span>
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingDots />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Sticker Image */}
      <div className="bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg">
        {renderStickerContent()}
      </div>

      {/* Prompt Name */}
      <div className="text-tg-text truncate text-xs font-medium">
        {item.bundle_item.prompt.name}
      </div>

      {/* Regenerate Button or Status */}
      {item.status === 'completed' ? (
        <button
          onClick={() => onRegenerate(item.id)}
          disabled={isPending}
          className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaRedo className={isPending ? 'animate-spin' : ''} />
          <span>{isPending ? 'Regenerating...' : 'Regenerate'}</span>
        </button>
      ) : (item.status === 'processing' || item.status === 'pending') && (
        <div className="text-tg-hint flex w-full items-center justify-center py-2 text-sm">
          <span>In Progress</span>
        </div>
      )}

      {/* Error Message */}
      {item.status === 'failed' && item.error_message && (
        <div className="text-xs text-red-500">{item.error_message}</div>
      )}
    </div>
  );
}

export function GeneratedStickers({ execution }: GeneratedStickersProps) {
  const { session } = useSession();
  const regenerateMutation = useRegenerateItem(execution.id, session);
  const [regeneratingItemId, setRegeneratingItemId] = useState<number | null>(
    null
  );

  const handleRegenerate = async (itemId: number) => {
    setRegeneratingItemId(itemId);
    try {
      await regenerateMutation.mutateAsync(itemId);
    } catch (error) {
      console.error('Failed to regenerate item:', error);
    } finally {
      setRegeneratingItemId(null);
    }
  };

  return (
    <div className="bg-tg-secondary-bg rounded-lg p-6">
      <h2 className="text-tg-text mb-4 text-lg font-semibold">
        Generated Stickers
      </h2>

      {/* Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {execution.items?.map((item) => (
          <StickerItem
            key={item.id}
            item={item}
            onRegenerate={handleRegenerate}
            isPending={regeneratingItemId === item.id}
          />
        ))}

        {/* Fill empty slots if items < total_prompts */}
        {execution.items &&
          execution.items.length < execution.total_prompts &&
          Array.from({
            length: execution.total_prompts - execution.items.length,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg"
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
