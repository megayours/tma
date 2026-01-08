import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PromptBar } from '@/components/Prompt/PromptBar';
import { useSession } from '@/auth/SessionProvider';
import { useGetPrompt } from '@/hooks/usePrompts';
import {
  SelectedNFTsProvider,
  useSelectedNFTs,
} from '@/contexts/SelectedNFTsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { PromptContext } from '@/contexts/PromptContext';
import { SpinnerFullPage } from '@/components/ui';
import { useSignal } from '@telegram-apps/sdk-react';
import { viewport } from '@telegram-apps/sdk-react';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

export const Route = createFileRoute(
  '/_main/profile/admin/prompt/edit/$promptId'
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SelectedNFTsProvider>
      <RouteContent />
    </SelectedNFTsProvider>
  );
}

function RouteContent() {
  const { promptId } = Route.useParams();
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const {
    data: prompt,
    isLoading,
    error,
  } = useGetPrompt(promptId, session, selectedCommunity);
  const { selectedNFTs, setSelectedNFTs } = useSelectedNFTs();
  const { settingsOpen, setSettingsOpen } = useSettings();
  const isViewportMounted = useSignal(viewport.isMounted);

  if (isLoading) return <SpinnerFullPage text="Loading prompt..." />;

  if (error) {
    const errorMessage = error.message;
    if (errorMessage.includes('not found')) {
      return (
        <div className="p-4 text-center">
          <h2 className="mb-2 text-xl font-semibold">Prompt Not Found</h2>
          <p className="text-gray-600">
            The prompt you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
        </div>
      );
    }
    return (
      <div className="p-4 text-center">
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="text-red-600">{errorMessage}</p>
      </div>
    );
  }

  if (!prompt) return <div>Prompt not found</div>;

  const promptContextValue = {
    prompt: prompt!,
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PromptBar
        prompt={prompt}
        selectedNFTs={selectedNFTs}
        setSelectedNFTs={setSelectedNFTs}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />
      <div
        className={`${isViewportMounted ? 'h-[calc(100vh-11rem)]' : 'h-[calc(100vh-9rem)]'} overflow-y-hidden`}
      >
        <PromptContext.Provider value={promptContextValue}>
          <Outlet />
        </PromptContext.Provider>
      </div>
    </div>
  );
}
