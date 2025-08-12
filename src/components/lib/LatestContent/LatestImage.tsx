import { DisplayImage } from '../DisplayImage';

export function LatestImage({ prompt }: { prompt: any }) {
  console.log('PROMPT', prompt);
  return <DisplayImage image={prompt.images[0]} />;
}
