import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPackPurchase } from '@/contexts/StickerPackPurchaseContext';
import { usePurchase } from '@/hooks/usePurchase';
import { StepProgressIndicator } from '@/components/StickerPack/StepProgressIndicator';

export const Route = createFileRoute('/sticker-packs/$stickerPackId/review/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { stickerPack, selectedNFTs, selectedTier, setExecutionId } =
    useStickerPackPurchase();

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
            selectedTier,
            selectedTokens: encodeURIComponent(JSON.stringify(selectedNFTs)),
          },
        });
      } else {
        // Free tier or direct processing - go to processing page
        setExecutionId(data.execution_id);
        navigate({
          to: '/sticker-packs/$stickerPackId/processing',
          params: { stickerPackId },
        });
      }
    },
    onError: error => {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    },
  });

  const handleBack = () => {
    navigate({
      to: '/sticker-packs/$stickerPackId/select-tier',
      params: { stickerPackId },
    });
  };

  const handleConfirm = () => {
    if (!selectedNFTs || selectedNFTs.length === 0) {
      alert('No NFTs selected. Please go back and select NFTs.');
      return;
    }

    purchaseStickerPack(parseInt(stickerPackId), selectedNFTs, selectedTier);
  };

  if (!stickerPack) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  const tierPricing = stickerPack.pricing[selectedTier];
  const isFree = tierPricing.amount_cents === null;

  const hasPaidTiers =
    stickerPack.pricing.basic.amount_cents !== null ||
    stickerPack.pricing.gold.amount_cents !== null ||
    stickerPack.pricing.legendary.amount_cents !== null;

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

          {/* Selected NFTs */}
          <div className="mb-4">
            <h3 className="text-tg-hint mb-2 text-sm font-semibold">
              Selected NFTs
            </h3>
            <div className="space-y-2">
              {selectedNFTs.map((nft, index) => (
                <div
                  key={`${nft.contract.address}-${nft.id}`}
                  className="bg-tg-bg rounded p-2 text-sm"
                >
                  <div className="text-tg-text font-semibold">
                    {nft.name || `NFT #${index + 1}`}
                  </div>
                  <div className="text-tg-hint text-xs">
                    {nft.contract.name} #{nft.id}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Tier */}
          <div className="mb-4">
            <h3 className="text-tg-hint mb-2 text-sm font-semibold">Tier</h3>
            <p className="text-tg-text capitalize">{selectedTier}</p>
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

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? 'Processing...'
              : isFree
                ? 'Confirm & Generate'
                : 'Confirm & Purchase'}
          </button>
        </div>
      </div>
    </div>
  );
}
