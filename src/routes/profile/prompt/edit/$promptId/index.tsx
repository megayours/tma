import { createFileRoute } from '@tanstack/react-router';
import { PromptEditor } from '@/components/Prompt/PromptEditor';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';
import { usePromptContext } from '@/contexts/PromptContext';

export const Route = createFileRoute('/profile/prompt/edit/$promptId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { prompt } = usePromptContext();
  const { selectedNFTs, setSelectedNFTs } = useSelectedNFTs();

  return (
    <PromptEditor
      prompt={prompt}
      selectedNFTs={selectedNFTs}
      setSelectedNFTs={setSelectedNFTs}
    />
  );
}
