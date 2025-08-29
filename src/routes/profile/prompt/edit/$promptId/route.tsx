import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PromptBar } from '@/components/Prompt/PromptBar';
import { useSession } from '@/auth/SessionProvider';
import { useGetPrompt } from '@/hooks/usePrompts';
import {
  SelectedNFTsProvider,
  useSelectedNFTs,
} from '@/contexts/SelectedNFTsContext';
import { useSettings } from '@/contexts/SettingsContext';

export const Route = createFileRoute('/profile/prompt/edit/$promptId')({
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
  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);
  const { selectedNFTs, setSelectedNFTs } = useSelectedNFTs();
  const { settingsOpen, setSettingsOpen } = useSettings();

  if (isLoading) return <div>Loading prompt...</div>;

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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PromptBar
        prompt={prompt}
        selectedNFTs={selectedNFTs}
        setSelectedNFTs={setSelectedNFTs}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />
      <div className="flex-1 overflow-y-hidden">
        <Outlet />
      </div>
    </div>
  );
}
