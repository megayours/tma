import type { StickerPackExecution } from '@/hooks/useStickerPack';

// Loading dots animation component
export function LoadingDots() {
  return (
    <div className="flex items-center justify-center space-x-1">
      <div className="bg-tg-hint h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
      <div className="bg-tg-hint h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
      <div className="bg-tg-hint h-2 w-2 animate-bounce rounded-full"></div>
    </div>
  );
}

// Sticker pack visualization component
export function StickerPackVisualization({
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
