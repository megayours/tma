import type { PromptWithContent } from '../../../types/content';

export function LatestAnimatedSticker({
  prompt,
  bg,
}: {
  prompt: PromptWithContent;
  bg: string;
}) {
  console.log('prompt', prompt);
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
        <img
          src={prompt.latestContentUrl}
          alt="latest animated sticker content"
          className="max-h-full max-w-2/3 rounded-2xl object-contain"
          style={{
            borderRadius: '1rem',
          }}
        />
      </div>
    </div>
  );
}
