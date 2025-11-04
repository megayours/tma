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

  const handleGenerateAnother = () => {
    navigate({
      to: '/content/$promptId/select-nfts',
      params: { promptId },
    });
  };

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
      <div className="scrollbar-hide flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Icon */}
          <div className="mb-6 text-6xl">🎉</div>

          {/* Title */}
          <h1 className="text-tg-text mb-3 text-3xl font-bold">
            Your Content is Ready!
          </h1>

          <p className="text-tg-hint mb-8 text-base">
            Your personalized content has been generated successfully
          </p>

          {/* Generated Content Display */}
          {contentUrl ? (
            <div className="bg-tg-section-bg mb-8 overflow-hidden rounded-lg">
              <div className="flex items-center justify-center bg-white p-8">
                <img
                  src={contentUrl}
                  alt="Generated content"
                  className="max-h-96 w-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="bg-tg-section-bg text-tg-hint mb-8 flex h-64 items-center justify-center rounded-lg">
              Content preview not available
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {contentUrl && (
              <a
                href={contentUrl}
                download
                className="bg-tg-button text-tg-button-text block w-full rounded-lg px-6 py-3 font-semibold transition-opacity hover:opacity-90"
              >
                Download
              </a>
            )}

            <Button
              mode="outline"
              size="l"
              onClick={handleGenerateAnother}
              className="w-full"
            >
              Generate Another
            </Button>

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
