import { createFileRoute } from '@tanstack/react-router';
import { useGetPrompts } from '@/hooks/usePrompts';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { Button, Card } from '@telegram-apps/telegram-ui';
import type { PromptWithContent } from '@/types/content';

export const Route = createFileRoute('/latest-demo/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LatestDemo />;
}

function LatestDemo() {
  const { session } = useSession();
  const { selectedFavorite, isLoadingSelected } = useGetFavorites(session);
  const generateContent = useGenerateContentMutation(session);

  const { data, isLoading, error } = useGetPrompts({
    type: 'all',
    pagination: {
      page: 1,
      size: 10,
    },
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const handleGenerate = (prompt: PromptWithContent) => {
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
      inputs: [],
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-2">Loading latest prompts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="p-6 text-center">
          <div className="mb-2 text-xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-lg font-semibold">Failed to load prompts</h2>
          <p className="mb-4 text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold">Latest Prompts</h1>
        <p className="text-gray-600">Discover and generate from the newest prompts</p>
      </div>

      <div className="space-y-4">
        {data.prompts.map((prompt: PromptWithContent) => (
          <Card key={prompt.id} type="plain" className="overflow-hidden">
            <div className="flex flex-row">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-l-lg">
                <img
                  src={prompt.latestContentUrl || prompt.image || '/gifs/loadings.gif'}
                  alt={prompt.name}
                  className="h-full w-full object-cover"
                />
                {prompt.latestContentUrl && (
                  <div className="absolute top-1 right-1 rounded bg-black/70 px-1 py-0.5">
                    <span className="text-xs font-medium text-white">Latest</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-medium">{prompt.name}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                      {prompt.type === 'animated_stickers' ? 'Animated' : prompt.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">by {prompt.ownerName}</p>
                  {prompt.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {prompt.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    {prompt.generationCount} generations
                  </div>
                  
                  {session && selectedFavorite ? (
                    <Button
                      size="s"
                      mode="filled"
                      onClick={() => handleGenerate(prompt)}
                      disabled={isLoadingSelected || generateContent.isPending}
                    >
                      {generateContent.isPending ? 'Generating...' : 'Generate'}
                    </Button>
                  ) : (
                    <Button size="s" mode="outline" disabled>
                      {!session ? 'Login Required' : 'Select NFT'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {generateContent.isError && generateContent.variables?.promptId === prompt.id.toString() && (
              <div className="border-t bg-red-50 p-3 text-sm text-red-600">
                Error: {generateContent.error?.message || 'Failed to generate content'}
              </div>
            )}
            
            {generateContent.isSuccess && generateContent.variables?.promptId === prompt.id.toString() && (
              <div className="border-t bg-green-50 p-3 text-sm text-green-600">
                Content generated successfully!
              </div>
            )}
          </Card>
        ))}
      </div>

      {data.prompts.length === 0 && (
        <div className="flex h-32 items-center justify-center text-gray-500">
          No prompts available
        </div>
      )}
    </div>
  );
}
