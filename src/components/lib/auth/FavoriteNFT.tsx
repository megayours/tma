import { Link } from '@tanstack/react-router';
import { useSelectedNFTsSafe } from '@/contexts/SelectedNFTsContext';

export function FavoriteNFT() {
  const { selectedFavorite } = useSelectedNFTsSafe();

  // Don't render if no favorite is selected
  if (!selectedFavorite) {
    return null;
  }

  return (
    <Link
      to="/profile"
      className="border-tg-hint hover:border-tg-link flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 transition-all active:scale-95"
    >
      <img
        src={selectedFavorite.token.image || '/nfts/not-available.png'}
        alt={selectedFavorite.token.name || `NFT #${selectedFavorite.token.id}`}
        className="h-full w-full object-cover"
      />
    </Link>
  );
}
