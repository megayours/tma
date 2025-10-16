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

  // Format supply text
  const getSupplyText = () => {
    if (tier.max_supply === null || tier.max_supply === undefined) {
      return '(Open Edition)';
    }
    const purchaseCount = tier.purchase_count ?? 0;
    return `(${purchaseCount}/${tier.max_supply})`;
  };

  // Enhanced color schemes for each tier
  const getTierColors = (tierKey: string, isSelected: boolean) => {
    const baseColors = {
      basic: isSelected
        ? 'border-slate-500 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl shadow-slate-500/50'
        : 'border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/30',
      gold: isSelected
        ? 'border-amber-500 bg-gradient-to-br from-amber-600 via-yellow-600 to-amber-700 shadow-xl shadow-amber-500/60'
        : 'border-amber-600 bg-gradient-to-br from-amber-700 via-yellow-700 to-amber-800 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/40',
      legendary: isSelected
        ? 'border-violet-500 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 shadow-xl shadow-violet-500/60'
        : 'border-violet-600 bg-gradient-to-br from-violet-700 via-purple-700 to-violet-800 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/40',
    };
    return baseColors[tierKey as keyof typeof baseColors] || baseColors.basic;
  };

  const tierKey =
    Object.keys(tierDisplayNames).find(
      key =>
        tierDisplayNames[key as keyof typeof tierDisplayNames] === displayName
    ) || 'basic';

  return (
    <div
      className={`cursor-pointer rounded-2xl border-3 p-6 transition-all duration-300 ease-out ${getTierColors(tierKey, isSelected)} text-white ${
        !isAvailable || isSoldOut || disabled
          ? 'cursor-not-allowed opacity-50'
          : ''
      } ${isSelected ? 'ring-opacity-50 scale-105 ring-4 ring-offset-4' : 'hover:scale-[1.02]'} ${
        tierKey === 'basic'
          ? 'ring-slate-300'
          : tierKey === 'gold'
            ? 'ring-amber-300'
            : 'ring-violet-300'
      }`}
      onClick={!disabled && isAvailable && !isSoldOut ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Enhanced Tier Icon */}
          <div className="relative flex items-center justify-center">
            <div
              className={`h-6 w-6 rounded-full transition-all duration-300 ${
                tierKey === 'basic'
                  ? 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg shadow-slate-300/80'
                  : tierKey === 'gold'
                    ? 'bg-gradient-to-br from-amber-300 to-yellow-400 shadow-lg shadow-amber-300/80'
                    : 'bg-gradient-to-br from-violet-300 to-purple-400 shadow-lg shadow-violet-300/80'
              } ${isSelected ? 'scale-110' : ''}`}
            >
              {/* Inner glow */}
              <div
                className={`absolute inset-0 rounded-full blur-sm ${
                  tierKey === 'basic'
                    ? 'bg-slate-200'
                    : tierKey === 'gold'
                      ? 'bg-amber-200'
                      : 'bg-violet-200'
                } opacity-70`}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-bold tracking-tight">{displayName}</h3>
            <span className="text-xs font-medium opacity-60">
              {getSupplyText()}
            </span>
          </div>
        </div>

        <div className={`text-xl font-bold tracking-tight`}>
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
