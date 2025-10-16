import type { Token } from '@/types/response';
import { Avatar } from '@telegram-apps/telegram-ui';
import { NFTCloud } from '../NFT';
import type { Prompt } from '../../types/prompt';

/**
 * Individual NFT item component
 * Handles the display and interaction for a single NFT
 */
export const NFTItem = ({
  token,
  index,
  isModifyingNFTs,
  longPressedIndex,
  onLongPress,
  prompt,
  onCloudClose,
  setIndex,
  isCompulsory,
  onRemove,
}: {
  token: Token;
  index: number;
  isModifyingNFTs: boolean;
  longPressedIndex: number | null;
  onLongPress: (index: number) => void;
  prompt: Prompt;
  onCloudClose: () => void;
  setIndex: number;
  isCompulsory: boolean;
  onRemove?: () => void;
}) => {
  const handleClick = () => {
    onLongPress(index);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <>
      {/* Show cloud tooltip when NFT is clicked */}
      {longPressedIndex === index && (
        <NFTCloud
          setIndex={setIndex}
          nftIndex={index}
          prompt={prompt}
          onClose={onCloudClose}
          isCompulsory={isCompulsory}
        />
      )}
      <div
        key={index}
        className="bg-tg-secondary-bg flex h-8 cursor-pointer flex-row items-center gap-2 rounded-full p-2 select-none"
        onClick={handleClick}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Show NFT label when in modification mode */}
        {isModifyingNFTs && (
          <h1 className="text-tg-text text-xs select-none">
            {isCompulsory ? `NFT ${index + 1}` : `Optional ${index + 1}`}
          </h1>
        )}

        {/* NFT avatar */}
        <Avatar
          className=""
          onClick={() => {
            // Close cloud tooltip if it's open
            if (longPressedIndex === index) {
              // This will be handled by the parent component's click outside handler
            }
          }}
          src={token.image || '/nfts/not-available.png'}
          size={20}
        />

        {/* X button to remove optional NFT - only show for optional items */}
        {!isCompulsory && onRemove && isModifyingNFTs && (
          <button
            onClick={handleRemove}
            className="text-tg-hint hover:text-tg-destructive-text border-tg-hint flex h-4 w-4 items-center justify-center rounded-full border transition-colors"
            aria-label="Remove optional NFT"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </>
  );
};
