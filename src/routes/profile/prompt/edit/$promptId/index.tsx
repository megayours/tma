import { createFileRoute } from '@tanstack/react-router';
import { PromptEditor } from '@/components/Prompt/PromptEditor';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';

export const Route = createFileRoute('/profile/prompt/edit/$promptId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { promptId } = Route.useParams();
  const { selectedNFTs, setSelectedNFTs } = useSelectedNFTs();

  return (
    <PromptEditor
      promptId={promptId}
      selectedNFTs={selectedNFTs}
      setSelectedNFTs={setSelectedNFTs}
    />
  );
}
