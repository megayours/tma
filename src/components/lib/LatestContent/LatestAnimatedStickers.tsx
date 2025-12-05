import type { PromptWithContent } from '../../../types/content';

// Utility function to detect webm files, handling URLs with query parameters
const isWebm = (url: string): boolean => {
  try {
    // Try parsing as URL to extract pathname
    const urlObj = new URL(url);
    return urlObj.pathname.toLowerCase().includes('.webm');
  } catch {
    // If URL parsing fails, fall back to simple check
    return url.toLowerCase().includes('.webm');
  }
};

export function LatestAnimatedSticker({
  prompt,
  bg,
}: {
  prompt: PromptWithContent;
  bg: string;
}) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex h-full w-full items-center justify-center bg-white/50 p-5">
        {prompt.latestContentUrl && isWebm(prompt.latestContentUrl) ? (
          <video
            src={prompt.latestContentUrl}
            className="max-h-full max-w-2/3 rounded-2xl object-contain"
            style={{
              borderRadius: '1rem',
            }}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={prompt.latestContentUrl}
            alt="latest animated sticker content"
            className="max-h-full max-w-2/3 rounded-2xl object-contain"
            style={{
              borderRadius: '1rem',
            }}
          />
        )}
      </div>
    </div>
  );
}
