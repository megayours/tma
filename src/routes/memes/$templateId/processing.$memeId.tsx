import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useRef, useReducer } from 'react';
import { useMemePollStatus } from '@/hooks/useMemes';
import { FaChevronDown } from 'react-icons/fa';

export const Route = createFileRoute(
  '/memes/$templateId/processing/$memeId'
)({
  component: MemeProcessingPage,
});

function MemeProcessingPage() {
  const { templateId, memeId } = Route.useParams();
  const navigate = useNavigate();

  // Poll meme status
  const { data: status, error } = useMemePollStatus(memeId);

  const startTimeRef = useRef<number>(Date.now());
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Estimate duration (90 seconds default)
  const duration = 90000;
  const elapsed = Date.now() - startTimeRef.current;
  const progress = Math.min((elapsed / duration) * 100, 99);

  // Update progress periodically
  useEffect(() => {
    if (!status || status.status !== 'processing') {
      return;
    }

    const interval = setInterval(forceUpdate, 100);
    return () => clearInterval(interval);
  }, [status]);

  // Auto-navigate to success when completed
  useEffect(() => {
    if (status?.status === 'completed') {
      // Small delay to let user see the completion state
      const timer = setTimeout(() => {
        navigate({
          to: '/memes/$templateId/success',
          params: { templateId },
          search: {
            memeId,
          },
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status?.status, memeId, templateId, navigate]);

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
                to: '/memes/$templateId/select-characters',
                params: { templateId },
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

  // Failed/error status
  if (status?.status === 'error') {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Generation Failed
          </h2>
          <p className="text-tg-hint mb-4">
            {status.error || 'Something went wrong during generation'}
          </p>
          <button
            onClick={() =>
              navigate({
                to: '/memes/$templateId/select-characters',
                params: { templateId },
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

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="px-2">
          {/* Processing Title */}
          <div className="pt-6 pb-6 text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Link to="/memes">
                <FaChevronDown className="text-tg-text cursor-pointer transition-opacity hover:opacity-70" />
              </Link>
              <h1 className="text-tg-text text-2xl font-bold">
                Creating Your Meme...
              </h1>
            </div>
            <p className="text-tg-hint text-sm">
              This should take about 30-60 seconds
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 px-4">
            <div className="bg-tg-section-bg relative h-3 overflow-hidden rounded-full shadow-inner">
              <div
                className="bg-tg-button h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-tg-hint mt-3 text-center text-base font-semibold">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Info Section */}
          <div className="space-y-4 px-4">
            <div className="bg-tg-bg rounded-2xl p-4">
              <p className="text-tg-hint text-center text-sm">
                We're personalizing your meme with your characters and text.
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
          </div>
        </div>
      </div>
    </div>
  );
}
