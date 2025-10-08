import { useSession } from '@/auth/SessionProvider';
import { useGetFavorites } from '@/hooks/useFavorites';
import type { Token } from '@/types/response';

interface PickFavoriteNFTsProps {
  onTokenSelect: (favorite: { token: Token }) => void;
  selectedNFT?: Token | null;
}

/**
 * Component that displays favorite NFTs in a horizontal scrolling list
 * with Telegram-like UI styling
 */
export const PickFavoriteNFTs = ({ onTokenSelect, selectedNFT }: PickFavoriteNFTsProps) => {
  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session);

  // Don't render if loading or no favorites
  if (isLoadingFavorites || !favorites || favorites.length === 0) {
    return null;
  }

  const handleFavoriteClick = (favorite: { token: Token }) => {
    onTokenSelect(favorite);
  };

  const isSelected = (favorite: { token: Token }) => {
    if (!selectedNFT) return false;
    return (
      favorite.token.id === selectedNFT.id &&
      favorite.token.contract.address === selectedNFT.contract.address
    );
  };

  return (
    <div className="mb-3 p-2">
      <div className="bg-tg-bg sticky top-0 z-10 w-full p-2">
        <h2 className="text-tg-text mb-2 text-sm font-semibold">Favorites</h2>
      </div>

      <div className="scrollbar-hide flex gap-2 overflow-x-auto p-2">
        {favorites.map(favorite => (
          <div
            key={`${favorite.token.contract.address}-${favorite.token.id}`}
            className="flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
            onClick={() => handleFavoriteClick(favorite)}
          >
            <div className="flex flex-col items-center gap-2">
              {/* NFT Image - Circular */}
              <div className="relative">
                <div className={`bg-tg-secondary hover:bg-tg-secondary/80 h-20 w-20 rounded-full p-1 transition-colors ${
                  isSelected(favorite)
                    ? 'border-2 border-tg-accent-text'
                    : 'border border-tg-section-separator'
                }`}>
                  <img
                    src={favorite.token.image || '/nfts/not-available.png'}
                    alt={favorite.token.name || `NFT #${favorite.token.id}`}
                    className="h-full w-full rounded-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* NFT Info - Compact */}
              <div className="text-center">
                <div className="text-tg-text max-w-[80px] truncate text-xs font-bold">
                  {favorite.token.name || `#${favorite.token.id}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
