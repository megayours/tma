import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
import { Button } from '@telegram-apps/telegram-ui';
import { SpinnerFullPage } from '@/components/ui';
import {
  FaThumbsUp,
  FaThumbsDown,
} from 'react-icons/fa';
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
import { TelegramMainButton } from '@/components/TelegramMainButton';
import { TelegramSecondaryButton } from '@/components/TelegramSecondaryButton';
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
  const { data: execution, isLoading } = useContentExecution(
    search.executionId || '',
    session,
    {
      enabled: !!search.executionId,
    }
  );

  console.log('Exection data in SuccessPage:', execution, search.executionId);

  // Feedback mutation
  const { mutate: submitFeedback } = usePromptFeedbackMutation(session, {
    onSuccess: () => {
      console.log('Feedback submitted successfully');
    },
    onError: error => {
      console.error('Failed to submit feedback:', error);
    },
  });

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
    if (!execution?.id) return;

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
        contentId: execution.id,
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

  const contentUrl = execution?.url;
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
      const fileName = `artwork-${execution?.id || promptId}.${extension}`;
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
        import.meta.env.VITE_PUBLIC_BOT_URL,
        `/content/${promptId}/details`,
        selectedCommunity?.id
      );
      const shareTitle = execution?.prompt?.name || 'Check out my creation!';
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
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="flex flex-col pt-6 pb-10 sm:px-6">
          {/* Success Title */}
          <div className="flex flex-row items-center justify-between px-6">
            <h1 className="text-tg-text text-lg font-semibold">
              {execution?.prompt?.name || 'Tadaa! 🎉'}
            </h1>
          </div>

          {/* Generated Content Display */}
          <div className="flex justify-center px-4">
            <div className="gap- flex w-full max-w-md flex-col">
              <div className="bg-tg-bg mt-2 overflow-hidden rounded-2xl shadow-sm">
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

          {/* Feedback Section */}
          {execution?.id && (
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
              <GenerateAgainButton execution={execution} promptId={promptId} />
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
          <div className="space-y-4 px-4 pb-6">
            <Button
              mode="plain"
              size="l"
              onClick={handleBackToFeed}
              className="w-full"
            >
              Back to Feed
            </Button>
          </div>
        </div>
      </div>

      {/* Telegram Buttons */}
      {contentUrl && (
        <>
          <TelegramMainButton
            text="Save Image"
            onClick={handleDownload}
            loading={isDownloading}
            visible={true}
          />
          <TelegramSecondaryButton
            text="Share"
            onClick={handleShare}
            loading={isSharing}
            visible={true}
            position="top"
          />
        </>
      )}
    </div>
  );
}
