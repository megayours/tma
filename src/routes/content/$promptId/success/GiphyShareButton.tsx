import { useState, useEffect } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useShareContent } from '@/hooks/useContents';
import { useTelegramTheme } from '@/auth/useTelegram';
import {
  triggerHapticImpact,
  triggerHapticNotification,
} from '@/utils/hapticFeedback';

interface GiphyShareButtonProps {
  contentId: string;
  contentType: 'image' | 'video' | 'gif' | 'sticker' | 'animated_sticker';
  collectionChain?: string;
  collectionAddress?: string;
  collections?: Array<{
    chain: string;
    address: string;
    integrations?: Array<{ type: string; enabled: boolean }>;
  }>;
}

export function GiphyShareButton({
  contentId,
  contentType,
  collectionChain,
  collectionAddress,
  collections,
}: GiphyShareButtonProps) {
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const [isGiphySharing, setIsGiphySharing] = useState(false);
  const [giphyShareSuccess, setGiphyShareSuccess] = useState(false);
  const [isGiphyEnabled, setIsGiphyEnabled] = useState(false);

  // Share content mutation
  const { mutate: shareContent, data: shareData } = useShareContent(session);

  // Get Giphy URL from share data
  const giphyUrl = shareData?.find(
    result => result.integration === 'giphy'
  )?.url;

  // Check if Giphy integration is enabled for this collection
  // Only enable for animated content (GIFs, videos, animated stickers), not static images
  useEffect(() => {
    if (!collectionChain || !collectionAddress || !collections) {
      setIsGiphyEnabled(false);
      return;
    }

    // Find matching collection by chain + address
    const contentCollection = collections.find(
      c => c.chain === collectionChain && c.address === collectionAddress
    );

    if (!contentCollection) {
      setIsGiphyEnabled(false);
      return;
    }

    // Giphy only supports animated content (GIFs, videos, animated stickers)
    const isGiphyContent = contentType !== 'image';

    const hasGiphyIntegration =
      contentCollection.integrations?.some(
        i => i.type === 'giphy' && i.enabled
      ) || false;

    setIsGiphyEnabled(isGiphyContent && hasGiphyIntegration);
  }, [collectionChain, collectionAddress, collections, contentType]);

  const handleShareToGiphy = async () => {
    if (!contentId) return;

    // If already shared, copy URL to clipboard
    if (giphyUrl) {
      try {
        await navigator.clipboard.writeText(giphyUrl);
        if (isTelegram) {
          triggerHapticImpact('light');
        }
        console.log('Giphy URL copied to clipboard:', giphyUrl);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        if (isTelegram) {
          triggerHapticNotification('error');
        }
      }
      return;
    }

    setIsGiphySharing(true);
    setGiphyShareSuccess(false);

    console.log('Sharing content with ID:', contentId);
    shareContent(contentId, {
      onSuccess: data => {
        console.log('Share response:', data);

        // Find Giphy integration result
        const giphyResult = data.find(result => result.integration === 'giphy');

        if (giphyResult?.success) {
          setGiphyShareSuccess(true);
          console.log('Giphy share URL:', giphyResult.url);

          if (isTelegram) {
            // Use success notification for better feedback
            triggerHapticNotification('success');
          }

          // Reset success state after 3 seconds
          setTimeout(() => {
            setGiphyShareSuccess(false);
          }, 3000);
        } else {
          console.error('Giphy share failed:', giphyResult?.error);
          if (isTelegram) {
            triggerHapticNotification('error');
          }
        }

        // Reset loading state after success
        setIsGiphySharing(false);
      },
      onError: error => {
        console.error('Failed to share to Giphy:', error);
        if (isTelegram) {
          triggerHapticNotification('error');
        }

        // Reset loading state after error
        setIsGiphySharing(false);
      },
    });
  };

  return (
    <button
      onClick={handleShareToGiphy}
      disabled={!contentId || isGiphySharing || !isGiphyEnabled}
      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6157ff] via-[#a640ff] to-[#ff0099] px-4 py-2.5 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGiphySharing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="text-sm font-medium text-white">Sharing...</span>
        </>
      ) : giphyShareSuccess ? (
        <>
          <span className="animate-pulse text-base font-medium text-white">
            ✓
          </span>
          <span className="text-sm font-medium text-white">
            Shared to Giphy!
          </span>
        </>
      ) : giphyUrl ? (
        <>
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm font-medium text-white">Copy Link</span>
        </>
      ) : (
        <>
          <span className="text-sm font-medium text-white">Giphy</span>
        </>
      )}
    </button>
  );
}
