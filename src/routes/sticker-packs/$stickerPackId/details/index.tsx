import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { StickerPackContentList } from '@/components/StickerPack/StickerPackContentList';
import { StickerCollectionHeader } from '@/components/StickerPack/StickerCollectionHeader';
import { TelegramMainButton } from '@/components/TelegramMainButton';
import { SpinnerFullPage } from '@/components/ui';
import { Banner, Divider } from '@telegram-apps/telegram-ui';
import { Fragment } from 'react/jsx-runtime';

export const Route = createFileRoute('/sticker-packs/$stickerPackId/details/')({
  component: RouteComponent,
});

function getTimeUntilExpiration(expiresAt: number): string {
  const now = Date.now();
  const expirationDate = expiresAt * 1000; // Convert to milliseconds
  const diffMs = expirationDate - now;

  if (diffMs <= 0) {
    return 'expired';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else {
    return `${diffMinutes}min`;
  }
}

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
      .filter(
        tier => tier.amount_cents !== null && tier.formatted_price !== null
      )
      .map(tier => ({
        cents: tier.amount_cents!,
        formatted: tier.formatted_price!,
      }));

    if (prices.length === 0) {
      return 'Get Stickers with your PFP';
    }

    // Find the lowest price
    const lowestPrice = prices.reduce((min, current) =>
      current.cents < min.cents ? current : min
    );

    return `Starting from ${lowestPrice.formatted}`;
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading sticker pack..." />;
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
        {/* Pack Header */}
        <div className="rounded-lg">
          <div className="">
            <StickerCollectionHeader
              stickerPack={stickerPack}
              endDate={
                stickerPack.expiresAt
                  ? getTimeUntilExpiration(stickerPack.expiresAt)
                  : undefined
              }
            />
          </div>
        </div>
        {stickerPack.description && (
          <div className="p-6">
            <p className="text-tg-hint text-sm">{stickerPack.description}</p>
          </div>
        )}

        <Divider />

        {/* Sticker Pack Content List */}
        {stickerPack.items && stickerPack.items.length > 0 && (
          <div>
            <Banner
              header={
                <h2 className="text-tg-text text-lg">Included in this pack</h2>
              }
              description={
                <div>
                  <p className="text-xs">
                    Example of stickers included in this pack from other users.
                  </p>
                  <p className="text-tg-accent-text text-xs">
                    You will receive {stickerPack.item_count} personalized
                    stickers.
                  </p>
                </div>
              }
              style={{
                backgroundColor: 'var(--tg-secondary-bg)',
              }}
            >
              <Fragment>
                <StickerPackContentList
                  items={stickerPack.items}
                  packName={stickerPack.name}
                />
              </Fragment>
            </Banner>
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
