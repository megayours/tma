import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TierSelector } from '@/components/StickerPack/TierSelector';
import { TelegramMainButton } from '../../../../components/TelegramMainButton';
import { z } from 'zod';
import { useState } from 'react';
import { useStickerPack } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';

const selectTierSearchSchema = z.object({
  nft: z.string().optional(),
});

export const Route = createFileRoute(
  '/sticker-packs/$stickerPackId/select-tier/'
)({
  validateSearch: selectTierSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();

  // Fetch sticker pack data
  const { data: stickerPack, isLoading: isLoadingStickerPack } = useStickerPack(stickerPackId, session);

  // Local state for tier selection
  const [selectedTier, setSelectedTier] = useState<'basic' | 'gold' | 'legendary'>('basic');

  const handleReview = () => {
    if (!search.nft) {
      alert('No NFT selected. Please go back and select an NFT.');
      return;
    }

    navigate({
      to: '/sticker-packs/$stickerPackId/review',
      params: { stickerPackId },
      search: {
        nft: search.nft,
        tier: selectedTier,
      },
    });
  };

  if (isLoadingStickerPack || !stickerPack) {
    return <SpinnerFullPage text="Loading..." />;
  }

  const hasPaidTiers =
    stickerPack.pricing.basic.amount_cents !== null ||
    stickerPack.pricing.gold.amount_cents !== null ||
    stickerPack.pricing.legendary.amount_cents !== null;

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex flex-col gap-4">
        {/* Tier Selection */}
        {hasPaidTiers ? (
          <>
            <div className="bg-tg-secondary-bg rounded-lg p-6">
              <div className="text-center">
                <h2 className="text-tg-text mb-1 text-xl font-bold">
                  Select Tier
                </h2>
                <p className="text-tg-subtitle-text text-sm">
                  Choose your preferred quality level
                </p>
              </div>
            </div>
            <TierSelector
              stickerPackId={stickerPackId}
              selectedTier={selectedTier}
              onTierSelect={setSelectedTier}
              disabled={false}
            />
          </>
        ) : (
          <div className="bg-tg-secondary-bg rounded-lg p-6">
            <h2 className="mb-4 text-lg font-semibold">Free Tier</h2>
            <p className="text-tg-hint text-sm">
              This sticker pack is available for free! Click continue to review
              your selection.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <TelegramMainButton
          text="Review"
          onClick={handleReview}
          disabled={false}
          visible={true}
        />
      </div>
    </div>
  );
}
