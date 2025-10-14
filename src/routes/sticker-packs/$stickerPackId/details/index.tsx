import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { StickerPackContentList } from '@/components/StickerPack/StickerPackContentList';
import { StickerCollectionHeader } from '@/components/StickerPack/StickerCollectionHeader';
import { TelegramMainButton } from '@/components/TelegramMainButton';

export const Route = createFileRoute('/sticker-packs/$stickerPackId/details/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  const {
    data: stickerPack,
    isLoading,
    error,
  } = useStickerPack(stickerPackId, session);

  const handleGetStarted = () => {
    navigate({
      to: '/sticker-packs/$stickerPackId/select-nfts',
      params: { stickerPackId },
    });
  };

  // Calculate the lowest price from all tiers
  const getButtonText = () => {
    if (!stickerPack) return 'Get Stickers with your NFT';

    const prices = [
      stickerPack.pricing.basic,
      stickerPack.pricing.gold,
      stickerPack.pricing.legendary,
    ]
      .filter(tier => tier.amount_cents !== null && tier.formatted_price !== null)
      .map(tier => ({
        cents: tier.amount_cents!,
        formatted: tier.formatted_price!,
      }));

    if (prices.length === 0) {
      return 'Get Stickers with your NFT';
    }

    // Find the lowest price
    const lowestPrice = prices.reduce((min, current) =>
      current.cents < min.cents ? current : min
    );

    return `Starting from ${lowestPrice.formatted}`;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading sticker pack...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg text-red-600">
            Error loading sticker pack: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!stickerPack) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Sticker pack not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-2">
      {/* <StepProgressIndicator currentStep={0} /> */}

      <div className="">
        <StickerCollectionHeader stickerPack={stickerPack} />
      </div>

      <div className="space-y-4">
        {/* Pack Header */}
        <div className="bg-tg-secondary-bg rounded-lg p-6">
          <h1 className="text-tg-text mb-2 text-2xl font-bold">
            {stickerPack.name}
          </h1>
          {stickerPack.description && (
            <p className="text-tg-hint text-sm">{stickerPack.description}</p>
          )}
        </div>

        {/* Sticker Pack Content List */}
        {stickerPack.items && stickerPack.items.length > 0 && (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <h2 className="mb-4 text-lg font-semibold">All Stickers</h2>
            <StickerPackContentList
              items={stickerPack.items}
              packName={stickerPack.name}
            />
          </div>
        )}

        {/* Get Started Button */}
        <TelegramMainButton
          text={getButtonText()}
          onClick={handleGetStarted}
          visible={true}
        />
      </div>
    </div>
  );
}
