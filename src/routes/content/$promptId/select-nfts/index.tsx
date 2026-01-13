import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { useGenerateContentMutation } from '@/hooks/useContents';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { buildShareUrl } from '@/utils/shareUrl';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { nftParamsSchema } from '@/utils/nftUrlSchema';
import { NFTSelectionPageUI } from '@/components/NFT/flows';
import { useNFTSelectionPage } from '@/hooks/useNFTSelectionPage';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { shareTelegramMessage, canShareMessage } from '@/utils/telegramShare';

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

  // Use the NFT selection hook
  const selectionState = useNFTSelectionPage({
    minTokens: prompt?.minTokens || 1,
    maxTokens: prompt?.maxTokens || 1,
    collections,
    urlParams: search,
  });

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

  const handleGenerate = () => {
    if (!prompt || !selectionState.canGenerate) {
      alert('Please select an NFT to continue');
      return;
    }

    generateMutation.mutate({
      promptId: promptId,
      type: getContentType(prompt.type || 'images'),
      inputs: selectionState.selectedTokens.map(token => ({
        prompt_id: promptId,
        chain: token.contract.chain,
        contract_address: token.contract.address,
        token_id: token.id,
      })),
    });
  };

  // Build share URL
  const shareUrl = useMemo(() => {
    const botUrl = import.meta.env.VITE_PUBLIC_BOT_URL || '';
    const currentPath = window.location.pathname + window.location.search;
    return buildShareUrl(botUrl, currentPath, selectedCommunity?.id);
  }, [selectedCommunity?.id]);

  const handleShareWithFriend = () => {
    shareTelegramMessage(shareUrl, 'Create content with me!');
  };

  if (isLoadingPrompt || selectionState.isLoading) {
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

  // Compute button configs outside of JSX
  const showGenerateButton =
    selectionState.showSummary && !selectionState.hasEmptySlots;

  const mainButtonText = showGenerateButton
    ? generateMutation.isPending
      ? 'Generating...'
      : 'Generate'
    : 'Next';

  const mainButtonOnClick = showGenerateButton
    ? handleGenerate
    : selectionState.handleNext;

  const mainButtonDisabled = showGenerateButton
    ? !selectionState.canGenerate
    : !selectionState.canGoNext;

  const mainButtonConfig = {
    text: mainButtonText,
    onClick: mainButtonOnClick,
    disabled: mainButtonDisabled,
    loading: generateMutation.isPending,
    visible: true,
  };

  // Determine secondary button config
  let secondaryButtonConfig = undefined;

  console.log('MIN TOKENS:', prompt.minTokens, 'MAX TOKENS:', prompt.maxTokens);
  console.log(
    'CAN GO NEXT:',
    selectionState.canGoNext,
    'Has Empty Slots:',
    selectionState.hasEmptySlots,
    'selectionState.selectedTokens.length:',
    selectionState.selectedTokens.length,
    'CREATE WITH A FRIENT SHOWN',
    selectionState.selectedTokens.length > 0 && selectionState.canGoNext
  );

  // Show "Create with a friend" when:
  // - On summary screen (showSummary)
  // - At least 1 token selected
  // - Not all tokens selected (hasEmptySlots)
  // - Share functionality is available
  const shouldShowShareButton =
    selectionState.selectedTokens.length > 0 &&
    selectionState.hasEmptySlots &&
    canShareMessage();

  console.log('SHOULD SHOW SHARE BUTTON:', shouldShowShareButton);

  if (shouldShowShareButton) {
    secondaryButtonConfig = {
      text: 'Create with a friend',
      onClick: handleShareWithFriend,
      visible: true,
    };
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <NFTSelectionPageUI
          maxTokens={prompt.maxTokens || 1}
          collections={collections}
          selectionState={selectionState}
        />

        <TelegramDualButtons
          mainButton={mainButtonConfig}
          secondaryButton={secondaryButtonConfig}
        />
      </div>
    </ProtectedRoute>
  );
}
