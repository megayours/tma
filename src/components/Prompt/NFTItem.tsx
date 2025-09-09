import type { Token } from '@/types/response';
import { Avatar } from '@telegram-apps/telegram-ui';
import { useLongPress } from 'use-long-press';
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
}: {
  token: Token;
  index: number;
  isModifyingNFTs: boolean;
  longPressedIndex: number | null;
  onLongPress: (index: number) => void;
  prompt: Prompt;
  onCloudClose: () => void;
  setIndex: number;
}) => {
  const longPressBind = useLongPress(() => onLongPress(index), {
    threshold: 500, // 500ms threshold for long press
    cancelOnMovement: true, // Cancel if finger moves
  });

  return (
    <>
      {/* Show cloud tooltip when any NFT is long pressed */}
      {longPressedIndex === index && (
        <NFTCloud
          setIndex={setIndex}
          nftIndex={index}
          prompt={prompt}
          onClose={onCloudClose}
        />
      )}
      <div
        key={index}
        className="iteems-center bg-tg-secondary-bg relative flex flex-row gap-2 rounded-full p-2 select-none"
        {...longPressBind()}
        onContextMenu={e => e.preventDefault()}
      >
        {/* Show NFT label when in modification mode */}
        {isModifyingNFTs && (
          <h1 className="text-tg-text text-xs select-none">NFT {index + 1}</h1>
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
      </div>
    </>
  );
};
