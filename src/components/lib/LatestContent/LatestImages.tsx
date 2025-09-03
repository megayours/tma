import type { Prompt } from '@/types/prompt';

export function LatestImage({ prompt, bg }: { prompt: Prompt; bg: string }) {
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
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/50 p-5 shadow-2xl">
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
