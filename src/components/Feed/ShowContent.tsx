import { Button } from '@telegram-apps/telegram-ui';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { LatestImage } from '@/components/lib/LatestContent/LatestImages';
import { LatestVideo } from '@/components/lib/LatestContent/LatestVideos';
import { LatestSticker } from '@/components/lib/LatestContent/LatestStickers';
import { LatestAnimatedSticker } from '@/components/lib/LatestContent/LatestAnimatedStickers';
import type { PromptWithContent } from '@/types/content';

// Array of background GIF files
const backgroundGifs = [
  '/backgrounds/doodle-heart.gif',
  '/backgrounds/doodle-muscle.gif',
  '/backgrounds/doodle-skate.gif',
  '/backgrounds/doodle-star.gif',
  '/backgrounds/doodle-stars.gif',
  '/backgrounds/doodle-sticker.gif',
];

// Function that randomly returns one GIF from the array
const getRandomBackgroundGif = (): string => {
  const randomIndex = Math.floor(Math.random() * backgroundGifs.length);
  return backgroundGifs[randomIndex];
};

interface ShowContentProps {
  prompt: PromptWithContent;
  isLoading: boolean;
}

export function ShowContent({ prompt }: ShowContentProps) {
  const { session } = useSession();
  const { selectedFavorite, isLoadingSelected } = useGetFavorites(session);
  const generateContent = useGenerateContentMutation(session);

  if (!prompt) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>No content found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col pb-16">
      <div className="h-25 p-4">
        <h1>{prompt.name}</h1>
        <p>{prompt.ownerName}</p>
      </div>
      <div className="w-full flex-1 overflow-hidden">
        <div className="h-full w-full">
          {prompt.type === 'images' && (
            <LatestImage prompt={prompt} bg={getRandomBackgroundGif()} />
          )}
          {prompt.type === 'videos' && (
            <LatestVideo prompt={prompt} bg={getRandomBackgroundGif()} />
          )}
          {prompt.type === 'stickers' && (
            <LatestSticker prompt={prompt} bg={getRandomBackgroundGif()} />
          )}
          {prompt.type === 'animated_stickers' && (
            <LatestAnimatedSticker
              prompt={prompt}
              bg={getRandomBackgroundGif()}
            />
          )}
        </div>
      </div>
      {/* Only show button if user is authenticated and has selected favorite */}
      {session && selectedFavorite && (
        <div className="h-20 p-4">
          <Button
            onClick={() => {
              if (!selectedFavorite || !session) return;

              // Map prompt type to API type
              let apiType: 'image' | 'video' | 'sticker' | 'animated_sticker';
              switch (prompt.type) {
                case 'images':
                  apiType = 'image';
                  break;
                case 'videos':
                  apiType = 'video';
                  break;
                case 'stickers':
                  apiType = 'sticker';
                  break;
                case 'animated_stickers':
                  apiType = 'animated_sticker';
                  break;
                default:
                  console.error('Unsupported prompt type:', prompt.type);
                  return;
              }

              generateContent.mutate({
                promptId: prompt.id.toString(),
                type: apiType,
                selectedFavorite,
                inputs: [], // Empty for now
              });
            }}
            disabled={isLoadingSelected || generateContent.isPending}
            mode="filled"
            size="l"
            stretched
          >
            <div className="flex flex-row items-center justify-between gap-2">
              {generateContent.isPending
                ? 'Generating...'
                : isLoadingSelected
                  ? 'Loading...'
                  : `Make it Yours with `}
              <div className="h-6 w-6 overflow-hidden rounded-full">
                <img
                  src={selectedFavorite.token.image}
                  alt={selectedFavorite.token.contract.name}
                />
              </div>
            </div>
          </Button>
          {generateContent.isError && (
            <div className="mt-2 text-sm text-red-500">
              Error:{' '}
              {generateContent.error?.message || 'Failed to generate content'}
            </div>
          )}
          {generateContent.isSuccess && (
            <div className="mt-2 text-sm text-green-500">
              Content generated successfully!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
