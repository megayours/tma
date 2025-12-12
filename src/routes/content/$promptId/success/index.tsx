import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { set, z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
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
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { TelegramShareButton } from './TelegramShareButton';
import { GiphyShareButton } from './GiphyShareButton';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';

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
  const [isGiphyEnabled, setIsGiphyEnabled] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
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

  // Check if Giphy integration is enabled for the current content
  useEffect(() => {
    if (
      !content?.token?.contract?.chain ||
      !content?.token?.contract?.address ||
      !selectedCommunity?.collections
    ) {
      setIsGiphyEnabled(false);
      return;
    }

    // Find matching collection by chain + address
    const contentCollection = selectedCommunity.collections.find(
      c =>
        c.chain === content.token?.contract?.chain &&
        c.address === content.token?.contract?.address
    );

    if (!contentCollection) {
      setIsGiphyEnabled(false);
      return;
    }

    // Giphy only supports animated content (GIFs, videos, animated stickers)
    const isGiphyContent = content.type !== 'image';

    const hasGiphyIntegration =
      contentCollection.integrations?.some(
        i => i.type === 'giphy' && i.enabled
      ) || false;

    setIsGiphyEnabled(isGiphyContent && hasGiphyIntegration);
  }, [content, selectedCommunity]);

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

      // Set initial debug info
      setDebugInfo(
        `
isTelegram: ${isTelegram}
isMobileDevice: ${isMobileDevice}
contentUrl: ${contentUrl ? 'exists' : 'missing'}
      `.trim()
      );

      // On Telegram Desktop, use direct URL instead of blob
      if (isTelegram && !isMobileDevice) {
        setDebugInfo(
          prev => prev + '\n🖥️ Telegram Desktop path - opening in new tab'
        );
        // Open in new tab for Telegram Desktop
        window.open(contentUrl, '_blank');

        if (isTelegram) {
          triggerHapticImpact('light');
        }
        return; // Early return - finally block will clean up
      }

      setDebugInfo(prev => prev + '\n📱 Fetching blob...');

      const response = await fetch(contentUrl);
      setDebugInfo(prev => prev + `\n✓ Got response: ${response.status}`);

      if (!response.ok) {
        throw new Error('Unable to download content');
      }

      const blob = await response.blob();
      setDebugInfo(prev => prev + `\n✓ Got blob: ${blob.size} bytes`);

      const mimeType = blob.type || 'image/png';
      const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
      const fileName = `artwork-${content?.id || promptId}.${extension}`;
      const file = new File([blob], fileName, { type: mimeType });
      setDebugInfo(prev => prev + `\n✓ Created file: ${fileName}`);

      // Check conditions
      const canShareThisFile = navigator.canShare
        ? navigator.canShare({ files: [file] })
        : false;

      setDebugInfo(
        prev =>
          prev +
          `
\n---
isMobile: ${isMobileDevice}
canShareFiles: ${canShareFiles}
canShareThisFile: ${canShareThisFile}
mimeType: ${mimeType}
blobSize: ${blob.size}
      `.trim()
      );

      // Check conditions
      const canShareThisFile = navigator.canShare
        ? navigator.canShare({ files: [file] })
        : false;

      // Mobile: use share API to save to camera roll
      if (isMobileDevice && canShareFiles && canShareThisFile) {
        setDebugInfo(prev => prev + '\n✅ Opening share dialog...');
        await navigator.share({
          files: [file],
          title: 'Save your artwork',
          text: 'Choose "Save Image" to store this in your camera roll.',
        });
      } else {
        setDebugInfo(prev => prev + '\n⚠️ Using direct download');
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
    } catch (error: any) {
      // User canceled the share dialog - not an error
      if (error?.name === 'AbortError') {
        setDebugInfo(prev => prev + '\n❌ Share canceled by user');
        return; // Don't show error haptic for user cancellation
      }

      setDebugInfo(prev => prev + `\n❌ ERROR: ${error?.message || error}`);
      console.error('Failed to download content:', error);
      if (isTelegram) {
        triggerHapticNotification('error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Content */}
      <div className="scrollbar-hide">
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
                <div className="bg-tg-bg relative overflow-hidden rounded-2xl shadow-sm">
                  <div className="flex aspect-square items-center justify-center rounded-2xl">
                    {contentUrl ? (
                      <MediaDisplay
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

          {/* Debug Info */}
          {debugInfo && (
            <div className="mx-4 mt-4 rounded-lg bg-yellow-100 p-3 font-mono text-xs dark:bg-yellow-900">
              <div className="mb-1 font-bold">Debug Info:</div>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}

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

            {/* Primary Actions Section */}
            <div className="space-y-3">
              <div className="text-tg-hint px-1 text-xs font-medium">
                Actions:
              </div>

              {/* Telegram Share - Full Width Primary */}
              <TelegramShareButton
                fullWidth={true}
                promptId={promptId}
                contentPromptName={content?.prompt?.name}
                communityId={selectedCommunity?.id}
              />

              {/* Save Content - Full Width Secondary */}
              <button
                onClick={handleDownload}
                disabled={!contentUrl || isDownloading}
                className="bg-tg-section-bg text-tg-text border-tg-section-separator hover:bg-tg-section-bg/80 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 shadow-sm transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="text-base font-medium">Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span className="text-base font-medium">
                      Save{' '}
                      {content?.type
                        ? content.type.charAt(0).toUpperCase() +
                          content.type.slice(1)
                        : 'Content'}
                    </span>
                  </>
                )}
              </button>
              {/* Giphy Section */}
              {isGiphyEnabled && content?.id && (
                <GiphyShareButton
                  contentId={content.id}
                  contentType={content.type}
                  collectionChain={content.token?.contract?.chain}
                  collectionAddress={content.token?.contract?.address}
                  collections={selectedCommunity?.collections}
                  giphyUrl={
                    content.integrations?.find(i => i.integration === 'giphy')
                      ?.url
                  }
                />
              )}
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
        />
      )}
    </div>
  );
}
