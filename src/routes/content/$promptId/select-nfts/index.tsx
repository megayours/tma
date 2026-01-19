import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { nftParamsSchema } from '@/utils/nftUrlSchema';
import { NFTSelectionPageUI } from '@/components/NFT/flows';
import { useNFTSelection } from '@/hooks/useNFTSelection';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { useNFTShareUrl } from '@/hooks/useNFTShareUrl';
import { canShareMessage, shareTelegramMessage } from '@/utils/telegramShare';
import type { Token } from '@/types/response';

export const Route = createFileRoute('/content/$promptId/select-nfts/')({
  validateSearch: nftParamsSchema,
  component: SelectNFTsPage,
});

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
  const { selectedCommunity } = useSelectCommunity();

  const { data: prompt, isLoading: isLoadingPrompt } = useGetPrompt(
    promptId,
    session
  );
  const { data: collections } = useGetSupportedCollections();
  const generateMutation = useGenerateContentMutation(session);

  // Use the simplified NFT selection hook
  const selection = useNFTSelection({
    minTokens: prompt?.minTokens || 1,
    maxTokens: prompt?.maxTokens || 1,
    urlParams: search,
  });

  // Filter out undefined tokens for generation
  const definedTokens = selection.selectedTokens.filter((t): t is Token => t !== undefined);

  // Build share URL with current selection (preserve sparse array for correct indices)
  const shareUrl = useNFTShareUrl({
    communityId: selectedCommunity?.id,
    tokens: selection.selectedTokens,
    tokenUsersByIndex: selection.tokenUsersByIndex,
    tokenUsernamesByIndex: selection.tokenUsernamesByIndex,
  });

  const handleGenerate = () => {
    if (!prompt || !selection.canGenerate) {
      alert('Please select an NFT to continue');
      return;
    }

    generateMutation.mutate({
      promptId: promptId,
      type: getContentType(prompt.type || 'images'),
      inputs: definedTokens.map(token => ({
        prompt_id: promptId,
        chain: token.contract.chain,
        contract_address: token.contract.address,
        token_id: token.id,
      })),
      notify: selection.notifyUserIds,
    });
  };

  // Build button configs
  const showGenerateButton = selection.showSummary && !selection.hasEmptySlots;

  const mainButton = {
    text: showGenerateButton
      ? generateMutation.isPending
        ? 'Generating...'
        : 'Generate'
      : 'Next',
    onClick: showGenerateButton ? handleGenerate : selection.handleNext,
    disabled: showGenerateButton ? !selection.canGenerate : !selection.canGoNext,
    loading: generateMutation.isPending,
    visible: true,
  };

  // Share button (only show on summary with partial selection)
  const shouldShowShareButton =
    selection.showSummary &&
    definedTokens.length > 0 &&
    selection.hasEmptySlots &&
    canShareMessage();

  const secondaryButton = shouldShowShareButton
    ? {
        text: 'Create with a friend',
        onClick: () => shareTelegramMessage(shareUrl, 'Create content with me!'),
        visible: true,
      }
    : undefined;

  // Navigate on successful generation
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

  // Show error on generation failure
  useEffect(() => {
    if (generateMutation.isError && generateMutation.error) {
      console.error('Generation failed:', generateMutation.error);
      alert(`Generation failed: ${generateMutation.error.message}`);
    }
  }, [generateMutation.isError, generateMutation.error]);

  if (isLoadingPrompt || selection.isLoading) {
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
      <div className="flex h-screen flex-col">
        <NFTSelectionPageUI
          maxTokens={prompt.maxTokens || 1}
          collections={collections}
          selectionState={selection}
        />

        <TelegramDualButtons
          mainButton={mainButton}
          secondaryButton={secondaryButton}
        />
      </div>
    </ProtectedRoute>
  );
}
