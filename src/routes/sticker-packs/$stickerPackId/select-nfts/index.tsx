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
import { useNFTSelectionPage } from '@/hooks/useNFTSelectionPage';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { SpinnerFullPage } from '@/components/ui';
import { getShareSelectionButtonConfig } from '@/utils/nftSelectionShare';
import { useNFTShareUrl } from '@/hooks/useNFTShareUrl';
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

  // Use the NFT selection hook
  const selectionState = useNFTSelectionPage({
    minTokens: stickerPack?.min_tokens_required || 1,
    maxTokens: stickerPack?.max_tokens_required || 1,
    collections: filteredCollections,
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

  const handleGenerate = () => {
    if (!stickerPack || !selectionState.canGenerate) {
      alert(
        `Please select at least ${stickerPack?.min_tokens_required} NFT${stickerPack?.min_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    const encodedNFT = encodeNFT(selectionState.selectedTokens[0]);

    const hasPaidTiers =
      stickerPack.pricing.basic.amount_cents !== null ||
      stickerPack.pricing.gold.amount_cents !== null ||
      stickerPack.pricing.legendary.amount_cents !== null;

    if (!hasPaidTiers) {
      lastSelectedTokensRef.current = selectionState.selectedTokens;
      purchaseStickerPack(
        parseInt(stickerPackId),
        selectionState.selectedTokens,
        'basic',
        selectionState.notify || []
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

  // Build share URL with notify IDs
  const shareUrl = useNFTShareUrl({
    session,
    notify: selectionState.notify,
    communityId,
    tokens: selectionState.selectedTokens,
  });

  if (isLoadingStickerPack || !stickerPack || selectionState.isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  // Compute button configs outside of JSX
  const showGenerateButton =
    selectionState.showSummary && !selectionState.hasEmptySlots;

  const mainButtonText = showGenerateButton ? getButtonText() : 'Next';
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
    loading: isPending,
    visible: true,
  };

  // Determine secondary button config
  let secondaryButtonConfig = undefined;

  const shareButtonConfig = getShareSelectionButtonConfig({
    selectionState,
    shareUrl,
    shareText: 'Create stickers with me!',
  });

  if (shareButtonConfig) {
    secondaryButtonConfig = shareButtonConfig;
  } else if (!selectionState.showSummary && !selectionState.isRequired) {
    secondaryButtonConfig = {
      text: 'Skip',
      onClick: selectionState.handleSkip,
      visible: true,
    };
  }

  console.log('Sticker pack , stickerPack);', stickerPack);
  console.log('NOTIFY IDs:', selectionState.notify);

  return (
    <div className="flex h-screen flex-col">
      <NFTSelectionPageUI
        maxTokens={stickerPack.max_tokens_required || 1}
        collections={filteredCollections}
        selectionState={selectionState}
      />

      <TelegramDualButtons
        mainButton={mainButtonConfig}
        secondaryButton={secondaryButtonConfig}
      />
    </div>
  );
}
