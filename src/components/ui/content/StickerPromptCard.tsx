import { Card, CardContent, CardHeader, CardTitle } from '../layout/Card';
import type { Prompt } from '@/types/prompt';

interface StickerPromptCardProps {
  prompt: Prompt;
  onClick?: () => void;
  className?: string;
}

export function StickerPromptCard({
  prompt,
  onClick,
  className,
}: StickerPromptCardProps) {
  // Get a random sticker from the prompt's stickers array
  const getRandomSticker = () => {
    if (!prompt.stickers || prompt.stickers.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * prompt.stickers.length);
    return prompt.stickers[randomIndex];
  };

  const randomSticker = getRandomSticker();

  return (
    <Card
      variant="default"
      className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="truncate text-base font-medium">
          {prompt.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100">
          {randomSticker ? (
            <img
              src={randomSticker}
              alt={`Sticker from ${prompt.name}`}
              className="h-full w-full object-cover"
              onError={e => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}

          {/* Fallback placeholder */}
          <div
            className={`flex flex-col items-center justify-center text-gray-400 ${randomSticker ? 'hidden' : ''}`}
          >
            <div className="mb-2 text-2xl">🎨</div>
            <div className="text-center text-xs">No stickers available</div>
          </div>
        </div>

        {prompt.description && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-600">
            {prompt.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>{prompt.stickers?.length || 0} stickers</span>
          {prompt.usageCount !== undefined && (
            <span>{prompt.usageCount} uses</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export type { StickerPromptCardProps };
