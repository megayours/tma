import { Button } from '@telegram-apps/telegram-ui';
import type { Prompt } from '@/types/prompt';

interface StickerCollectionBarProps {
  selectedPrompts: Prompt[];
  onCreateCollection: () => void;
  onClear: () => void;
  maxPrompts?: number;
}

export function StickerCollectionBar({
  selectedPrompts,
  onCreateCollection,
  onClear,
  maxPrompts = 10,
}: StickerCollectionBarProps) {
  // Don't render if no prompts are selected
  if (selectedPrompts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-[100] border-t border-gray-200 bg-white/95 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">
              {selectedPrompts.length} / {maxPrompts} selected
            </span>
          </div>

          {/* Show mini preview of selected prompts */}
          <div className="flex -space-x-2">
            {selectedPrompts.slice(0, 3).map((prompt, index) => (
              <div
                key={prompt.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium"
                style={{ zIndex: 3 - index }}
              >
                {prompt.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {selectedPrompts.length > 3 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-medium">
                +{selectedPrompts.length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            mode="plain"
            size="s"
            onClick={onClear}
            disabled={selectedPrompts.length === 0}
          >
            Clear
          </Button>
          <Button
            mode="filled"
            size="l"
            onClick={onCreateCollection}
            disabled={selectedPrompts.length === 0}
            stretched
          >
            Create
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className="h-1 bg-blue-500 transition-all duration-300"
          style={{
            width: `${(selectedPrompts.length / maxPrompts) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

export type { StickerCollectionBarProps };
