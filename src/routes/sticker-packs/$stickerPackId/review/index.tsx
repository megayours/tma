import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { usePurchase } from '@/hooks/usePurchase';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { decodeNFT } from '@/utils/nftEncoding';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { SpinnerFullPage } from '@/components/ui';

const reviewSearchSchema = z.object({
  nft: z.string(),
  tier: z.enum(['basic', 'gold', 'legendary']),
});

export const Route = createFileRoute('/sticker-packs/$stickerPackId/review/')({
  validateSearch: reviewSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch sticker pack data
  const { data: stickerPack, isLoading: isLoadingStickerPack } = useStickerPack(
    stickerPackId,
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

  const { purchaseStickerPack, isPending } = usePurchase(session, {
    onSuccess: data => {
      // If payment is required, navigate to checkout page
      if (data.status === 'pending_payment' && data.checkout) {
        navigate({
          to: '/sticker-packs/$stickerPackId/checkout',
          params: { stickerPackId },
          search: {
            executionId: data.execution_id,
            clientSecret: data.checkout.client_secret,
            publishableKey: data.checkout.publishable_key,
            nft: search.nft,
            tier: search.tier,
          },
        });
      } else {
        // Free tier or direct processing - go to processing page
        navigate({
          to: `/sticker-packs/${stickerPackId}/processing/${data.execution_id}`,
          search: {
            nft: search.nft,
            tier: search.tier,
          },
        });
      }
    },
    onError: error => {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    },
  });

  const handleConfirm = () => {
    setIsLoading(true);
    if (!selectedToken) {
      alert('No NFT selected. Please go back and select an NFT.');
      return;
    }
    // set is loading
    purchaseStickerPack(parseInt(stickerPackId), [selectedToken], search.tier);
  };

  // Loading or error states
  if (isLoadingStickerPack || isLoadingNFT || !stickerPack) {
    return <SpinnerFullPage text="Loading..." />;
  }

  if (!nftData || !selectedToken) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-red-600">
            Invalid NFT data. Please go back and select an NFT.
          </div>
        </div>
      </div>
    );
  }

  const tierPricing = stickerPack.pricing[search.tier];
  const isFree = tierPricing.amount_cents === null;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="space-y-4">
        {/* Review Summary */}
        <div className="bg-tg-secondary-bg rounded-lg p-6">
          <h2 className="mb-4 text-lg font-semibold">Review Your Selection</h2>

          {/* Sticker Pack */}
          <div className="mb-4">
            <h3 className="text-tg-hint mb-2 text-sm font-semibold">
              Sticker Pack
            </h3>
            <p className="text-tg-text">{stickerPack.name}</p>
          </div>

          {/* Selected NFT */}
          <div className="mb-4">
            <h3 className="text-tg-hint mb-2 text-sm font-semibold">
              Selected NFT
            </h3>
            <div className="bg-tg-bg flex items-center gap-3 rounded p-2 text-sm">
              <img
                src={selectedToken.image || '/nfts/not-available.png'}
                alt={selectedToken.name || `NFT #${selectedToken.id}`}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="text-tg-text font-semibold">
                  {selectedToken.name || `NFT #${selectedToken.id}`}
                </div>
                <div className="text-tg-hint text-xs">
                  {selectedToken.contract.name} #{selectedToken.id}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Tier */}
          <div className="mb-4">
            <h3 className="text-tg-hint mb-2 text-sm font-semibold">Tier</h3>
            <p className="text-tg-text capitalize">{search.tier}</p>
          </div>

          {/* Price */}
          <div className="border-tg-hint/20 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Total</h3>
              <p className="text-xl font-bold">
                {isFree ? 'Free' : tierPricing.formatted_price}
              </p>
            </div>
          </div>
        </div>

        <TelegramDualButtons
          mainButton={{
            text: isFree ? 'Confirm & Generate' : 'Confirm & Purchase',
            onClick: handleConfirm,
            disabled: isPending,
            loading: isPending || isLoading,
            visible: true,
          }}
        />
      </div>
    </div>
  );
}
