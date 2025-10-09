import { useStickerPack, type PricingTier } from '@/hooks/useStickerPacks';

interface TierSelectorProps {
  stickerPackId: string | number;
  selectedTier: 'basic' | 'gold' | 'legendary';
  onTierSelect: (tier: 'basic' | 'gold' | 'legendary') => void;
  disabled?: boolean;
}

const tierDisplayNames = {
  basic: 'Basic',
  gold: 'Gold',
  legendary: 'Platinum',
};

function TierCard({
  tier,
  displayName,
  isSelected,
  isAvailable,
  onClick,
  disabled,
}: {
  tier: PricingTier;
  displayName: string;
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const isSoldOut =
    tier.supply !== undefined &&
    tier.sold_supply !== undefined &&
    tier.sold_supply >= tier.supply;

  // Color schemes for each tier
  const getTierColors = (tierKey: string, isSelected: boolean) => {
    const baseColors = {
      basic: isSelected
        ? 'border-slate-300 text-slate-900 shadow-sm bg-slate-200/40'
        : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:shadow-sm',
      gold: isSelected
        ? 'border-amber-300  text-amber-900 shadow-sm shadow-amber-200 bg-amber-200/40'
        : 'border-amber-200 hover:border-amber-300 bg-gradient-to-r from-amber-25 to-yellow-25 text-amber-700 hover:shadow-sm',
      legendary: isSelected
        ? 'border-violet-300 text-violet-900 shadow-sm shadow-violet-200 bg-violet-200/40'
        : 'border-violet-200 hover:border-violet-300 bg-gradient-to-r from-violet-25 to-purple-25 text-violet-700 hover:shadow-sm',
    };
    return baseColors[tierKey as keyof typeof baseColors] || baseColors.basic;
  };

  const tierKey =
    Object.keys(tierDisplayNames).find(
      key =>
        tierDisplayNames[key as keyof typeof tierDisplayNames] === displayName
    ) || 'basic';

  // Get price color based on tier
  const getPriceColor = (tierKey: string) => {
    const colors = {
      basic: 'text-tg-text',
      gold: 'text-amber-800',
      legendary: 'text-violet-800',
    };
    return colors[tierKey as keyof typeof colors] || colors.basic;
  };

  return (
    <div
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${getTierColors(tierKey, isSelected)} ${
        !isAvailable || isSoldOut || disabled ? 'opacity-50' : ''
      } ${isSelected ? 'scale-[1.04] ring-2 ring-offset-2' : 'hover:scale-[1.01]'}`}
      onClick={!disabled && isAvailable && !isSoldOut ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Tier Icon */}
          <div
            className={`h-2 w-2 rounded-full ${
              tierKey === 'basic'
                ? 'bg-slate-400'
                : tierKey === 'gold'
                  ? 'bg-amber-400'
                  : 'bg-violet-400'
            }`}
          ></div>
          <h3 className="text-base font-semibold">{displayName}</h3>
        </div>
        <div className={`text-tg-text text-lg font-semibold`}>
          {tier.formatted_price || 'Free'}
        </div>
      </div>
    </div>
  );
}

export function TierSelector({
  stickerPackId,
  selectedTier,
  onTierSelect,
  disabled,
}: TierSelectorProps) {
  const { data: stickerPack, isLoading, error } = useStickerPack(stickerPackId);

  // Debug logging
  console.log('TierSelector Debug:', {
    stickerPackId,
    isLoading,
    error: error?.message,
    stickerPack: stickerPack ? 'loaded' : 'null',
    pricing: stickerPack?.pricing,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-lg border p-4">
            <div className="mb-2 h-4 rounded bg-gray-200"></div>
            <div className="mb-3 h-6 rounded bg-gray-200"></div>
            <div className="mb-3 h-3 rounded bg-gray-200"></div>
            <div className="h-8 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stickerPack) {
    return (
      <div className="space-y-4">
        <h2 className="text-tg-text text-lg font-semibold">Select Tier</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Failed to load pricing information. Please try again.
          </p>
          {error && (
            <p className="mt-2 text-xs text-red-500">Error: {error.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Sticker Pack ID: {stickerPackId}
          </p>
        </div>
      </div>
    );
  }

  // Dynamically generate tiers based on what's available in the pricing data
  const availableTiers = Object.entries(stickerPack.pricing).filter(
    ([_, tierData]) =>
      // Include tier if it has pricing info or is available for free
      tierData.stripe_price_id !== null ||
      tierData.amount_cents !== null ||
      tierData.formatted_price !== null
  );

  const tiers: Array<{
    key: 'basic' | 'gold' | 'legendary';
    displayName: string;
    tier: PricingTier;
  }> = availableTiers.map(([tierKey, tierData]) => ({
    key: tierKey as 'basic' | 'gold' | 'legendary',
    displayName: tierDisplayNames[tierKey as keyof typeof tierDisplayNames],
    tier: tierData,
  }));

  // Adjust grid columns based on number of available tiers
  const gridCols =
    tiers.length === 1
      ? 'grid-cols-1'
      : tiers.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-3';

  return (
    <div className={`grid gap-3 ${gridCols}`}>
      {tiers.map(({ key, displayName, tier }) => {
        const isAvailable =
          tier.stripe_price_id !== null || tier.amount_cents === null;

        return (
          <TierCard
            key={key}
            tier={tier}
            displayName={displayName}
            isSelected={selectedTier === key}
            isAvailable={isAvailable}
            onClick={() => onTierSelect(key)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
