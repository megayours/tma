import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
import { SpinnerFullPage } from '@/components/ui';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { IoSend, IoInformationCircle } from 'react-icons/io5';
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
import { GiphyShareButton } from './GiphyShareButton';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';
import { buildShareUrl } from '@/utils/shareUrl';
import {
  downloadTelegramFile,
  canDownloadFile,
} from '@/utils/telegramDownload';

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
  const isMobileDevice = useMemo(() => {
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
  }, []);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isGiphyEnabled, setIsGiphyEnabled] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const hasSubmittedFeedback = useRef(false);

  // Fetch execution data if executionId is provided
  const { data: content, isLoading } = useContentExecution(
    search.executionId || '',
    session,
    {
      enabled: !!search.executionId,
      preferredFormats: isMobileDevice ? 'gif' : 'webm',
    }
  );

  console.log('EXECUTION CONTENTE:', content);

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

  const handleTelegramShare = async () => {
    try {
      setIsSharing(true);
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
        await navigator.clipboard.writeText(shareUrl);
        if (isTelegram) {
          triggerHapticImpact('light');
        }
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

  const handleBackToFeed = () => {
    navigate({ to: '/community' });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  const contentUrl = content?.url;
  const displayUrl = contentUrl;
  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  const handleDownload = async () => {
    console.log('[Download] Starting download...', {
      contentUrl,
      isTelegram,
      isMobileDevice,
      canDownloadFile: canDownloadFile(),
    });

    if (!contentUrl) {
      console.log('[Download] No contentUrl, aborting');
      return;
    }

    try {
      setIsDownloading(true);

      // Determine file extension from URL or content type
      const urlExtension = contentUrl.split('.').pop()?.split('?')[0] || 'png';
      const fileName = `artwork-${content?.id || promptId}.${urlExtension}`;
      console.log('[Download] File name:', fileName);

      // Try Telegram SDK downloadFile first (most reliable for Telegram)
      if (canDownloadFile()) {
        console.log('[Download] Using Telegram SDK downloadFile');
        try {
          const success = await downloadTelegramFile(contentUrl, fileName);
          if (success) {
            triggerHapticImpact('light');
            setDownloadSuccess(true);
            console.log('[Download] Telegram download completed successfully');
            return;
          }
        } catch (error) {
          console.error('[Download] Telegram SDK download failed:', error);
          // Fall through to other methods
        }
      }

      // Telegram Desktop (without downloadFile): Open in new tab
      if (isTelegram && !isMobileDevice) {
        console.log('[Download] Telegram Desktop - opening in new tab');
        window.open(contentUrl, '_blank');
        triggerHapticImpact('light');
        return;
      }

      // Non-Telegram: Fetch and download
      console.log('[Download] Fallback path - fetching blob');
      const response = await fetch(contentUrl, {
        mode: 'cors',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Unable to download content');
      }

      const blob = await response.blob();
      const mimeType = blob.type || 'image/png';
      const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
      const blobFileName = `artwork-${content?.id || promptId}.${extension}`;
      const file = new File([blob], blobFileName, { type: mimeType });
      console.log('[Download] Blob created:', { mimeType, blobFileName, size: blob.size });

      // Check conditions
      const canShareThisFile = navigator.canShare
        ? navigator.canShare({ files: [file] })
        : false;
      console.log('[Download] Share conditions:', { canShareFiles, canShareThisFile, isMobileDevice });

      // Mobile (non-Telegram): use share API to save to camera roll
      if (isMobileDevice && canShareFiles && canShareThisFile) {
        console.log('[Download] Using navigator.share for mobile');
        await navigator.share({
          files: [file],
          title: 'Save your artwork',
          text: 'Choose "Save Image" to store this in your camera roll.',
        });
      } else {
        // Desktop (non-Telegram): direct download
        console.log('[Download] Using anchor download for desktop');
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = blobFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }

      if (isTelegram) {
        triggerHapticImpact('light');
      }
      setDownloadSuccess(true);
      console.log('[Download] Download completed successfully');
    } catch (error: any) {
      // User canceled the share dialog - not an error
      if (error?.name === 'AbortError') {
        console.log('[Download] User cancelled share dialog');
        return; // Don't show error haptic for user cancellation
      }

      console.error('[Download] Failed to download content:', error);
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
                    {displayUrl ? (
                      <MediaDisplay
                        src={displayUrl}
                        alt="Generated content"
                        className="h-full w-full rounded-xl object-contain"
                        poster={content?.thumbnailUrl || '/logo.png'}
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
            <div className="mt-2 flex items-center justify-between gap-1.5 px-4">
              {/* Positive Button (with centered Lottie) */}
              <div className="relative flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`flex h-8 w-10 items-center justify-center rounded-lg border-2 text-lg transition-all ${
                    selectedFeedback === 'positive'
                      ? 'border-tg-button text-tg-button shadow-md'
                      : 'text-tg-hint border-tg-section-separator hover:bg-tg-section-bg/80 active:scale-95'
                  }`}
                  aria-label="Thumbs up"
                >
                  <FaThumbsUp className="h-4 w-4" />
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
                  className={`flex h-8 w-10 items-center justify-center rounded-lg border-2 text-lg transition-all ${
                    selectedFeedback === 'negative'
                      ? 'border-tg-button text-tg-button shadow-md'
                      : 'text-tg-hint border-tg-section-separator hover:bg-tg-section-bg/80 active:scale-95'
                  }`}
                  aria-label="Thumbs down"
                >
                  <FaThumbsDown className="h-4 w-4" />
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

          {/* Action Buttons - Single Line */}
          <div className="mt-2 px-4 pb-6">
            {/* With Sticker Pack: All in one row */}
            {content?.telegramPackURL && content?.token && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {/* Share Icon */}
                  <button
                    onClick={handleTelegramShare}
                    disabled={isSharing}
                    className="border-tg-section-separator bg-tg-section-bg text-tg-text hover:bg-tg-section-bg/80 flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Share to Telegram"
                  >
                    {isSharing ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <IoSend className="h-6 w-6" />
                    )}
                  </button>

                  {/* Download Icon */}
                  <button
                    onClick={handleDownload}
                    disabled={!contentUrl || isDownloading}
                    className="border-tg-section-separator bg-tg-section-bg text-tg-text hover:bg-tg-section-bg/80 flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Download content"
                  >
                    {isDownloading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <svg
                        className="h-6 w-6"
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
                    )}
                  </button>

                  {/* Sticker Pack Button - flex-1 fills remaining space */}
                  <a
                    href={content.telegramPackURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-tg-button text-tg-button-text flex h-12 flex-1 items-center justify-center gap-2 rounded-lg px-4 shadow-md transition-all duration-200 hover:opacity-90 active:scale-95"
                  >
                    <span className="text-xs font-medium">
                      Add Sticker Pack
                    </span>
                  </a>
                </div>

                {/* Sticker Pack Instructions */}
                <div className="bg-tg-section-bg border-tg-section-separator mt-2 flex gap-2 rounded-lg border px-3 py-2">
                  <IoInformationCircle className="text-tg-button mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p className="text-tg-hint text-xs leading-relaxed">
                    <span className="text-tg-text font-semibold">Already have this pack?</span> To see the latest sticker, <span className="text-tg-button font-medium">remove and re-add</span> it in Telegram.
                  </p>
                </div>
              </div>
            )}

            {/* Without Sticker Pack: Just icons */}
            {!content?.telegramPackURL && (
              <div className="flex items-center gap-2">
                {/* Share Icon */}
                <button
                  onClick={handleTelegramShare}
                  disabled={isSharing}
                  className="border-tg-section-separator bg-tg-section-bg text-tg-text hover:bg-tg-section-bg/80 flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Share to Telegram"
                >
                  {isSharing ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <IoSend className="h-6 w-6" />
                  )}
                </button>

                {/* Download Icon */}
                <button
                  onClick={handleDownload}
                  disabled={!contentUrl || isDownloading}
                  className="border-tg-section-separator bg-tg-section-bg text-tg-text hover:bg-tg-section-bg/80 flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Download content"
                >
                  {isDownloading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <svg
                      className="h-6 w-6"
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
                  )}
                </button>
              </div>
            )}

            {/* Giphy - Full Width Below */}
            {isGiphyEnabled && content?.id && (
              <div className="mt-3">
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
              </div>
            )}

            {/* Download Success Message */}
            {downloadSuccess && (
              <div className="bg-tg-button/10 border-tg-button/20 mt-3 flex items-center gap-2 rounded-lg border px-3 py-2">
                <svg
                  className="text-tg-button h-5 w-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-tg-text text-sm">
                  The image was saved to your gallery
                </p>
              </div>
            )}
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
