import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import {
  useGetNFTByCollectionAndTokenId,
  useGetSupportedCollections,
} from '@/hooks/useCollections';
import { NFTSelector } from './NFTSelector';
import type { Token } from '@/types/response';
import { useSelectedNFTsSafe } from '../../../../contexts/SelectedNFTsContext';
import { encodeNFT } from '@/utils/nftEncoding';
import { useWebAppStartParam } from '@/hooks/useWebAppStartParam';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { usePurchase } from '@/hooks/usePurchase';

export const Route = createFileRoute(
  '/sticker-packs/$stickerPackId/select-nfts/'
)({
  component: RouteComponent,
});

// Selected NFT Display Component
function SelectedNFTDisplay({
  selectedNFTs,
  isSelectorOpen,
  onToggleSelector,
}: {
  selectedNFTs: Token[];
  isSelectorOpen: boolean;
  onToggleSelector: () => void;
}) {
  if (selectedNFTs.length === 0) return null;

  return (
    <div>
      <h2
        className={`text-tg-text text-center font-semibold transition-all duration-500 ${
          isSelectorOpen
            ? 'mb-0 h-0 overflow-hidden opacity-0'
            : 'mb-6 h-auto opacity-100'
        }`}
      >
        Selected Character
      </h2>
      <div
        className={`flex items-center justify-center transition-all duration-500`}
      >
        {selectedNFTs.map((nft, index) => (
          <div key="selected-nft" className="flex flex-col items-center">
            {/* NFT Image - Circular with Edit Icon */}
            <div
              className="relative cursor-pointer transition-all duration-500 ease-in-out"
              onClick={onToggleSelector}
            >
              {nft?.image && (
                <img
                  src={nft.image}
                  alt={nft?.name || `Character #${nft?.id || index}`}
                  className={`rounded-full object-cover transition-all duration-500 ease-in-out ${
                    isSelectorOpen ? 'h-24 w-24' : 'h-52 w-52'
                  }`}
                />
              )}

              {/* Edit Icon - Overlay */}
              <div
                className={`bg-tg-accent-text absolute rounded-full transition-all duration-500 ease-in-out hover:opacity-90 ${
                  isSelectorOpen
                    ? 'right-1 bottom-1 p-1.5'
                    : 'right-3 bottom-3 p-2.5'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`text-white transition-all duration-500 ease-in-out ${
                    isSelectorOpen ? 'h-3 w-3' : 'h-5 w-5'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>

            {/* NFT Info Below */}
            <div
              className={`text-tg-text text-center transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div
                className={`font-semibold transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? 'text-sm' : 'text-base'
                }`}
              >
                {nft?.name || `Character #${nft?.id || index}`}
              </div>
              <div
                className={`text-tg-hint transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? 'text-xs' : 'text-sm'
                }`}
              >
                {nft?.contract?.name || 'Unknown Collection'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();

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
          nft: encodeNFT(selectedNFTs[0]),
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
  const { selectedFavorite } = useSelectedNFTsSafe();
  const { collections: communityCollections } = useWebAppStartParam() || {
    collections: [],
  };

  if (stickerPack?.supportedCollections.length == 0) {
    stickerPack.supportedCollections = collections || [];
  }

  // Local state for selected NFTs
  const [selectedNFTs, setSelectedNFTs] = useState<Token[]>([]);

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

  // State for selector visibility
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

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

  // Pre-populate with selectedFavorite if available and nothing is selected yet
  useEffect(() => {
    if (selectedFavorite && selectedNFTs.length === 0) {
      setSelectedNFTs([selectedFavorite.token]);
    } else if (!selectedFavorite && defaultToken && selectedNFTs.length === 0) {
      setSelectedNFTs([defaultToken]);
    }
  }, [selectedFavorite, defaultToken, selectedNFTs.length]);

  // Open selector if no NFT selected, close if one is selected
  useEffect(() => {
    setIsSelectorOpen(selectedNFTs.length === 0);
  }, [selectedNFTs.length]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      // Replace the selected NFT (max 1 NFT allowed)
      setSelectedNFTs([token]);
      // Close selector after selection
      setIsSelectorOpen(false);
    },
    [setSelectedNFTs]
  );

  const toggleSelector = () => {
    setIsSelectorOpen(!isSelectorOpen);
  };

  const handleContinue = () => {
    if (!selectedNFTs || selectedNFTs.length === 0) {
      alert('Please select at least one NFT.');
      return;
    }

    if (selectedNFTs.length < (stickerPack?.min_tokens_required || 1)) {
      alert(
        `Please select at least ${stickerPack?.min_tokens_required} NFT${stickerPack?.min_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    if (selectedNFTs.length > (stickerPack?.max_tokens_required || 1)) {
      alert(
        `You can select a maximum of ${stickerPack?.max_tokens_required} NFT${stickerPack?.max_tokens_required !== 1 ? 's' : ''}.`
      );
      return;
    }

    // Encode the selected NFT for URL
    const encodedNFT = encodeNFT(selectedNFTs[0]);

    // Check if there are any paid tiers
    const hasPaidTiers =
      stickerPack?.pricing.basic.amount_cents !== null ||
      stickerPack?.pricing.gold.amount_cents !== null ||
      stickerPack?.pricing.legendary.amount_cents !== null;

    // Skip tier selection and review if all tiers are free
    if (!hasPaidTiers) {
      // For free packs, call purchase API directly
      purchaseStickerPack(parseInt(stickerPackId), selectedNFTs, 'basic');
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

  if (isLoadingStickerPack || !stickerPack) {
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
    selectedNFTs &&
    selectedNFTs.length >= (stickerPack.min_tokens_required || 1) &&
    selectedNFTs.length <= (stickerPack.max_tokens_required || 1);

  // Check if the pack is free to determine button text
  const hasPaidTiers =
    stickerPack.pricing.basic.amount_cents !== null ||
    stickerPack.pricing.gold.amount_cents !== null ||
    stickerPack.pricing.legendary.amount_cents !== null;

  const buttonText = hasPaidTiers ? 'Proceed' : 'Generate';

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="">
        {/* NFT Selection - Unified */}
        <div className="rounded-lg">
          {/* Display Selected NFT if available */}
          <SelectedNFTDisplay
            selectedNFTs={selectedNFTs}
            isSelectorOpen={isSelectorOpen}
            onToggleSelector={toggleSelector}
          />
          {/* NFT Selection - Collapsible */}
          {isSelectorOpen && (
            <div>
              <h2 className="text-lg font-semibold">
                {selectedNFTs.length === 0
                  ? 'Select Your Character'
                  : 'Change Character'}
              </h2>
              <NFTSelector
                collections={filteredCollections}
                onTokenSelect={handleTokenSelect}
                selectedNFT={selectedNFTs[0] || null}
                onCancel={() => setIsSelectorOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {isSelectorOpen && selectedNFTs.length > 0 ? (
          // Hide button when selector is open and an NFT is already selected
          <TelegramDualButtons
            mainButton={{
              text: buttonText,
              onClick: handleContinue,
              disabled: !canContinue || isSelectorOpen,
              loading: isPending,
              visible: false,
            }}
          />
        ) : (
          // Show button when selector is closed or no NFT selected
          <TelegramDualButtons
            mainButton={{
              text: buttonText,
              onClick: handleContinue,
              disabled: !canContinue || isSelectorOpen,
              loading: isPending,
              visible: true,
            }}
          />
        )}
      </div>
    </div>
  );
}
