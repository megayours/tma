import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { Content } from '@/types/content';
import { MdRefresh } from 'react-icons/md';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';

interface DisplayContentProps {
  content: Content;
  className?: string;
  showVersion?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const DisplayContent = ({
  content,
  className = '',
  showVersion = false,
  onRetry,
  isRetrying = false,
}: DisplayContentProps) => {
  const baseClasses = `rounded-lg ${className}`.trim();

  const renderContent = () => {
    switch (content.status) {
      case 'completed': {
        const mediaSrc =
          (content.type === 'image' || content.type === 'sticker') && content.image
            ? content.image
            : (content.type === 'video' || content.type === 'animated_sticker') &&
                content.gif
              ? content.gif
              : null;

        if (mediaSrc) {
          return <MediaDisplay src={mediaSrc} alt={content.id} className={baseClasses} />;
        }

        return (
          <div
            className={`${baseClasses} flex items-center justify-center bg-gray-200 text-xs text-gray-500`}
          >
            No content
          </div>
        );
      }

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

      case 'error':
        return (
          <div
            className={`${baseClasses} flex flex-col items-center justify-center gap-1 bg-red-100 text-xs text-red-600 ${
              onRetry && !isRetrying
                ? 'cursor-pointer transition-all hover:bg-red-200 active:scale-95'
                : ''
            } ${isRetrying ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={isRetrying ? undefined : onRetry}
          >
            <MdRefresh
              className={`h-5 w-5 ${isRetrying ? 'animate-spin' : ''}`}
            />
            <span>{isRetrying ? 'RETRYING...' : 'RETRY'}</span>
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
