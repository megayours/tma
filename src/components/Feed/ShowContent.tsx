import { useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import {
  useGenerateContentMutation,
  useContentGenerationStatus,
} from '@/hooks/useContents';
import { LatestImage } from '@/components/lib/LatestContent/LatestImages';
import { LatestVideo } from '@/components/lib/LatestContent/LatestVideos';
import { LatestSticker } from '@/components/lib/LatestContent/LatestStickers';
import { LatestAnimatedSticker } from '@/components/lib/LatestContent/LatestAnimatedStickers';
import type { PromptWithContent } from '@/types/content';
import type { Token } from '@/types/response';
import { TokenSelectionCloud } from './TokenSelectionCloud';

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
  const [showTokenSelection, setShowTokenSelection] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);

  const { data: generationStatus, error: statusError } =
    useContentGenerationStatus(executionId);

  const isGenerating =
    generateContent.isPending ||
    generationStatus?.status === 'pending' ||
    generationStatus?.status === 'processing';

  // Determine if we need token selection
  const needsTokenSelection = () => {
    if (!prompt.minTokens && !prompt.maxTokens) return false;
    const requiredTokens = prompt.minTokens || 0;
    const optionalTokens = prompt.maxTokens
      ? prompt.maxTokens - requiredTokens
      : 0;
    return requiredTokens > 1 || optionalTokens > 0;
  };

  const handleDirectGenerate = () => {
    if (!selectedFavorite || !session) return;

    // Map prompt type to API type
    let apiType: 'image' | 'gif' | 'sticker' | 'animated_sticker';
    switch (prompt.type) {
      case 'images':
        apiType = 'image';
        break;
      case 'gifs':
        apiType = 'gif';
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

    // Convert selectedFavorite to inputs array format
    const inputs = [
      {
        chain: selectedFavorite.token.contract.chain,
        contract_address: selectedFavorite.token.contract.address,
        token_id: selectedFavorite.token.id,
      },
    ];

    generateContent.mutate(
      {
        promptId: prompt.id.toString(),
        type: apiType,
        inputs: inputs,
      },
      {
        onSuccess: data => setExecutionId(data.execution_id),
      }
    );
  };

  const handleTokenGenerate = (tokens: Token[]) => {
    if (!session || tokens.length === 0) return;

    // Map prompt type to API type
    let apiType: 'image' | 'gif' | 'sticker' | 'animated_sticker';
    switch (prompt.type) {
      case 'images':
        apiType = 'image';
        break;
      case 'gifs':
        apiType = 'gif';
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

    // Convert all tokens to inputs array format
    const inputs = tokens.map(token => ({
      chain: token.contract.chain,
      contract_address: token.contract.address,
      token_id: token.id,
    }));

    generateContent.mutate(
      {
        promptId: prompt.id.toString(),
        type: apiType,
        inputs: inputs,
      },
      {
        onSuccess: data => setExecutionId(data.execution_id),
      }
    );

    setShowTokenSelection(false);
  };

  if (!prompt) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>No content found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen w-full flex-col pb-40">
      <div className="z-0 w-full flex-1 overflow-hidden">
        <div className="z-10 mb-4 h-25 p-4">
          <h1>{prompt.name}</h1>
          <p>{prompt.ownerName}</p>
        </div>
        <div
          className="flex w-full flex-col"
          style={{ height: 'calc(100vh - 18.25rem)' }}
        >
          <div className="mb-4 h-full overflow-hidden">
            {prompt.type === 'images' && (
              <LatestImage prompt={prompt} bg={getRandomBackgroundGif()} />
            )}
            {prompt.type === 'gifs' && (
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

          {session && selectedFavorite && (
            <div className="z-30 h-20 p-4">
              <Button
                onClick={() => {
                  if (!selectedFavorite || !session) return;

                  if (needsTokenSelection()) {
                    setShowTokenSelection(true);
                  } else {
                    handleDirectGenerate();
                  }
                }}
                disabled={isLoadingSelected || isGenerating}
                mode="filled"
                size="l"
                stretched
              >
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <div>
                      {isGenerating
                        ? 'Generating...'
                        : isLoadingSelected
                          ? 'Loading...'
                          : `Make it Yours with `}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-6 w-6 overflow-hidden rounded-full">
                      <img
                        src={selectedFavorite.token?.image || '/nfts/not-available.png'}
                        alt={selectedFavorite.token?.contract?.name || 'Token'}
                      />
                    </div>
                    {!isGenerating && !isLoadingSelected && prompt.minTokens && (
                        <div className="flex items-center gap-1">
                          {prompt.minTokens > 1 && (
                            <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                              +{prompt.minTokens - 1}
                            </span>
                          )}
                          {prompt.maxTokens &&
                            prompt.maxTokens > prompt.minTokens && (
                              <span className="rounded-full bg-gray-400 px-2 py-1 text-xs font-medium text-white opacity-70">
                                +{prompt.maxTokens - prompt.minTokens} opt
                              </span>
                            )}
                        </div>
                      )}
                  </div>
                </div>
              </Button>
              {(generateContent.isError ||
                generationStatus?.status === 'error' ||
                statusError) && (
                <div className="mt-2 text-sm text-red-500">
                  Error:{' '}
                  {generationStatus?.error ||
                    generateContent.error?.message ||
                    statusError?.message ||
                    'Failed to generate content'}
                </div>
              )}
              {generationStatus?.status === 'completed' && (
                <div className="mt-2 text-sm text-green-600">
                  Content generated successfully!
                </div>
              )}
              {generationStatus?.status === 'pending' && (
                <div className="text-tg-hint mt-2 text-sm">
                  Queued for generation...
                </div>
              )}
              {generationStatus?.status === 'processing' && (
                <div className="text-tg-hint mt-2 text-sm">
                  Generating your content...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Token Selection Cloud */}
      {showTokenSelection && selectedFavorite && prompt.minTokens && (
        <TokenSelectionCloud
          selectedFavorite={selectedFavorite}
          requiredTokens={prompt.minTokens || 1}
          optionalTokens={
            prompt.maxTokens ? prompt.maxTokens - (prompt.minTokens || 1) : 0
          }
          onClose={() => setShowTokenSelection(false)}
          onGenerate={handleTokenGenerate}
          prompt={{
            id: prompt.id,
            name: prompt.name,
            description: prompt.description,
            type: prompt.type,
            createdAt: prompt.createdAt,
            updatedAt: prompt.updatedAt,
            published: prompt.published,
            lastUsed: prompt.lastUsed,
            usageCount: prompt.usageCount,
            contracts: prompt.contracts || [],
            versions: prompt.versions,
            additionalContentIds: prompt.additionalContentIds || [],
            minTokens: prompt.minTokens,
            maxTokens: prompt.maxTokens,
          }}
        />
      )}
    </div>
  );
}
