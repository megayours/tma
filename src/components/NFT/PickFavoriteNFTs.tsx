import { useState } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useGetFavorites } from '@/hooks/useFavorites';
import type { Token } from '@/types/response';
import type { SupportedCollection } from '../../hooks/useCollections';
import { Blockquote } from '@telegram-apps/telegram-ui';

interface PickFavoriteNFTsProps {
  onTokenSelect: (favorite: { token: Token }) => void;
  selectedNFT?: Token | null;
  supportedCollections?: SupportedCollection[] | undefined;
}

interface FavoriteItemProps {
  favorite: { token: Token };
  isSelected: boolean;
  onSelect: (favorite: { token: Token }) => void;
  onImageLoad?: () => void;
  active: boolean;
}

function FavoriteItem({
  favorite,
  isSelected,
  onSelect,
  onImageLoad,
  active = true,
}: FavoriteItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onImageLoad) {
      onImageLoad();
    }
  };

  return (
    <div
      className={`flex-shrink-0 transition-transform ${
        active
          ? 'cursor-pointer hover:scale-105'
          : 'cursor-not-allowed opacity-50 grayscale'
      }`}
      onClick={() => active && onSelect(favorite)}
    >
      <div className="flex flex-col items-center gap-2">
        {/* NFT Image - Circular */}
        <div className="relative">
          <div
            className={`bg-tg-secondary h-20 w-20 rounded-full p-1 transition-colors ${
              active ? 'hover:bg-tg-secondary/80' : ''
            } ${
              isSelected
                ? 'border-tg-accent-text border-2'
                : 'border-tg-section-separator border'
            }`}
          >
            {/* Loading placeholder - Skeleton/Pulse animation */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-tg-secondary h-12 w-12 animate-pulse rounded-full" />
              </div>
            )}

            {/* Image */}
            <img
              src={favorite.token.image || '/nfts/not-available.png'}
              alt={favorite.token.name || `NFT #${favorite.token.id}`}
              className={`h-full w-full rounded-full object-cover transition-opacity duration-200 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
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
  );
}

/**
 * Helper function to check if a favorite NFT is supported by the collection restrictions
 * @param favorite - The favorite NFT to check
 * @param supportedCollections - List of supported collections (address + chain combinations)
 * @returns true if the favorite is supported or if no restrictions exist
 */
const isFavoriteSupported = (
  favorite: { token: Token },
  supportedCollections?: SupportedCollection[]
): boolean => {
  // If no supported collections specified, allow all favorites
  if (!supportedCollections || supportedCollections.length === 0) {
    return true;
  }

  // Check if the favorite's contract address and chain match any supported collection
  return supportedCollections.some(
    collection =>
      collection.address === favorite.token.contract.address &&
      collection.chain === favorite.token.contract.chain
  );
};

/**
 * Helper function to sort favorites with active ones first, then disabled ones
 * @param favorites - Array of favorite NFTs
 * @param supportedCollections - List of supported collections
 * @returns Sorted array with active favorites first
 */
const sortFavoritesBySupport = (
  favorites: Array<{ token: Token }>,
  supportedCollections?: SupportedCollection[]
): Array<{ token: Token }> => {
  return [...favorites].sort((a, b) => {
    const aSupported = isFavoriteSupported(a, supportedCollections);
    const bSupported = isFavoriteSupported(b, supportedCollections);

    // Sort active (supported) favorites first
    if (aSupported && !bSupported) return -1;
    if (!aSupported && bSupported) return 1;
    return 0;
  });
};

/**
 * Info message component explaining why some favorites are disabled
 */
const DisabledFavoritesInfo = () => (
  <Blockquote type="text">
    Only selected NFT collections can be used for this pack
  </Blockquote>
);

/**
 * Warning message component for when the preselected NFT is not supported
 */
const InvalidPreselectionWarning = () => (
  <Blockquote type="text">Selected NFT is not supported</Blockquote>
);

/**
 * Component that displays favorite NFTs in a horizontal scrolling list
 * with Telegram-like UI styling
 */
export const PickFavoriteNFTs = ({
  onTokenSelect,
  selectedNFT,
  supportedCollections,
}: PickFavoriteNFTsProps) => {
  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session);

  // Don't render if loading or no favorites
  if (isLoadingFavorites || !favorites || favorites.length === 0) {
    return null;
  }

  // Handlers - defined early to be used in validation logic
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

  // Sort favorites: active ones first, disabled ones last
  const sortedFavorites = sortFavoritesBySupport(
    favorites,
    supportedCollections
  );

  // Check if there are any disabled favorites to show the info message
  const hasDisabledFavorites = sortedFavorites.some(
    favorite => !isFavoriteSupported(favorite, supportedCollections)
  );

  // Validate that the preselected NFT is active/supported
  // If a selectedNFT exists but is not supported, it should be treated as invalid
  const isPreselectedActive = selectedNFT
    ? sortedFavorites.some(
        favorite =>
          isSelected(favorite) &&
          isFavoriteSupported(favorite, supportedCollections)
      )
    : true;

  const handleImageLoad = () => {
    // Scroll to bottom of the page when an image loads
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-col gap-3 pt-5">
      {/* Show warning if preselected NFT is not supported */}
      {selectedNFT && !isPreselectedActive && <InvalidPreselectionWarning />}

      {/* Show info message if there are disabled favorites */}
      {hasDisabledFavorites && <DisabledFavoritesInfo />}

      {/* Horizontal scrolling list of favorites */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto p-2">
        {sortedFavorites.map(favorite => (
          <FavoriteItem
            key={`${favorite.token.contract.address}-${favorite.token.id}`}
            favorite={favorite}
            isSelected={isSelected(favorite)}
            onSelect={handleFavoriteClick}
            onImageLoad={handleImageLoad}
            active={isFavoriteSupported(favorite, supportedCollections)}
          />
        ))}
      </div>
    </div>
  );
};
