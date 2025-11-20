import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { z } from 'zod';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
import { useLaunchParams, requestWriteAccess } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';

const processingSearchSchema = z.object({
  nft: z.string().optional(),
});

export const Route = createFileRoute(
  '/content/$promptId/processing/$executionId'
)({
  validateSearch: processingSearchSchema,
  component: ProcessingPage,
});

const EnableNotifications = () => {
  const launchParams = useLaunchParams(true);
  const allowsWriteToPm = launchParams?.tgWebAppData?.user?.allowsWriteToPm;

  const handleEnableNotifications = () => {
    if (requestWriteAccess.isAvailable()) {
      requestWriteAccess();
    }
  };

  if (!allowsWriteToPm) {
    return (
      <div className="bg-tg-secondary-bg mx-auto max-w-md rounded-xl p-4">
        <button
          onClick={handleEnableNotifications}
          className="bg-tg-button text-tg-button-text w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:brightness-110 active:scale-95"
        >
          Enable Notifications <span className="text-sm">🔔</span>
        </button>
      </div>
    );
  }

  return null;
};

function ProcessingPage() {
  const { promptId, executionId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { isTelegram } = useTelegramTheme();

  // Poll execution status
  const { data: execution, error } = useContentExecution(executionId, session);

  // Fake timer state
  const [fakeProgress, setFakeProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // Calculate duration based on content type
  const getDurationMs = (type?: string): number => {
    switch (type) {
      case 'image':
        return 90000; // 1.5 minutes
      case 'sticker':
      case 'animated_sticker':
        return 180000; // 3 minutes
      case 'video':
        return 300000; // 5 minutes
      default:
        return 90000; // default to 1.5 minutes
    }
  };

  // Fake timer effect
  useEffect(() => {
    if (!execution || execution.status !== 'processing') return;

    const duration = getDurationMs(execution.type);
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / duration) * 100, 99);
      setFakeProgress(progress);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [execution]);

  // Auto-navigate to success when completed
  useEffect(() => {
    if (execution?.status === 'completed') {
      // Small delay to let user see the completion state
      const timer = setTimeout(() => {
        navigate({
          to: '/content/$promptId/success',
          params: { promptId },
          search: {
            executionId,
          },
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [execution?.status, promptId, executionId, navigate]);

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Generation Failed
          </h2>
          <p className="text-tg-hint mb-4">
            {error.message || 'Something went wrong'}
          </p>
          <button
            onClick={() =>
              navigate({
                to: '/content/$promptId/select-nfts',
                params: { promptId },
              })
            }
            className="bg-tg-button text-tg-button-text rounded-lg px-6 py-3 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Failed execution state
  if (execution?.status === 'failed') {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Generation Failed
          </h2>
          <p className="text-tg-hint mb-4">
            {execution.error ||
              'Something went wrong during generation'}
          </p>
          <button
            onClick={() =>
              navigate({
                to: '/content/$promptId/select-nfts',
                params: { promptId },
              })
            }
            className="bg-tg-button text-tg-button-text rounded-lg px-6 py-3 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Processing state - use real progress if available, otherwise use fake timer
  const progressPercentage = execution?.progressPercentage ?? fakeProgress;

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="px-2">
          {/* Processing Title */}
          <div className="pt-6 pb-6 text-center">
            <h1 className="text-tg-text mb-2 text-2xl font-bold">
              Creating Your Content...
            </h1>
            <p className="text-tg-hint text-sm">
              This usually takes 1-3 minutes
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 px-4">
            <div className="bg-tg-section-bg relative h-3 overflow-hidden rounded-full shadow-inner">
              <div
                className="bg-tg-button h-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-tg-hint mt-3 text-center text-base font-semibold">
              {Math.round(progressPercentage)}%
            </p>
          </div>

          {/* Info Section */}
          <div className="space-y-4 px-4">
            <div className="bg-tg-bg rounded-2xl p-4">
              <p className="text-tg-hint text-center text-sm">
                We're personalizing your content with your NFT
              </p>
            </div>

            {/* Notification */}
            <blockquote className="border-tg-link bg-tg-secondary-bg border-l-4 p-4">
              <p className="text-tg-hint text-sm">
                You can close this page — we'll notify you when ready
              </p>
            </blockquote>

            {/* Enable Notifications if not already enabled */}
            {isTelegram && <EnableNotifications />}
          </div>
        </div>
      </div>
    </div>
  );
}
