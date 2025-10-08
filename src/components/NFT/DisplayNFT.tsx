import { Button, Card } from '@telegram-apps/telegram-ui';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import type { Token } from '../../types/response';

interface DisplayNFTProps {
  collection: SupportedCollection;
  tokenId: string;
  className?: string;
  onClick: (token: Token) => void;
}

export function DisplayNFT({
  collection,
  tokenId,
  className = '',
  onClick,
}: DisplayNFTProps) {
  const {
    data: nftData,
    isLoading: isNFTLoading,
    error,
  } = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    tokenId
  );

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
      {nftData?.image && (
        <div className="flex justify-center">
          <img
            src={nftData.image}
            alt={`${collection.name} #${tokenId}`}
            className="max-h-64 w-auto rounded-lg object-contain"
          />
        </div>
      )}

      <Button
        size="l"
        onClick={() => onClick(nftData!)}
        disabled={!nftData}
        mode="filled"
      >
        Select
      </Button>
    </div>
  );
}
