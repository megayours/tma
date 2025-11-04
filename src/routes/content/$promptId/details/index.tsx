import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { Button } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/content/$promptId/details/')({
  component: ContentDetails,
});

// Helper function to get display label for prompt type
const getTypeLabel = (
  type: 'images' | 'videos' | 'stickers' | 'gifs' | 'animated_stickers'
): string => {
  switch (type) {
    case 'images':
      return 'Image';
    case 'videos':
      return 'GIF';
    case 'stickers':
      return 'Sticker';
    case 'gifs':
      return 'GIF';
    case 'animated_stickers':
      return 'Animated Sticker';
    default:
      return type;
  }
};

function ContentDetails() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);

  const handleContinue = () => {
    navigate({
      to: '/content/$promptId/select-nfts',
      params: { promptId },
    });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading prompt details..." />;
  }

  if (error || !prompt) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Failed to load prompt
          </h2>
          <p className="text-tg-hint mb-4">
            {error?.message || 'Prompt not found'}
          </p>
          <Button
            mode="filled"
            size="m"
            onClick={() => navigate({ to: '/feed' })}
          >
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  // Get the first available content URL for preview
  const getPreviewUrl = () => {
    if (prompt.stickers && prompt.stickers.length > 0) return prompt.stickers[0];
    if (prompt.gifs && prompt.gifs.length > 0) return prompt.gifs[0];
    if (prompt.images && prompt.images.length > 0) return prompt.images[0];
    if (prompt.videos && prompt.videos.length > 0) return prompt.videos[0];
    return null;
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className="flex h-screen flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          {/* Type Badge */}
          <div className="mb-4">
            <span className="bg-tg-button text-tg-button-text inline-block rounded-full px-3 py-1 text-sm font-semibold">
              {getTypeLabel(
                prompt.type as
                  | 'images'
                  | 'videos'
                  | 'stickers'
                  | 'gifs'
                  | 'animated_stickers'
              )}
            </span>
          </div>

          {/* Prompt Name */}
          <h1 className="text-tg-text mb-3 text-3xl font-bold">
            {prompt.name || 'Untitled Prompt'}
          </h1>

          {/* Description */}
          {prompt.description && (
            <p className="text-tg-hint mb-6 text-base">{prompt.description}</p>
          )}

          {/* Preview Content */}
          {previewUrl && (
            <div className="bg-tg-section-bg mb-6 overflow-hidden rounded-lg">
              <div className="flex items-center justify-center p-8">
                <img
                  src={previewUrl}
                  alt={prompt.name || 'Prompt preview'}
                  className="max-h-96 w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="bg-tg-section-bg rounded-lg p-4">
            <h3 className="text-tg-text mb-2 font-semibold">
              What you'll create:
            </h3>
            <ul className="text-tg-hint space-y-1 text-sm">
              <li>
                ✨ Personalized{' '}
                {getTypeLabel(
                  prompt.type as
                    | 'images'
                    | 'videos'
                    | 'stickers'
                    | 'gifs'
                    | 'animated_stickers'
                ).toLowerCase()}
              </li>
              <li>🎨 Using your own NFT</li>
              <li>⚡ Generated in minutes</li>
              <li>💯 100% unique to you</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="border-tg-section-separator border-t p-4">
        <Button
          mode="filled"
          size="l"
          onClick={handleContinue}
          className="w-full"
        >
          Select Your NFT
        </Button>
      </div>
    </div>
  );
}
