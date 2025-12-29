import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback, useEffect } from 'react';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import { encodeNFT } from '@/utils/nftEncoding';
import { useWebAppStartParam } from '@/hooks/useWebAppStartParam';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { usePurchase } from '@/hooks/usePurchase';
import { SelectNFTs } from '@/components/NFT';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { useNFTsFromUrlParams } from '@/hooks/useNFTsFromUrlParams';
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

  // State management
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isManuallyModified, setIsManuallyModified] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch sticker pack data
  const { data: stickerPack, isLoading: isLoadingStickerPack } = useStickerPack(
    stickerPackId,
    session
  );

  // Purchase hook for free packs (to skip review)
  const { purchaseStickerPack, isPending } = usePurchase(session, {
    onSuccess: data => {
      // Free tier - go directly to processing page
      navigate({
        to: `/sticker-packs/${stickerPackId}/processing/${data.execution_id}`,
        search: {
          nft: encodeNFT(selectedTokens[0]),
          tier: 'basic',
        },
      });
    },
    onError: error => {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    },
  });

  const { data: collections } = useGetSupportedCollections();
  const { collections: communityCollections } = useWebAppStartParam() || {
    collections: [],
  };

  if (stickerPack?.supportedCollections.length == 0) {
    stickerPack.supportedCollections = collections || [];
  }

  // get the overlap between communityCollections and collections
  // if communityCollections is empty, use all collections
  const filteredCollections =
    !communityCollections || communityCollections.length === 0
      ? stickerPack?.supportedCollections || []
      : stickerPack?.supportedCollections?.filter(collection =>
          communityCollections.some(
            c =>
              c.address === collection.address && c.chain === collection.chain
          )
        ) || [];

  // Fetch NFTs from URL params
  const {
    tokens: urlTokens,
    isLoading: isLoadingUrlTokens,
    hasUrlParams,
  } = useNFTsFromUrlParams({
    urlParams: search,
    enabled: !isManuallyModified && !hasInitialized,
  });

  // Initialize tokens from URL params
  useEffect(() => {
    if (hasInitialized) return;

    // Priority 1: URL params
    if (hasUrlParams && urlTokens.length > 0) {
      const validTokens = urlTokens.slice(
        0,
        stickerPack?.max_tokens_required || 10
      );
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
    stickerPack?.max_tokens_required,
  ]);

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

  const handleContinue = () => {
    if (!selectedTokens || selectedTokens.length === 0) {
      alert('Please select at least one NFT.');
      return;
    }

    if (selectedTokens.length < (stickerPack?.min_tokens_required || 1)) {
      alert(
        `Please select at least ${stickerPack?.min_tokens_required} NFT${stickerPack?.min_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    if (selectedTokens.length > (stickerPack?.max_tokens_required || 1)) {
      alert(
        `You can select a maximum of ${stickerPack?.max_tokens_required} NFT${stickerPack?.max_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    // Encode the selected NFT for URL
    const encodedNFT = encodeNFT(selectedTokens[0]);

    // Check if there are any paid tiers
    const hasPaidTiers =
      stickerPack?.pricing.basic.amount_cents !== null ||
      stickerPack?.pricing.gold.amount_cents !== null ||
      stickerPack?.pricing.legendary.amount_cents !== null;

    // Skip tier selection and review if all tiers are free
    if (!hasPaidTiers) {
      // For free packs, call purchase API directly
      purchaseStickerPack(parseInt(stickerPackId), selectedTokens, 'basic');
    } else {
      // For paid packs, continue to tier selection
      navigate({
        to: '/sticker-packs/$stickerPackId/select-tier',
        params: { stickerPackId },
        search: {
          nft: encodedNFT,
        },
      });
    }
  };

  if (
    isLoadingStickerPack ||
    !stickerPack ||
    (hasUrlParams && isLoadingUrlTokens)
  ) {
    // Skeleton loading state
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="space-y-4">
          <div className="rounded-lg p-2">
            {/* Selected NFT Skeleton */}
            <div className="mb-8">
              {/* Heading skeleton */}
              <div className="mb-6 flex justify-center">
                <div className="bg-tg-secondary h-6 w-32 animate-pulse rounded" />
              </div>

              {/* Circular NFT image skeleton */}
              <div className="flex justify-center py-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-tg-secondary h-52 w-52 animate-pulse rounded-full" />

                  {/* NFT info skeleton */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-tg-secondary h-4 w-32 animate-pulse rounded" />
                    <div className="bg-tg-secondary h-3 w-24 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Selection heading skeleton */}
            <div className="mb-4">
              <div className="bg-tg-secondary h-6 w-40 animate-pulse rounded" />
            </div>

            {/* Favorites section skeleton */}
            <div className="border-tg-section-separator border-t pt-4">
              <div className="mb-4 space-y-4">
                {/* Tabs skeleton */}
                <div className="flex justify-center gap-2">
                  <div className="bg-tg-secondary h-8 w-24 animate-pulse rounded" />
                  <div className="bg-tg-secondary h-8 w-28 animate-pulse rounded" />
                </div>

                {/* Favorites list skeleton */}
                <div className="flex gap-2 overflow-x-auto p-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex-shrink-0">
                      <div className="flex flex-col items-center gap-2">
                        <div className="bg-tg-secondary h-20 w-20 animate-pulse rounded-full" />
                        <div className="bg-tg-secondary h-3 w-16 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canContinue =
    selectedTokens &&
    selectedTokens.length >= (stickerPack.min_tokens_required || 1) &&
    selectedTokens.length <= (stickerPack.max_tokens_required || 1);

  // Check if the pack is free to determine button text
  const hasPaidTiers =
    stickerPack.pricing.basic.amount_cents !== null ||
    stickerPack.pricing.gold.amount_cents !== null ||
    stickerPack.pricing.legendary.amount_cents !== null;

  const buttonText = hasPaidTiers ? 'Proceed' : 'Generate';

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="">
        <SelectNFTs
          minTokens={stickerPack.min_tokens_required || 1}
          maxTokens={stickerPack.max_tokens_required || 1}
          collections={filteredCollections}
          onTokensSelected={() => {}}
          onTokensChange={handleTokensChange}
          initialTokens={selectedTokens}
          heading="Select Your Character"
        />

        {/* Navigation Buttons */}
        <TelegramDualButtons
          mainButton={{
            text: buttonText,
            onClick: handleContinue,
            disabled: !canContinue,
            loading: isPending,
            visible: true,
          }}
        />
      </div>
    </div>
  );
}
