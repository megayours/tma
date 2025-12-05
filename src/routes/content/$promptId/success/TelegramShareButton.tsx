import { useState } from 'react';
import { buildShareUrl } from '@/utils/shareUrl';
import { useTelegramTheme } from '@/auth/useTelegram';
import {
  triggerHapticImpact,
  triggerHapticNotification,
} from '@/utils/hapticFeedback';

interface TelegramShareButtonProps {
  promptId: string;
  contentPromptName?: string;
  communityId?: string;
}

export function TelegramShareButton({
  promptId,
  contentPromptName,
  communityId,
}: TelegramShareButtonProps) {
  const { isTelegram } = useTelegramTheme();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);

      // Build share URL with bot URL and content details path
      const shareUrl = buildShareUrl(
        import.meta.env.VITE_PUBLIC_BOT_URL || '',
        `/content/${promptId}/details`,
        communityId
      );
      const shareTitle = contentPromptName || 'Check out my creation!';
      const shareText = `${shareTitle} - Created with MegaYours`;

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });

        if (isTelegram) {
          triggerHapticImpact('light');
        }
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        if (isTelegram) {
          triggerHapticImpact('light');
        }
        // Could show a toast notification here
        console.log('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      if (isTelegram) {
        triggerHapticNotification('error');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className="bg-tg-button flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSharing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="text-sm font-medium text-white">Sharing...</span>
        </>
      ) : (
        <span className="text-sm font-medium text-white">Telegram</span>
      )}
    </button>
  );
}
