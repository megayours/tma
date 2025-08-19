import type { PromptWithContent } from '../../../types/content';

export function LatestSticker({ prompt }: { prompt: PromptWithContent }) {
  console.log('PROMPT', prompt);

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundImage: `url(/backgrounds/doodle-muscle.gif)`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/50 p-5">
        <img
          src={prompt.latestContentUrl}
          alt="latest sticker content"
          className="max-h-full max-w-2/3 rounded-2xl object-contain"
          style={{
            borderRadius: '1rem',
          }}
        />
      </div>
    </div>
  );
}
