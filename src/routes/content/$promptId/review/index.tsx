import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { TelegramMainButton } from '@/components/TelegramMainButton';
import { z } from 'zod';
import { useMemo, useState, useEffect } from 'react';
import { decodeNFT } from '@/utils/nftEncoding';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { SpinnerFullPage } from '@/components/ui';
import { useGenerateContentMutation } from '@/hooks/useContents';

const reviewSearchSchema = z.object({
  nft: z.string(),
});

export const Route = createFileRoute('/content/$promptId/review/')({
  validateSearch: reviewSearchSchema,
  component: ReviewPage,
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

// Helper function to map prompt type to API content type
const getContentType = (
  promptType: string
): 'image' | 'video' | 'sticker' | 'animated_sticker' => {
  switch (promptType) {
    case 'images':
      return 'image';
    case 'videos':
    case 'gifs':
      return 'video';
    case 'stickers':
      return 'sticker';
    case 'animated_stickers':
      return 'animated_sticker';
    default:
      return 'image';
  }
};

function ReviewPage() {
  const { promptId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch prompt data
  const { data: prompt, isLoading: isLoadingPrompt } = useGetPrompt(
    promptId,
    session
  );

  // Decode NFT from URL
  const nftData = useMemo(() => {
    try {
      return decodeNFT(search.nft);
    } catch (error) {
      console.error('Failed to decode NFT from URL:', error);
      return null;
    }
  }, [search.nft]);

  // Fetch full NFT data from API using decoded URL params
  const { data: selectedToken, isLoading: isLoadingNFT } =
    useGetNFTByCollectionAndTokenId(
      nftData?.chain || '',
      nftData?.contractAddress || '',
      nftData?.tokenId || ''
    );

  const generateMutation = useGenerateContentMutation(session);

  // Handle successful generation
  useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      navigate({
        to: '/content/$promptId/processing/$executionId',
        params: {
          promptId,
          executionId: generateMutation.data.id,
        },
        search: {
          nft: search.nft,
        },
      });
    }
  }, [
    generateMutation.isSuccess,
    generateMutation.data,
    promptId,
    search.nft,
    navigate,
  ]);

  // Handle generation errors
  useEffect(() => {
    if (generateMutation.isError) {
      console.error('Generation failed:', generateMutation.error);
      alert(`Generation failed: ${(generateMutation.error as Error).message}`);
      setIsConfirming(false);
    }
  }, [generateMutation.isError, generateMutation.error]);

  const handleConfirm = () => {
    if (!selectedToken || !prompt) {
      alert('Missing data. Please go back and try again.');
      return;
    }

    setIsConfirming(true);
    generateMutation.mutate({
      promptId: promptId,
      type: getContentType(prompt.type || 'images'),
      inputs: [
        {
          prompt_id: promptId,
          chain: selectedToken.contract.chain,
          contract_address: selectedToken.contract.address,
          token_id: selectedToken.id,
        },
      ],
    });
  };

  // Loading or error states
  if (isLoadingPrompt || isLoadingNFT || !prompt) {
    return <SpinnerFullPage text="Loading..." />;
  }

  if (!nftData || !selectedToken) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Invalid NFT data
          </h2>
          <p className="text-tg-hint mb-4">Please go back and select an NFT.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md p-4">
          <h1 className="text-tg-text mb-6 text-center text-2xl font-bold">
            Confirm Details
          </h1>

          {/* Prompt Section */}
          <div className="mb-4">
            <p className="text-tg-hint mb-2 text-sm font-medium">Prompt</p>
            <p className="text-tg-text text-xl font-bold">
              {prompt.name || 'Untitled'}
            </p>
          </div>

          {/* Selected NFT Section */}
          <div className="mb-4">
            <p className="text-tg-hint mb-2 text-sm font-medium">
              Selected NFT
            </p>
            <div className="bg-tg-bg flex items-center gap-4 rounded-lg p-4">
              {selectedToken.image && (
                <img
                  src={selectedToken.image}
                  alt={selectedToken.name || 'Selected NFT'}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-tg-text font-semibold">
                  {selectedToken.name || `#${selectedToken.id}`}
                </p>
                <p className="text-tg-hint text-sm">
                  {selectedToken.contract?.name || 'Unknown Collection'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <TelegramMainButton
        text={
          generateMutation.isPending || isConfirming
            ? 'Generating...'
            : 'Confirm & Generate'
        }
        onClick={handleConfirm}
        disabled={generateMutation.isPending || isConfirming}
      />
    </div>
  );
}
