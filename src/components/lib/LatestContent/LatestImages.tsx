import { DisplayImage } from '../DisplayImage';
import type { PromptWithContent } from '@/types/content';

export function LatestImage({ prompt }: { prompt: PromptWithContent }) {
  // return (
  //   <div className="flex gap-4 overflow-x-auto pb-4">
  //     {prompt.latestContentUrl && (
  //       <div className="flex-shrink-0">
  //         <DisplayImage imageStatus={prompt.latestContent} />
  //       </div>
  //     )}
  //   </div>
  // );

  // TODO: temporary, revert once api is updated
  console.log('PROMPT', prompt);
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundImage: `url(/backgrounds/doodle-sticker.gif)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/90 p-5 shadow-2xl">
        <img
          src={prompt.latestContentUrl}
          alt="latest content"
          className="max-h-full max-w-full rounded-2xl object-contain"
          style={{
            borderRadius: '1rem',
          }}
        />
      </div>
    </div>
  );
}
