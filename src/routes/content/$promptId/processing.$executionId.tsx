import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { z } from 'zod';
import { useSession } from '@/auth/SessionProvider';
import { useContentGenerationStatus } from '@/hooks/useContents';
import { useLaunchParams, requestWriteAccess } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { FaChevronDown } from 'react-icons/fa';

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
  useSession();
  const { isTelegram } = useTelegramTheme();

  // Poll execution status
  const { data: execution, error } = useContentGenerationStatus(executionId);

  // Fake timer state
  const [fakeProgress, setFakeProgress] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // Fake timer effect - use fixed 90s duration since we don't have type info
  useEffect(() => {
    if (!execution || (execution.status !== 'processing' && execution.status !== 'pending')) return;

    const duration = 90000; // 1.5 minutes default
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / duration) * 100, 99);
      setFakeProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [execution]);

  // Auto-navigate to success when completed
  useEffect(() => {
    if (execution?.status === 'completed' && execution.content_id) {
      // Small delay to let user see the completion state
      const timer = setTimeout(() => {
        navigate({
          to: '/content/$promptId/success',
          params: { promptId },
          search: {
            executionId: execution.content_id,
          },
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [execution?.status, execution?.content_id, promptId, navigate]);

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

  // Failed/error execution state
  if (execution?.status === 'error') {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Generation Failed
          </h2>
          <p className="text-tg-hint mb-4">
            {execution.error || 'Something went wrong during generation'}
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

  // Processing state - use fake timer progress
  const progressPercentage = fakeProgress;

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="px-2">
          {/* Processing Title */}
          <div className="pt-6 pb-6 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Link to="/community">
                <FaChevronDown className="text-tg-text cursor-pointer transition-opacity hover:opacity-70" />
              </Link>
              <h1 className="text-tg-text text-2xl font-bold">
                Creating Your Content...
              </h1>
            </div>
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
            <blockquote className="border-tg-link bg-tg-secondary-bg flex flex-col items-center justify-center gap-2 border-l-4 p-4">
              <p className="text-tg-hint text-sm">
                You can close this page — we'll notify you when ready
              </p>
              <Link
                to="/profile"
                className="text-tg-link text-sm font-medium hover:underline"
              >
                Go to Profile
              </Link>
            </blockquote>

            {/* Enable Notifications if not already enabled */}
            {isTelegram && <EnableNotifications />}
          </div>
        </div>
      </div>
    </div>
  );
}
