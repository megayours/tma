import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
import { Button } from '@telegram-apps/telegram-ui';
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

  // Feedback state
  const [selectedFeedback, setSelectedFeedback] =
    useState<PromptFeedbackSentiment | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [winnerLottieInstance, setWinnerLottieInstance] =
    useState<DotLottie | null>(null);
  const [sadLottieInstance, setSadLottieInstance] = useState<DotLottie | null>(
    null
  );
  const hasSubmittedFeedback = useRef(false);

  // Fetch execution data if executionId is provided
  const { data: execution, isLoading } = useContentExecution(
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

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 px-2">
          {/* Success Title */}
          <div className="pb-2 text-center">
            <h1 className="text-tg-text text-2xl font-bold">
              Content Generated!
            </h1>
          </div>

          {/* Generated Content Display */}
          <div className="flex justify-center">
            <div className="bg-tg-bg max-w-150 overflow-hidden rounded-2xl">
              <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                {contentUrl ? (
                  <img
                    src={contentUrl}
                    alt="Generated content"
                    className="w-full max-w-100 object-contain"
                  />
                ) : (
                  <div className="text-tg-hint text-sm">
                    Content preview not available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          {execution?.id && (
            <div className="flex items-center justify-center gap-3 px-2">
              <div className="relative">
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`flex h-10 w-20 items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                    selectedFeedback === 'positive'
                      ? 'border-tg-button text-tg-button shadow-md'
                      : 'text-tg-hint border-tg-section-separator hover:bg-tg-section-bg/80 active:scale-95'
                  }`}
                  aria-label="Thumbs up"
                >
                  <FaThumbsUp className="h-5 w-10" />
                </button>
                {/* Winner Animation */}
                {showAnimation && selectedFeedback === 'positive' && (
                  <DotLottieReact
                    dotLottieRefCallback={setWinnerLottieInstance}
                    className="pointer-events-none absolute top-0 left-0 z-50 h-[120vw] w-[120vw] -translate-x-[35%] -translate-y-[35%]"
                    src="/lotties/stars4s.lottie"
                    loop={false}
                    autoplay
                  />
                )}
              </div>
              <button
                onClick={() => handleFeedback('negative')}
                className={`bg-tg-bg z-50 flex h-10 w-20 items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                  selectedFeedback === 'negative'
                    ? 'border-tg-button text-tg-button shadow-md'
                    : 'text-tg-hint border-tg-section-separator hover:bg-tg-section-bg/80 active:scale-95'
                }`}
                aria-label="Thumbs down"
              >
                <FaThumbsDown className="h-5 w-10" />
              </button>
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
          <div className="space-y-3 px-2">
            {contentUrl && (
              <a
                href={contentUrl}
                download
                className="bg-tg-button text-tg-button-text block w-full rounded-xl px-6 py-3 text-center font-semibold shadow-md transition-all active:scale-95"
              >
                Download Content
              </a>
            )}

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
    </div>
  );
}
