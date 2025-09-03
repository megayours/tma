import { Card } from '@telegram-apps/telegram-ui';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { useAddToFavoritesMutation } from '@/hooks/useCollections';
import { useSession } from '@/auth/SessionProvider';

interface DisplayNFTProps {
  collection: SupportedCollection;
  tokenId: string;
  className?: string;
}

export function DisplayNFT({
  collection,
  tokenId,
  className = '',
}: DisplayNFTProps) {
  const { session } = useSession();
  const {
    data: nftData,
    isLoading: isNFTLoading,
    error,
  } = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    tokenId
  );

  // Move the hook to the top level of the component
  const addToFavoritesMutation = useAddToFavoritesMutation(collection, tokenId);

  if (isNFTLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  if (nftData === null) {
    return (
      <Card className="flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-tg-text text-center text-lg">
          🚫 This NFT does not exist
        </div>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col gap-4 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-tg-text text-xl font-semibold">
          {collection.name} #{tokenId}
        </h2>
        <button
          onClick={() => addToFavoritesMutation.mutate(session)}
          disabled={addToFavoritesMutation.isPending}
          className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 rounded-lg px-3 py-1 text-sm disabled:opacity-50"
        >
          {addToFavoritesMutation.isPending
            ? 'Adding...'
            : '❤️ Add to Favorites'}
        </button>
      </div>

      {nftData?.image && (
        <div className="flex justify-center">
          <img
            src={nftData.image}
            alt={`${collection.name} #${tokenId}`}
            className="max-h-64 w-auto rounded-lg object-contain"
          />
        </div>
      )}

      {nftData?.name && (
        <div className="text-tg-text text-center text-lg font-medium">
          {nftData.name}
        </div>
      )}
    </div>
  );
}
