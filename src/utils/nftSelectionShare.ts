import type { NFTSelectionPageState } from '@/hooks/useNFTSelectionPage';
import { canShareMessage, shareTelegramMessage } from '@/utils/telegramShare';

interface ShareSelectionButtonOptions {
  selectionState: NFTSelectionPageState;
  shareUrl: string;
  shareText: string;
  buttonText?: string;
}

export const getShareSelectionButtonConfig = ({
  selectionState,
  shareUrl,
  shareText,
  buttonText = 'Create with a friend',
}: ShareSelectionButtonOptions) => {
  const shouldShowShareButton =
    selectionState.selectedTokens.length > 0 &&
    selectionState.hasEmptySlots &&
    canShareMessage();

  if (!shouldShowShareButton) {
    return undefined;
  }

  console.log(selectionState);

  return {
    text: buttonText,
    onClick: () => shareTelegramMessage(shareUrl, shareText),
    visible: true,
  };
};
