import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { SelectNFTs } from '@/components/NFT';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { useNFTsFromUrlParams } from '@/hooks/useNFTsFromUrlParams';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { z } from 'zod';

// Define NFT params schema inline for better type inference (0-based indexing)
const nftParamsSchema = z.object({
  nft_0_chain: z.string().optional(),
  nft_0_address: z.string().optional(),
  nft_0_id: z.string().optional(),
  nft_1_chain: z.string().optional(),
  nft_1_address: z.string().optional(),
  nft_1_id: z.string().optional(),
  nft_2_chain: z.string().optional(),
  nft_2_address: z.string().optional(),
  nft_2_id: z.string().optional(),
  nft_3_chain: z.string().optional(),
  nft_3_address: z.string().optional(),
  nft_3_id: z.string().optional(),
  nft_4_chain: z.string().optional(),
  nft_4_address: z.string().optional(),
  nft_4_id: z.string().optional(),
  nft_5_chain: z.string().optional(),
  nft_5_address: z.string().optional(),
  nft_5_id: z.string().optional(),
  nft_6_chain: z.string().optional(),
  nft_6_address: z.string().optional(),
  nft_6_id: z.string().optional(),
  nft_7_chain: z.string().optional(),
  nft_7_address: z.string().optional(),
  nft_7_id: z.string().optional(),
  nft_8_chain: z.string().optional(),
  nft_8_address: z.string().optional(),
  nft_8_id: z.string().optional(),
  nft_9_chain: z.string().optional(),
  nft_9_address: z.string().optional(),
  nft_9_id: z.string().optional(),
});

export const Route = createFileRoute('/content/$promptId/select-nfts/')({
  validateSearch: nftParamsSchema,
  component: SelectNFTsPage,
});

// Helper function to convert prompt type to content type
const getContentType = (
  promptType: string
): 'image' | 'gif' | 'sticker' | 'animated_sticker' => {
  switch (promptType) {
    case 'images':
      return 'image';
    case 'gifs':
      return 'gif';
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
  const search = Route.useSearch();

  // State management
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isManuallyModified, setIsManuallyModified] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch prompt data
  const { data: prompt, isLoading: isLoadingPrompt } = useGetPrompt(
    promptId,
    session
  );

  const { data: collections } = useGetSupportedCollections();

  // Fetch NFTs from URL params
  const {
    tokens: urlTokens,
    isLoading: isLoadingUrlTokens,
    hasUrlParams,
  } = useNFTsFromUrlParams({
    urlParams: search,
    enabled: !isManuallyModified && !hasInitialized,
  });

  // Generation mutation
  const generateMutation = useGenerateContentMutation(session);

  // Initialize tokens from URL params
  useEffect(() => {
    if (hasInitialized) return;

    // Priority 1: URL params
    if (hasUrlParams && urlTokens.length > 0) {
      const validTokens = urlTokens.slice(0, prompt?.maxTokens || 10);
      setSelectedTokens(validTokens);
      setHasInitialized(true);
      return;
    }

    // Priority 2: SelectNFTs will handle preselection
    if (!isLoadingUrlTokens && !hasUrlParams) {
      setHasInitialized(true);
    }
  }, [
    hasUrlParams,
    urlTokens,
    isLoadingUrlTokens,
    hasInitialized,
    prompt?.maxTokens,
  ]);

  // Auto-navigate to processing when generation succeeds
  useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      navigate({
        to: '/content/$promptId/processing/$executionId',
        params: {
          promptId,
          executionId: generateMutation.data.execution_id,
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

  // Auto-update URL when tokens change
  const handleTokensChange = useCallback(
    (tokens: Token[]) => {
      setSelectedTokens(tokens);
      setIsManuallyModified(true);

      const currentSearch = search;

      if (tokens.length === 0) {
        // Clear all nft params (0-based indexing)
        const clearedParams = Array.from({ length: 10 }, (_, i) => i).reduce(
          (acc, i) => ({
            ...acc,
            [`nft_${i}_chain`]: undefined,
            [`nft_${i}_address`]: undefined,
            [`nft_${i}_id`]: undefined,
          }),
          {} as Partial<z.infer<typeof nftParamsSchema>>
        );
        navigate({
          to: '.',
          search: { ...currentSearch, ...clearedParams },
          replace: true,
        });
      } else {
        const nftParams = encodeNFTsToParams(tokens);
        navigate({
          to: '.',
          search: { ...currentSearch, ...nftParams },
          replace: true,
        });
      }
    },
    [navigate, search]
  );

  const handleTokensSelected = (tokens: Token[]) => {
    if (!prompt || tokens.length === 0) {
      alert('Please select an NFT to continue');
      return;
    }

    // Generate content using the selected NFT(s)
    generateMutation.mutate({
      promptId: promptId,
      type: getContentType(prompt.type || 'images'),
      inputs: tokens.map(token => ({
        prompt_id: promptId,
        chain: token.contract.chain,
        contract_address: token.contract.address,
        token_id: token.id,
      })),
    });
  };

  if (isLoadingPrompt || (hasUrlParams && isLoadingUrlTokens)) {
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
    <ProtectedRoute>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl p-6">
            <p className="text-tg-hint mb-6 text-center">
              Choose a Character to personalize your {prompt.type}
            </p>

            <SelectNFTs
              minTokens={prompt.minTokens || 1}
              maxTokens={prompt.maxTokens || 1}
              collections={collections}
              onTokensSelected={() => {}}
              onTokensChange={handleTokensChange}
              initialTokens={selectedTokens}
              heading="Select Your Character"
              contentType={getContentType(prompt.type || 'images')}
            />
          </div>
        </div>

        {/* Bottom Button */}
        <TelegramDualButtons
          mainButton={{
            text: generateMutation.isPending ? 'Generating...' : 'Generate',
            onClick: () => handleTokensSelected(selectedTokens),
            disabled: selectedTokens.length === 0,
            loading: generateMutation.isPending,
            visible: true,
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
