import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useShareContent } from '@/hooks/useContents';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useQueryClient } from '@tanstack/react-query';
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
  giphyUrl?: string;
}

export function GiphyShareButton({
  contentId,
  contentType,
  collectionChain,
  collectionAddress,
  collections,
  giphyUrl: giphyUrlProp,
}: GiphyShareButtonProps) {
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const queryClient = useQueryClient();
  const [isGiphySharing, setIsGiphySharing] = useState(false);
  const [giphyShareSuccess, setGiphyShareSuccess] = useState(false);
  const [isGiphyEnabled, setIsGiphyEnabled] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Share content mutation
  const { mutate: shareContent, data: shareData } = useShareContent(session);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  // Get Giphy URL - prefer from shareData (just shared), fallback to prop (existing)
  const giphyUrlFromShare = shareData?.find(
    result => result.integration === 'giphy'
  )?.url;
  const giphyUrl = giphyUrlFromShare || giphyUrlProp;

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

  const pollForGiphyUrl = async () => {
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/content/${contentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (response.ok) {
        const content = await response.json();
        const giphyIntegration = content.integrations?.find(
          (i: any) => i.integration === 'giphy'
        );

        if (giphyIntegration && giphyIntegration.url !== 'pending') {
          // URL is ready!
          console.log('Giphy URL ready:', giphyIntegration.url);

          // Clear polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }

          // Show success
          setGiphyShareSuccess(true);
          if (isTelegram) {
            triggerHapticNotification('success');
          }

          // Invalidate queries to refetch with new integration URL
          queryClient.invalidateQueries({
            predicate: (query) =>
              query.queryKey[0] === 'content-execution' &&
              query.queryKey[1] === contentId,
          });
          queryClient.invalidateQueries({
            queryKey: ['content'],
            exact: false,
          });

          // Stop loading
          setIsGiphySharing(false);

          // Reset success state after 3 seconds
          setTimeout(() => {
            setGiphyShareSuccess(false);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error polling for Giphy URL:', error);
    }
  };

  const handleShareToGiphy = async () => {
    if (!contentId) return;

    setIsGiphySharing(true);
    setGiphyShareSuccess(false);

    console.log('Sharing content with ID:', contentId);
    shareContent(contentId, {
      onSuccess: data => {
        console.log('Share response:', data);

        // Find Giphy integration result
        const giphyResult = data.find(result => result.integration === 'giphy');

        if (giphyResult?.success) {
          console.log('Giphy share initiated, URL status:', giphyResult.url);

          // If URL is pending, start polling
          if (giphyResult.url === 'pending') {
            console.log('Starting polling for Giphy URL...');

            // Start polling every 2 seconds
            pollingIntervalRef.current = setInterval(pollForGiphyUrl, 2000);

            // Set timeout to stop polling after 60 seconds
            pollingTimeoutRef.current = setTimeout(() => {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }

              // Show error if still loading
              if (isGiphySharing) {
                setIsGiphySharing(false);
                if (isTelegram) {
                  triggerHapticNotification('error');
                }
                console.error(
                  'Polling timeout: Giphy URL not ready after 60 seconds'
                );
              }
            }, 60000);
          } else {
            // URL is already available (not pending)
            setGiphyShareSuccess(true);
            if (isTelegram) {
              triggerHapticNotification('success');
            }

            // Invalidate queries
            queryClient.invalidateQueries({
              predicate: (query) =>
                query.queryKey[0] === 'content-execution' &&
                query.queryKey[1] === contentId,
            });
            queryClient.invalidateQueries({
              queryKey: ['content'],
              exact: false,
            });

            setIsGiphySharing(false);

            setTimeout(() => {
              setGiphyShareSuccess(false);
            }, 3000);
          }
        } else {
          console.error('Giphy share failed:', giphyResult?.error);
          if (isTelegram) {
            triggerHapticNotification('error');
          }
          setIsGiphySharing(false);
        }
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

  const handleCopyUrl = async () => {
    if (!giphyUrl || giphyUrl === 'pending') return;

    try {
      await navigator.clipboard.writeText(giphyUrl);
      if (isTelegram) {
        triggerHapticImpact('light');
      }
      setShowCopied(true);
      console.log('Giphy URL copied to clipboard:', giphyUrl);

      // Reset "Copied!" state after 2 seconds
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      if (isTelegram) {
        triggerHapticNotification('error');
      }
    }
  };

  // If URL exists and not pending, show two-button layout
  if (
    giphyUrl &&
    giphyUrl !== 'pending' &&
    !isGiphySharing &&
    !giphyShareSuccess
  ) {
    return (
      <div className="flex w-full gap-2">
        {/* Open in Giphy */}
        <a
          href={giphyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6157ff] via-[#a640ff] to-[#ff0099] px-4 py-3 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95"
        >
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span className="text-base font-medium text-white">Open in Giphy</span>
        </a>

        {/* Copy URL */}
        <button
          onClick={handleCopyUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-transparent px-4 py-3 shadow-md transition-all duration-200 hover:bg-white/10 active:scale-95"
          style={{
            borderImage:
              'linear-gradient(to right, #6157ff, #a640ff, #ff0099) 1',
          }}
        >
          {showCopied ? (
            <>
              <span className="text-tg-text text-base font-medium">
                ✓ Copied!
              </span>
            </>
          ) : (
            <>
              <svg
                className="text-tg-text h-4 w-4"
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
              <span className="text-tg-text text-base font-medium">Copy URL</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleShareToGiphy}
      disabled={!contentId || isGiphySharing || !isGiphyEnabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6157ff] via-[#a640ff] to-[#ff0099] px-4 py-3 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGiphySharing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="text-base font-medium text-white">Sharing...</span>
        </>
      ) : giphyShareSuccess ? (
        <>
          <span className="animate-pulse text-base font-medium text-white">
            ✓
          </span>
          <span className="text-base font-medium text-white">
            Shared to Giphy!
          </span>
        </>
      ) : (
        <>
          <span className="text-base font-medium text-white">Share on Giphy</span>
        </>
      )}
    </button>
  );
}
