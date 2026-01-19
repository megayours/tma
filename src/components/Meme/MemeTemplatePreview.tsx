import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';
import type { MemeTemplateCharacter, MemeTemplateTextAnchor } from '@/types/meme';

interface MemeTemplatePreviewProps {
  imageUrl: string;
  alt: string;
  characters?: MemeTemplateCharacter[];
  textAnchors?: MemeTemplateTextAnchor[];
  showLabels?: boolean;
  className?: string;
}

export function MemeTemplatePreview({
  imageUrl,
  alt,
  characters = [],
  textAnchors = [],
  showLabels = true,
  className = '',
}: MemeTemplatePreviewProps) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Base Image */}
      <MediaDisplay
        src={imageUrl}
        alt={alt}
        className="h-full w-full object-contain"
      />

      {/* Character Bounding Boxes Overlay */}
      <div className="absolute inset-0">
        {characters.map((character) => (
          <div
            key={character.slot_index}
            className="absolute border-2 border-blue-500 bg-blue-500/10"
            style={{
              left: `${character.bbox.x * 100}%`,
              top: `${character.bbox.y * 100}%`,
              width: `${character.bbox.w * 100}%`,
              height: `${character.bbox.h * 100}%`,
            }}
          >
            {showLabels && (
              <div className="absolute -top-6 left-0 rounded bg-blue-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                {character.label}
              </div>
            )}
          </div>
        ))}

        {/* Text Anchor Points Overlay */}
        {textAnchors.map((anchor) => {
          // Smart label positioning based on anchor location
          const isRightSide = anchor.position.x > 0.5;
          const isBottomSide = anchor.position.y > 0.5;

          return (
            <div
              key={anchor.anchor_index}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${anchor.position.x * 100}%`,
                top: `${anchor.position.y * 100}%`,
              }}
            >
              {/* Crosshair marker */}
              <div className="relative h-6 w-6">
                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-green-500" />
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-green-500" />
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500 bg-white" />
              </div>

              {showLabels && (
                <div
                  className={`absolute whitespace-nowrap rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-lg ${
                    isRightSide ? 'right-8' : 'left-8'
                  } ${isBottomSide ? 'bottom-0' : 'top-0'}`}
                >
                  {anchor.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
