import { Link } from '@tanstack/react-router';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';

export function FavoriteNFT({ size = 40 }: { size?: number }) {
  const { session } = useSession();
  const { selectedFavorite } = useGetFavorites(session!);

  // Don't render if no favorite is selected
  if (!selectedFavorite) {
    return null;
  }

  return (
    <Link
      to="/profile"
      className="border-tg-hint hover:border-tg-link flex items-center justify-center overflow-hidden rounded-full border-2 transition-all active:scale-95"
      style={{ width: size, height: size }}
    >
      <img
        src={selectedFavorite.token.image || '/nfts/not-available.png'}
        alt={selectedFavorite.token.name || `NFT #${selectedFavorite.token.id}`}
        className="h-full w-full object-cover"
      />
    </Link>
  );
}
