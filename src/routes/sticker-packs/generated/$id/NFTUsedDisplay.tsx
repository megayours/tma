import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { Spinner } from '@/components/ui';
import type { StickerPackNFTToken } from '@/hooks/useStickerPack';

interface NFTUsedDisplayProps {
  nftToken: StickerPackNFTToken;
}

export function NFTUsedDisplay({ nftToken }: NFTUsedDisplayProps) {
  const {
    data: nftData,
    isLoading,
    error,
  } = useGetNFTByCollectionAndTokenId(
    nftToken.contract.chain,
    nftToken.contract.address,
    nftToken.id
  );

  if (isLoading) {
    return (
      <div className="border-tg-hint/20 border-t pt-4">
        <h3 className="text-tg-hint mb-2 text-sm font-semibold">NFT Used</h3>
        <div className="flex items-center justify-center py-4">
          <Spinner text="Loading NFT..." centered />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-tg-hint/20 border-t pt-4">
        <h3 className="text-tg-hint mb-2 text-sm font-semibold">NFT Used</h3>
        <div className="text-tg-destructive-text text-sm">
          Error loading NFT: {error.message}
        </div>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="border-tg-hint/20 border-t pt-4">
        <h3 className="text-tg-hint mb-2 text-sm font-semibold">NFT Used</h3>
        <div className="text-tg-hint text-sm">NFT not found</div>
      </div>
    );
  }

  return (
    <div className="border-tg-hint/20 border-t pt-4">
      <h3 className="text-tg-hint mb-2 text-sm font-semibold">Pictures Used</h3>
      <div className="flex items-start gap-3">
        {/* NFT Image */}
        {nftData.image && (
          <div className="flex-shrink-0">
            <img
              src={nftData.image}
              alt={`${nftToken.contract.name} #${nftToken.id}`}
              className="bg-tg-hint/10 h-12 w-12 rounded-lg object-cover"
            />
          </div>
        )}

        {/* NFT Details */}
        <div className="text-tg-text flex-1 text-sm">
          <div className="font-medium">{nftToken.contract.name}</div>
          <div className="text-tg-hint text-xs">#{nftToken.id}</div>
        </div>
      </div>
    </div>
  );
}
