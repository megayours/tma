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
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: (itemId: number) => void;
  index: number;
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

function StickerItem({
  item,
  isSelectMode,
  isSelected,
  onToggleSelect,
  index,
}: StickerItemProps) {
  const renderStickerContent = () => {
    if (item.status === 'completed' && item.generated_content_url) {
      return (
        <img
          src={item.generated_content_url}
          alt={item.bundle_item.prompt.name}
          className="h-full w-full object-contain"
          loading={index < 10 ? 'eager' : 'lazy'}
          decoding="async"
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

  const canSelect = item.status === 'completed' && item.can_regenerate;

  return (
    <div className="0 flex flex-col gap-1">
      {/* Sticker Image */}
      <div
        className={`bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg transition-all ${
          isSelectMode && canSelect ? 'cursor-pointer' : ''
        } ${isSelected ? 'ring-tg-button ring-4' : ''}`}
        onClick={() => isSelectMode && canSelect && onToggleSelect(item.id)}
      >
        {renderStickerContent()}

        {/* Selection Checkbox */}
        {isSelectMode && canSelect && (
          <div className="absolute top-2 right-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                isSelected
                  ? 'bg-tg-button border-tg-button'
                  : 'border-gray-300 bg-white/80'
              }`}
            >
              {isSelected && (
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prompt Name */}
      <div className="text-tg-text truncate text-xs font-medium">
        {item.bundle_item.prompt.name}
      </div>

      {/* Regenerate Button or Status */}
      {!isSelectMode && item.status === 'completed' && item.can_regenerate ? (
        ''
      ) : !isSelectMode &&
        item.status === 'completed' &&
        !item.can_regenerate ? (
        <div className="text-tg-hint flex w-full items-center justify-start text-xs">
          <span>Out of Regenerations</span>
        </div>
      ) : (
        !isSelectMode &&
        (item.status === 'processing' || item.status === 'pending') && (
          <div className="text-tg-hint flex w-full items-center justify-start text-xs">
            <span>In Progress</span>
          </div>
        )
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
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(
    new Set()
  );
  const [isRegeneratingBulk, setIsRegeneratingBulk] = useState(false);

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

  const handleToggleSelect = (itemId: number) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleRegenerateButtonClick = async () => {
    if (!isSelectMode) {
      // Enter select mode
      setIsSelectMode(true);
      setSelectedItemIds(new Set());
    } else {
      // Regenerate selected items
      if (selectedItemIds.size === 0) {
        // Exit select mode if nothing selected
        setIsSelectMode(false);
        return;
      }

      setIsRegeneratingBulk(true);
      try {
        // Regenerate all selected items
        await Promise.all(
          Array.from(selectedItemIds).map(itemId =>
            regenerateMutation.mutateAsync(itemId)
          )
        );
      } catch (error) {
        console.error('Failed to regenerate items:', error);
      } finally {
        setIsRegeneratingBulk(false);
        setSelectedItemIds(new Set());
        setIsSelectMode(false);
      }
    }
  };

  const getButtonText = () => {
    if (!isSelectMode) {
      return 'Regenerate';
    }
    if (selectedItemIds.size === 0) {
      return 'Cancel';
    }
    return `Regenerate (${selectedItemIds.size})`;
  };

  return (
    <div className="bg-tg-secondary-bg rounded-lg p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-tg-text text-lg font-semibold">
          Generated Stickers
        </h2>
        <button
          onClick={handleRegenerateButtonClick}
          disabled={isRegeneratingBulk}
          className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FaRedo className={isRegeneratingBulk ? 'animate-spin' : ''} />
          <span>
            {isRegeneratingBulk ? 'Regenerating...' : getButtonText()}
          </span>
        </button>
      </div>

      {/* Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {execution.items?.map((item, index) => (
          <StickerItem
            key={item.id}
            item={item}
            onRegenerate={handleRegenerate}
            isPending={regeneratingItemId === item.id}
            isSelectMode={isSelectMode}
            isSelected={selectedItemIds.has(item.id)}
            onToggleSelect={handleToggleSelect}
            index={index}
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
