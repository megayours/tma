import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { Content } from '@/types/content';

interface DisplayContentProps {
  content: Content;
  className?: string;
  showVersion?: boolean;
}

export const DisplayContent = ({
  content,
  className = '',
  showVersion = false,
}: DisplayContentProps) => {
  const baseClasses = `rounded-lg ${className}`.trim();

  const renderContent = () => {
    switch (content.status) {
      case 'completed':
        if (content.type === 'image' && content.image) {
          return (
            <img src={content.image} alt={content.id} className={baseClasses} />
          );
        }
        if (content.type === 'video' && content.gif) {
          return (
            <img src={content.gif} alt={content.id} className={baseClasses} />
          );
        }
        if (content.type === 'sticker' && content.image) {
          return (
            <img src={content.image} alt={content.id} className={baseClasses} />
          );
        }
        if (content.type === 'animated_sticker' && content.gif) {
          return (
            <img src={content.gif} alt={content.id} className={baseClasses} />
          );
        }
        return (
          <div
            className={`${baseClasses} flex items-center justify-center bg-gray-200 text-xs text-gray-500`}
          >
            No content
          </div>
        );

      case 'processing':
        return (
          <div
            className={`${baseClasses} bg-tg-hint/30 flex items-center justify-center`}
          >
            <DotLottieReact
              src={'/lotties/loader.lottie'}
              loop
              autoplay
              className={baseClasses}
            />
          </div>
        );

      case 'failed':
        return (
          <div
            className={`${baseClasses} flex items-center justify-center bg-red-100 text-xs text-red-600`}
          >
            FAILED
          </div>
        );

      default:
        return (
          <div
            className={`${baseClasses} flex items-center justify-center bg-gray-200 text-xs text-gray-500`}
          >
            Unknown
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {renderContent()}
      {showVersion && content.prompt?.version && (
        <div className="absolute right-1 bottom-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
          v{content.prompt.version}
        </div>
      )}
    </div>
  );
};
