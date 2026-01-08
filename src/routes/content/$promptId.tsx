import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { PromptContext } from '@/contexts/PromptContext';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

export const Route = createFileRoute('/content/$promptId')({
  component: ContentLayout,
});

function ContentLayout() {
  const { promptId } = Route.useParams();
  const { session, isAuthenticating } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const {
    data: prompt,
    isLoading,
    error,
  } = useGetPrompt(promptId, session, selectedCommunity);

  if (isAuthenticating) {
    return <SpinnerFullPage text="Authenticating..." />;
  }

  if (isLoading || selectedCommunity === null) {
    return <SpinnerFullPage text="Loading template details..." />;
  }

  if (error || !prompt) {
    return (
      <div className="bg-tg-bg text-tg-text flex h-screen items-center justify-center">
        <div className="mx-auto max-w-4xl p-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="mb-4 text-4xl">⚠️</div>
              <h2 className="text-tg-text mb-2 text-xl font-bold">
                Template Not Found
              </h2>
              <p className="text-tg-hint mb-4">
                {error?.message ||
                  'This template does not exist or is no longer available'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PromptContext.Provider value={{ prompt }}>
      <div className="bg-tg-bg text-tg-text h-screen">
        <Outlet />
      </div>
    </PromptContext.Provider>
  );
}
