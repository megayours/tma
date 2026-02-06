import { useSession } from '@/auth/SessionProvider';
import { type Prompt } from '@/types/prompt';
import { LoadingDots } from '../../../../components/StickerPack/StickerPackVisualization';
import { Link } from '@tanstack/react-router';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';
import { useGetContentByPrompt } from '../../../../hooks/useContents';

export function ContentList({ prompt }: { prompt: Prompt }) {
  const { session } = useSession();
  const {
    data: contents,
    isLoading,
    error,
  } = useGetContentByPrompt(session, prompt.id, { size: 9, page: 1 });

  if (true || isLoading) {
    return (
      <div className="grid w-full grid-cols-3 gap-2 md:gap-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="bg-tg-hint/10 relative flex aspect-square items-center justify-center overflow-hidden rounded-lg"
          >
            <LoadingDots />
          </div>
        ))}
      </div>
    );
  }

  if (error || !contents) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-tg-text mb-2 text-xl font-bold">
              Failed to load content
            </h2>
            <p className="text-tg-hint mb-4">
              {error?.message || 'Content not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log('CONTENT LIST:', contents);
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {contents.content.map((item, index) => (
          <Link
            to="/content/$promptId/success/execution/$executionId"
            params={{
              promptId: String(prompt.id),
              executionId: String(item.executionId || item.id),
            }}
            className="block"
          >
            <div
              key={index}
              className="bg-tg-hint/10 relative aspect-square overflow-hidden rounded-lg"
            >
              <MediaDisplay
                src={
                  item.thumbnailUrl
                    ? item.thumbnailUrl
                    : item.url
                      ? item.url
                      : '/logo.png'
                }
                alt={`${prompt.name || 'Content'} ${index + 1}`}
                className="h-full w-full object-cover"
                poster={prompt.thumbnails?.[index] || '/logo.png'}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
