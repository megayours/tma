
export function LatestVideo({ prompt, bg }: { prompt: any; bg: string }) {
  // return <DisplayVideo asGif={true} video={prompt.gifs[0]} />;
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
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white/70">
        <img
          src={prompt.latestContentUrl}
          alt="latest content"
          className="h-full w-full rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}
