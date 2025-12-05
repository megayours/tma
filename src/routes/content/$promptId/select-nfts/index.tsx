import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import {
  useGetSupportedCollections,
  useGetNFTByCollectionAndTokenId,
} from '@/hooks/useCollections';
import { NFTSelector } from '@/routes/sticker-packs/$stickerPackId/select-nfts/NFTSelector';
import type { Token } from '@/types/response';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { SelectedNFTsDisplay } from './SelectedNFTsDisplay';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';

export const Route = createFileRoute('/content/$promptId/select-nfts/')({
  component: SelectNFTsPage,
});

// Helper function to convert prompt type to content type
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

function SelectNFTsPage() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  const { selectedNFTs } = useSelectedNFTs();

  // Fetch prompt data
  const { data: prompt, isLoading: isLoadingPrompt } = useGetPrompt(
    promptId,
    session
  );

  const { defaultCollection } = useSelectCommunity();

  // Generate random token ID for default collection
  const [randomTokenId] = useState(() =>
    defaultCollection
      ? Math.floor(Math.random() * defaultCollection.size).toString()
      : '0'
  );

  // Fetch default token (only when needed)
  const { data: defaultToken } = useGetNFTByCollectionAndTokenId(
    defaultCollection?.chain || '',
    defaultCollection?.address || '',
    randomTokenId
  );

  // Generation mutation
  const generateMutation = useGenerateContentMutation(session);

  // Auto-navigate to processing when generation succeeds
  useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      navigate({
        to: '/content/$promptId/processing/$executionId',
        params: {
          promptId,
          executionId: generateMutation.data.id,
        },
      });
    }
  }, [generateMutation.isSuccess, generateMutation.data, promptId, navigate]);

  // Handle generation errors
  useEffect(() => {
    if (generateMutation.isError && generateMutation.error) {
      console.error('Generation failed:', generateMutation.error);
      alert(`Generation failed: ${generateMutation.error.message}`);
    }
  }, [generateMutation.isError, generateMutation.error]);

  const handleGenerate = () => {
    if (!selectedNFTs.length || !prompt) {
      alert('Please select an NFT to continue');
      return;
    }

    const selectedToken = selectedNFTs[0];

    // Generate content using the selected NFT
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

  if (isLoadingPrompt) {
    return <SpinnerFullPage text="Loading..." />;
  }

  if (!prompt) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Prompt not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl p-6">
          <h1 className="text-tg-text mb-2 text-center text-2xl font-bold">
            Select Your NFT
          </h1>
          <p className="text-tg-hint mb-6 text-center">
            Choose an NFT to personalize your {prompt.type}
          </p>

          {/* Selected NFT Display */}
          <SelectedNFTsDisplay selectedNFTs={selectedNFTs} />
        </div>
      </div>

      {/* Bottom Button */}
      <TelegramDualButtons
        mainButton={{
          text: generateMutation.isPending ? 'Generating...' : 'Generate',
          onClick: handleGenerate,
          disabled: !selectedNFTs.length,
          loading: generateMutation.isPending,
          visible: true,
        }}
      />
    </div>
  );
}
