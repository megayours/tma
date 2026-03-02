import { Button } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { useGetTokensByCollection, type SupportedCollection } from '@/hooks/useCollections';

export interface SelectGridMascotProps {
  collection: SupportedCollection;
  onBack: () => void;
  onTokenSelect?: (tokenId: string) => void;
  className?: string;
}

export function SelectGridMascot({
  collection,
  onBack,
  onTokenSelect,
  className = '',
}: SelectGridMascotProps) {
  const { data: tokenData, isLoading } = useGetTokensByCollection(
    collection,
    1,
    collection.size
  );
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const tokens = tokenData?.tokens || [];

  const handleTokenSelect = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    onTokenSelect?.(tokenId);
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex flex-row">
          <div>
            <Button mode="plain" size="s" onClick={onBack} className="w-fit">
              ←
            </Button>
          </div>
          <h1 className="text-tg-text text-xl">{collection.name}</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-tg-hint text-sm">Loading characters...</div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex flex-row">
          <div>
            <Button mode="plain" size="s" onClick={onBack} className="w-fit">
              ←
            </Button>
          </div>
          <h1 className="text-tg-text text-xl">{collection.name}</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-tg-hint text-sm">No characters available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-row">
        <div>
          <Button mode="plain" size="s" onClick={onBack} className="w-fit">
            ←
          </Button>
        </div>
        <h1 className="text-tg-text text-xl">{collection.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-5">
        {tokens.map(token => {
          if (!token) return null;

          const isSelected = token.id === selectedTokenId;

          return (
            <button
              key={token.id}
              type="button"
              onClick={() => handleTokenSelect(token.id)}
              className={`bg-tg-secondary flex flex-col gap-2 rounded-2xl p-2 text-left transition-colors ${
                isSelected
                  ? 'ring-tg-button ring-2'
                  : 'hover:bg-tg-secondary/80'
              }`}
            >
              <div className="bg-tg-bg aspect-square overflow-hidden rounded-xl">
                <img
                  src={token.image || '/nfts/not-available.png'}
                  alt={token.name || `Token #${token.id}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="min-w-0">
                <div className="text-tg-text truncate text-sm font-medium">
                  {token.name || `#${token.id}`}
                </div>
                <div className="text-tg-hint text-xs">#{token.id}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
