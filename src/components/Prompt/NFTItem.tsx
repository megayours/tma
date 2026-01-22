import type { Token } from '@/types/response';
import { Avatar } from '@telegram-apps/telegram-ui';
import { NFTCloud } from '../NFT';
import type { Prompt } from '../../types/prompt';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { IoCloseCircleOutline } from 'react-icons/io5';

/**
 * Avatar component that fetches NFT data if image is missing
 */
const NFTAvatar = ({ token }: { token: Token }) => {
  // Only fetch if image is missing
  const shouldFetch =
    !token.image &&
    !!token.contract?.chain &&
    !!token.contract?.address &&
    !!token.id;

  const { data: fetchedToken } = useGetNFTByCollectionAndTokenId(
    shouldFetch ? token.contract?.chain || '' : '',
    shouldFetch ? token.contract?.address || '' : '',
    shouldFetch ? token.id || '' : ''
  );

  const imageUrl = fetchedToken?.image || token?.image || '/logo.png';

  return <Avatar src={imageUrl} />;
};

/**
 * Individual NFT item component
 * Handles the display and interaction for a single NFT
 */
export const NFTItem = ({
  token,
  index,
  pressedIndex,
  onPress,
  prompt,
  onCloudClose,
  isCompulsory,
  onRemove,
  updateCompulsoryNFT,
  updateOptionalNFT,
}: {
  token: Token;
  index: number;
  pressedIndex: number | null;
  onPress: (index: number) => void;
  prompt: Prompt;
  onCloudClose: () => void;
  isCompulsory: boolean;
  onRemove?: () => void;
  updateCompulsoryNFT: (nftIndex: number, newToken: Token) => void;
  updateOptionalNFT: (nftIndex: number, newToken: Token) => void;
}) => {
  const handleClick = () => {
    console.log('handleClick pressedIndex:', pressedIndex, 'index:', index);
    if (pressedIndex === index) {
      console.log('Closing cloud for index:', index);
      onCloudClose();
      return;
    } else {
      onPress(index);
      return;
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <>
      {/* Show cloud tooltip when NFT is clicked */}
      {pressedIndex === index && (
        <NFTCloud
          nftIndex={index}
          prompt={prompt}
          onClose={onCloudClose}
          isCompulsory={isCompulsory}
          updateCompulsoryNFT={updateCompulsoryNFT}
          updateOptionalNFT={updateOptionalNFT}
        />
      )}
      <div
        key={index}
        className="flex h-12 cursor-pointer flex-row items-center gap-2 rounded-full border border-white/20 bg-white/10 p-2 shadow-lg backdrop-blur-lg select-none"
        onClick={handleClick}
        onContextMenu={e => e.preventDefault()}
      >
        {/* NFT avatar */}
        <div className="flex items-center">
          <NFTAvatar token={token} />
        </div>
        {/* Show NFT label when in modification mode */}
        <span className="text-tg-text flex items-center text-sm font-bold select-none">
          {isCompulsory ? `Character ${index + 1}` : `Optional ${index + 1}`}
        </span>

        {/* X button to remove optional NFT - only show for optional items */}
        <button
          onClick={handleRemove}
          aria-label="Remove optional NFT"
          className="flex items-center"
        >
          <IoCloseCircleOutline size={20} />
        </button>
      </div>
    </>
  );
};
