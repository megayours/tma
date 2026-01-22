import { useRef } from 'react';
import { Button, Card } from '@telegram-apps/telegram-ui';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import { Spinner } from '@/components/ui';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const {
    data: nftData,
    isLoading: isNFTLoading,
    error,
  } = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    tokenId
  );

  // Scroll into view only after image has loaded
  const handleImageLoad = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  if (isNFTLoading) return <Spinner text="Loading NFT..." centered />;

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
    <div ref={containerRef} className={`flex flex-col gap-4 p-4 ${className}`}>
      {nftData?.image && (
        <div className="flex justify-center">
          <img
            ref={imageRef}
            src={nftData.image}
            alt={`${collection.name} #${tokenId}`}
            className="max-h-64 w-auto rounded-lg object-contain"
            onLoad={handleImageLoad}
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
