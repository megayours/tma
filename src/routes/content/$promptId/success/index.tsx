import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useSession } from '@/auth/SessionProvider';
import { useContentExecution } from '@/hooks/useContents';
import { Button } from '@telegram-apps/telegram-ui';
import { SpinnerFullPage } from '@/components/ui';

const successSearchSchema = z.object({
  executionId: z.string().optional(),
});

export const Route = createFileRoute('/content/$promptId/success/')({
  validateSearch: successSearchSchema,
  component: SuccessPage,
});

function SuccessPage() {
  const { promptId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useSession();

  // Fetch execution data if executionId is provided
  const { data: execution, isLoading } = useContentExecution(
    search.executionId || '',
    session,
    {
      enabled: !!search.executionId,
    }
  );

  const handleBackToFeed = () => {
    navigate({ to: '/feed' });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading..." />;
  }

  const contentUrl = execution?.content_url;

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="px-2">
          {/* Success Title */}
          <div className="pb-2 text-center">
            <h1 className="text-tg-text mb-2 text-2xl font-bold">
              Content Generated!
            </h1>
            <p className="text-tg-hint text-sm">
              Your personalized content is ready
            </p>
          </div>

          {/* Generated Content Display */}
          {contentUrl ? (
            <div className="bg-tg-bg mb-6 overflow-hidden rounded-2xl">
              <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <img
                  src={contentUrl}
                  alt="Generated content"
                  className="w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="bg-tg-bg text-tg-hint mb-6 flex h-64 items-center justify-center rounded-2xl">
              Content preview not available
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
