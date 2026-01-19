import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useEffect, useRef } from 'react';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import { encodeNFT } from '@/utils/nftEncoding';
import { useWebAppStartParam } from '@/hooks/useWebAppStartParam';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { usePurchase } from '@/hooks/usePurchase';
import { nftParamsSchema } from '@/utils/nftUrlSchema';
import { NFTSelectionPageUI } from '@/components/NFT/flows';
import { useNFTSelection } from '@/hooks/useNFTSelection';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { SpinnerFullPage } from '@/components/ui';
import { useNFTShareUrl } from '@/hooks/useNFTShareUrl';
import { canShareMessage, shareTelegramMessage } from '@/utils/telegramShare';
import type { Token } from '@/types/response';

export const Route = createFileRoute(
  '/sticker-packs/$stickerPackId/select-nfts/'
)({
  validateSearch: nftParamsSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const search = Route.useSearch();

  const { data: stickerPack, isLoading: isLoadingStickerPack } = useStickerPack(
    stickerPackId,
    session
  );

  const {
    purchaseStickerPack,
    isPending,
    data: purchaseData,
  } = usePurchase(session, {
    onError: error => {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    },
  });

  const { data: collections } = useGetSupportedCollections();
  const webAppParams = useWebAppStartParam();
  const communityCollections = webAppParams?.collections ?? [];
  const communityId = webAppParams?.communityId;

  const filteredCollections = useMemo(() => {
    const packCollections =
      stickerPack?.supportedCollections?.length === 0
        ? collections || []
        : stickerPack?.supportedCollections || [];

    if (!communityCollections || communityCollections.length === 0) {
      return packCollections;
    }

    return packCollections.filter(collection =>
      communityCollections.some(
        c => c.address === collection.address && c.chain === collection.chain
      )
    );
  }, [stickerPack?.supportedCollections, collections, communityCollections]);

  // Use the simplified NFT selection hook
  const selection = useNFTSelection({
    minTokens: stickerPack?.min_tokens_required || 1,
    maxTokens: stickerPack?.max_tokens_required || 1,
    urlParams: search,
  });

  // Store the selected tokens for navigation after purchase
  const lastSelectedTokensRef = useRef<Token[]>([]);

  // Navigate after successful purchase
  useEffect(() => {
    if (purchaseData && lastSelectedTokensRef.current.length > 0) {
      const encodedNFT = encodeNFT(lastSelectedTokensRef.current[0]);
      navigate({
        to: `/sticker-packs/${stickerPackId}/processing/${purchaseData.execution_id}`,
        search: {
          nft: encodedNFT,
          tier: 'basic',
        },
      });
    }
  }, [purchaseData, stickerPackId, navigate]);


  // Filter out undefined tokens for purchase/generation
  const definedTokens = selection.selectedTokens.filter((t): t is Token => t !== undefined);

  const handleGenerate = () => {
    if (!stickerPack || !selection.canGenerate || definedTokens.length === 0) {
      alert(
        `Please select at least ${stickerPack?.min_tokens_required} NFT${stickerPack?.min_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    const encodedNFT = encodeNFT(definedTokens[0]);

    const hasPaidTiers =
      stickerPack.pricing.basic.amount_cents !== null ||
      stickerPack.pricing.gold.amount_cents !== null ||
      stickerPack.pricing.legendary.amount_cents !== null;

    if (!hasPaidTiers) {
      lastSelectedTokensRef.current = definedTokens;
      purchaseStickerPack(
        parseInt(stickerPackId),
        definedTokens,
        'basic',
        selection.notifyUserIds
      );
    } else {
      navigate({
        to: '/sticker-packs/$stickerPackId/select-tier',
        params: { stickerPackId },
        search: {
          nft: encodedNFT,
        },
      });
    }
  };

  const getButtonText = () => {
    if (!stickerPack) return 'Continue';

    const hasPaidTiers =
      stickerPack.pricing.basic.amount_cents !== null ||
      stickerPack.pricing.gold.amount_cents !== null ||
      stickerPack.pricing.legendary.amount_cents !== null;

    if (isPending) return 'Processing...';
    if (hasPaidTiers) return 'Continue';
    return 'Generate';
  };

  // Build share URL with slot user IDs (preserve sparse array for correct indices)
  const shareUrl = useNFTShareUrl({
    communityId,
    tokens: selection.selectedTokens,
    tokenUsersByIndex: selection.tokenUsersByIndex,
    tokenUsernamesByIndex: selection.tokenUsernamesByIndex,
  });

  if (isLoadingStickerPack || !stickerPack || selection.isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  // Compute button configs outside of JSX
  const showGenerateButton =
    selection.showSummary && !selection.hasEmptySlots;

  const mainButtonText = showGenerateButton ? getButtonText() : 'Next';
  const mainButtonOnClick = showGenerateButton
    ? handleGenerate
    : selection.handleNext;
  const mainButtonDisabled = showGenerateButton
    ? !selection.canGenerate
    : !selection.canGoNext;

  const mainButtonConfig = {
    text: mainButtonText,
    onClick: mainButtonOnClick,
    disabled: mainButtonDisabled,
    loading: isPending,
    visible: true,
  };

  // Determine secondary button config
  let secondaryButtonConfig = undefined;

  // Share button (only show on summary with partial selection)
  const shouldShowShareButton =
    selection.showSummary &&
    definedTokens.length > 0 &&
    selection.hasEmptySlots &&
    canShareMessage();

  if (shouldShowShareButton) {
    secondaryButtonConfig = {
      text: 'Create with a friend',
      onClick: () => shareTelegramMessage(shareUrl, 'Create stickers with me!'),
      visible: true,
    };
  } else if (!selection.showSummary && !selection.isRequired && selection.currentIndex !== null) {
    const currentIdx = selection.currentIndex;
    secondaryButtonConfig = {
      text: 'Skip',
      onClick: () => selection.handleSkip(currentIdx),
      visible: true,
    };
  }

  console.log('Sticker pack , stickerPack);', stickerPack);
  console.log(
    'TOKEN USERS:',
    selection.tokenUsersByIndex,
    'TOKEN USERNAMES:',
    selection.tokenUsernamesByIndex
  );

  return (
    <div className="flex h-screen flex-col">
      <NFTSelectionPageUI
        maxTokens={stickerPack.max_tokens_required || 1}
        collections={filteredCollections}
        selectionState={selection}
      />

      <TelegramDualButtons
        mainButton={mainButtonConfig}
        secondaryButton={secondaryButtonConfig}
      />
    </div>
  );
}
