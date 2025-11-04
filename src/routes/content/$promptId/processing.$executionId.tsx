import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
import { Spinner } from '@/components/ui';

const processingSearchSchema = z.object({
  nft: z.string().optional(),
});

export const Route = createFileRoute(
  '/content/$promptId/processing/$executionId'
)({
  validateSearch: processingSearchSchema,
  component: ProcessingPage,
});

function ProcessingPage() {
  const { promptId, executionId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  // Poll execution status
  const { data: execution, error } = useContentExecution(executionId, session);

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
            {execution.error_message || 'Something went wrong during generation'}
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

  // Processing state
  const progressPercentage = execution?.progress_percentage || 0;

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* Spinner */}
        <div className="mb-8">
          <Spinner size="lg" />
        </div>

        {/* Title */}
        <h2 className="text-tg-text mb-3 text-2xl font-bold">
          Creating Your Content...
        </h2>

        {/* Progress */}
        {progressPercentage > 0 && (
          <div className="mb-4">
            <div className="bg-tg-section-bg mx-auto mb-2 h-2 w-64 overflow-hidden rounded-full">
              <div
                className="bg-tg-button h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-tg-hint text-sm">{progressPercentage}% complete</p>
          </div>
        )}

        {/* Description */}
        <p className="text-tg-hint mx-auto max-w-md">
          This usually takes 1-3 minutes. We're personalizing your content with
          your NFT...
        </p>

        {/* Tip */}
        <div className="bg-tg-accent-text/10 border-tg-accent-text mt-6 rounded-lg border p-4">
          <p className="text-tg-hint text-sm">
            💡 Tip: You can close this page and we'll notify you when it's ready
          </p>
        </div>
      </div>
    </div>
  );
}
