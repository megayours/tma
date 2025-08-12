import { DisplayVideo } from '../DisplayVideo';

export function LatestVideo({ prompt }: { prompt: any }) {
  console.log('PROMPT', prompt);
  return <DisplayVideo asGif={true} video={prompt.gifs[0]} />;
}
