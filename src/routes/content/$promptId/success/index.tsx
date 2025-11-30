import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution, useShareContent } from '@/hooks/useContents';
import { SpinnerFullPage } from '@/components/ui';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { usePromptFeedbackMutation } from '@/hooks/usePrompts';
import type { PromptFeedbackSentiment } from '@/types/prompt';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-web';
import { useTelegramTheme } from '@/auth/useTelegram';
import {
  triggerHapticNotification,
  triggerHapticImpact,
} from '@/utils/hapticFeedback';
import { GenerateAgainButton } from '@/components/GenerateAgainButton';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { buildShareUrl } from '@/utils/shareUrl';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

const successSearchSchema = z.object({
  executionId: z.string().optional(),
});

export const Route = createFileRoute('/content/$promptId/success/')({
  validateSearch: successSearchSchema,
  component: SuccessPage,
});

function SuccessPage() {
  const search = Route.useSearch();
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();
  const { selectedCommunity } = useSelectCommunity();

  // Feedback state
  const [selectedFeedback, setSelectedFeedback] =
    useState<PromptFeedbackSentiment | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [winnerLottieInstance, setWinnerLottieInstance] =
    useState<DotLottie | null>(null);
  const [sadLottieInstance, setSadLottieInstance] = useState<DotLottie | null>(
    null
  );
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isGiphySharing, setIsGiphySharing] = useState(false);
  const [giphyShareSuccess, setGiphyShareSuccess] = useState(false);
  const hasSubmittedFeedback = useRef(false);

  useEffect(() => {
    const detectMobile = () => {
      if (typeof navigator === 'undefined') return false;
      const nav = navigator as Navigator & {
        userAgentData?: { mobile?: boolean };
      };

      if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
        return nav.userAgentData.mobile;
      }

      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        nav.userAgent
      );
    };

    setIsMobileDevice(detectMobile());
  }, []);

  // Fetch execution data if executionId is provided
  const { data: content, isLoading } = useContentExecution(
    search.executionId || '',
    session,
    {
      enabled: !!search.executionId,
    }
  );

  console.log('Exection data in SuccessPage:', content, search.executionId);

  // Feedback mutation
  const { mutate: submitFeedback } = usePromptFeedbackMutation(session, {
    onSuccess: () => {
      console.log('Feedback submitted successfully');
    },
    onError: error => {
      console.error('Failed to submit feedback:', error);
    },
  });

  // Share content mutation
  const { mutate: shareContent } = useShareContent(session);

  // Listen for winner animation complete event
  useEffect(() => {
    if (!winnerLottieInstance) return;

    const handleComplete = () => {
      console.log('Winner animation completed');
      setShowAnimation(false);
    };

    winnerLottieInstance.addEventListener('complete', handleComplete);

    return () => {
      winnerLottieInstance.removeEventListener('complete', handleComplete);
    };
  }, [winnerLottieInstance]);

  // Listen for sad animation complete event
  useEffect(() => {
    if (!sadLottieInstance) return;

    const handleComplete = () => {
      console.log('Sad animation completed');
      setShowAnimation(false);
    };

    sadLottieInstance.addEventListener('complete', handleComplete);

    return () => {
      sadLottieInstance.removeEventListener('complete', handleComplete);
    };
  }, [sadLottieInstance]);

  const handleFeedback = (sentiment: PromptFeedbackSentiment) => {
    if (!content?.id) return;

    setSelectedFeedback(sentiment);

    // Trigger animation based on sentiment
    setShowAnimation(true);

    // Trigger haptic feedback if in Telegram
    if (isTelegram) {
      if (sentiment === 'positive') {
        // Soft success notification for positive feedback
        triggerHapticImpact('light');
      } else {
        // Error notification + heavy impact for negative feedback
        triggerHapticNotification('error');
        // triggerHapticImpact('heavy');
      }
    }

    // Only submit to API if this is the first feedback submission
    if (!hasSubmittedFeedback.current) {
      hasSubmittedFeedback.current = true;
      submitFeedback({
        contentId: content.id,
        sentiment,
      });
    }
  };

  const handleBackToFeed = () => {
    navigate({ to: '/community' });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  const contentUrl = content?.url;
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const handleDownload = async () => {
    if (!contentUrl) return;

    try {
      setIsDownloading(true);

      // On Telegram Desktop, use direct URL instead of blob
      if (isTelegram && !isMobileDevice) {
        // Open in new tab for Telegram Desktop
        window.open(contentUrl, '_blank');

        if (isTelegram) {
          triggerHapticImpact('light');
        }
        return;
      }

      const response = await fetch(contentUrl);
      if (!response.ok) {
        throw new Error('Unable to download content');
      }

      const blob = await response.blob();
      const mimeType = blob.type || 'image/png';
      const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
      const fileName = `artwork-${content?.id || promptId}.${extension}`;
      const file = new File([blob], fileName, { type: mimeType });

      // Mobile: use share API to save to camera roll
      if (
        isMobileDevice &&
        canShareFiles &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: 'Save your artwork',
          text: 'Choose "Save Image" to store this in your camera roll.',
        });
      } else {
        // Desktop (non-Telegram): direct download
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }

      if (isTelegram) {
        triggerHapticImpact('light');
      }
    } catch (error) {
      console.error('Failed to download content:', error);
      if (isTelegram) {
        triggerHapticNotification('error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);

      // Build share URL with bot URL and content details path
      const shareUrl = buildShareUrl(
        import.meta.env.VITE_PUBLIC_BOT_URL || '',
        `/content/${promptId}/details`,
        selectedCommunity?.id
      );
      const shareTitle = content?.prompt?.name || 'Check out my creation!';
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

  const handleShareToGiphy = async () => {
    if (!content?.id) return;

    try {
      setIsGiphySharing(true);
      setGiphyShareSuccess(false);

      console.log('Sharing content with ID:', content.id);
      shareContent(content.id, {
        onSuccess: data => {
          console.log('Share response:', data);

          // Find Giphy integration result
          const giphyResult = data.find(
            result => result.integration === 'giphy'
          );

          if (giphyResult?.success) {
            setGiphyShareSuccess(true);
            console.log('Giphy share URL:', giphyResult.url);

            if (isTelegram) {
              triggerHapticImpact('light');
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
        },
        onError: error => {
          console.error('Failed to share to Giphy:', error);
          if (isTelegram) {
            triggerHapticNotification('error');
          }
        },
      });
    } finally {
      setIsGiphySharing(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="flex flex-col pt-6 pb-10 sm:px-6">
          {/* Success Title */}
          <div className="flex flex-row items-center justify-between px-6">
            <h1 className="text-tg-text text-lg font-semibold">
              {content?.prompt?.name || 'Tadaa! 🎉'}
            </h1>
          </div>

          {/* Generated Content Display */}
          <div className="flex justify-center px-4">
            <div className="gap- flex w-full max-w-md flex-col">
              <div className="relative mt-2">
                {/* Gradient border wrapper for success state */}
                {giphyShareSuccess && (
                  <div className="absolute -inset-1 animate-pulse rounded-[18px] bg-gradient-to-r from-[#6157ff] via-[#a640ff] to-[#ff0099] opacity-75 blur-sm" />
                )}
                {/* Pulsing border for loading state */}
                {isGiphySharing && (
                  <div className="absolute -inset-1 animate-pulse rounded-[18px] bg-[#6157ff] opacity-50" />
                )}
                <div className="bg-tg-bg relative overflow-hidden rounded-2xl shadow-sm">
                  <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 dark:from-gray-800 dark:to-gray-900">
                    {contentUrl ? (
                      <img
                        src={contentUrl}
                        alt="Generated content"
                        className="h-full w-full rounded-xl object-contain"
                      />
                    ) : (
                      <div className="text-tg-hint text-sm">
                        Content preview not available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {content?.id && (
            <div className="mt-2 flex items-center justify-between gap-2 px-4">
              {/* Positive Button (with centered Lottie) */}
              <div className="relative flex items-center justify-center gap-2">
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`flex h-10 w-14 items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                    selectedFeedback === 'positive'
                      ? 'border-tg-button text-tg-button shadow-md'
                      : 'text-tg-hint border-tg-section-separator hover:bg-tg-section-bg/80 active:scale-95'
                  }`}
                  aria-label="Thumbs up"
                >
                  <FaThumbsUp className="h-5 w-5" />
                </button>

                {/* Winner Animation (Perfectly Centered) */}
                {showAnimation && selectedFeedback === 'positive' && (
                  <DotLottieReact
                    dotLottieRefCallback={setWinnerLottieInstance}
                    className="pointer-events-none absolute inset-0 z-50 flex h-[160px] w-[160px] -translate-x-[calc(50%-28px)] -translate-y-[calc(50%-28px)] items-center justify-center"
                    src="/lotties/stars4s.lottie"
                    loop={false}
                    autoplay
                  />
                )}

                {/* Negative Button */}
                <button
                  onClick={() => handleFeedback('negative')}
                  className={`flex h-10 w-14 items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                    selectedFeedback === 'negative'
                      ? 'border-tg-button text-tg-button shadow-md'
                      : 'text-tg-hint border-tg-section-separator hover:bg-tg-section-bg/80 active:scale-95'
                  }`}
                  aria-label="Thumbs down"
                >
                  <FaThumbsDown className="h-5 w-5" />
                </button>
              </div>

              {/* Generate Again Button */}
              <GenerateAgainButton execution={content} promptId={promptId} />
            </div>
          )}

          {/* Sad Animation - Full screen from top */}
          {showAnimation && selectedFeedback === 'negative' && (
            <div className="pointer-events-none fixed top-0 left-0 z-50 flex w-full justify-center">
              <DotLottieReact
                dotLottieRefCallback={setSadLottieInstance}
                className="h-[100vw] w-[100vw] max-w-150"
                src="/lotties/sad.lottie"
                loop={false}
                autoplay
                speed={0.5}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3 px-4 pb-6">
            {/* Add to Telegram Sticker Pack Button */}
            {content?.telegramPackURL && content?.token && (
              <div className="space-y-2">
                <div className="text-tg-hint px-1 text-xs font-medium">
                  Sticker Pack:
                </div>
                <a
                  href={content.telegramPackURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-tg-button text-tg-button-text flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95"
                >
                  <span className="text-sm font-medium">
                    Add Sticker Pack {content.token.contract.name} #
                    {content.token.id}
                  </span>
                </a>
              </div>
            )}

            {/* Share Section */}
            <div className="space-y-2">
              <div className="text-tg-hint px-1 text-xs font-medium">
                Share:
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2">
                {/* Share to Telegram/WhatsApp */}
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="bg-tg-button flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSharing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="text-sm font-medium text-white">
                        Sharing...
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-white">
                      Telegram
                    </span>
                  )}
                </button>

                {/* Share to Giphy */}
                <button
                  onClick={handleShareToGiphy}
                  disabled={!content?.id || isGiphySharing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6157ff] via-[#a640ff] to-[#ff0099] px-4 py-2.5 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGiphySharing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="text-sm font-medium text-white">
                        Sharing...
                      </span>
                    </>
                  ) : giphyShareSuccess ? (
                    <>
                      <span className="text-sm font-medium text-white">
                        ✓ Shared!
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-white">
                        Giphy
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Buttons */}
      {contentUrl && (
        <TelegramDualButtons
          mainButton={{
            text: 'Go to Feed',
            onClick: handleBackToFeed,
            visible: true,
          }}
          secondaryButton={{
            text: 'Save Image',
            onClick: handleDownload,
            loading: isDownloading,
            visible: true,
            position: 'top',
          }}
        />
      )}
    </div>
  );
}
