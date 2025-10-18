import { createFileRoute } from '@tanstack/react-router';
import { useGetPrompts } from '@/hooks/usePrompts';
import { useSession } from '../../../../auth/SessionProvider';
import { useState } from 'react';
import { StickerPromptCard, StickerCollectionBar, SpinnerFullPage } from '@/components/ui';
import type { Prompt } from '@/types/prompt';

export const Route = createFileRoute('/profile/my-sticker-packs/new/')({
  component: RouteComponent,
});

function StickerPacks({
  selectedPrompts,
  onPromptSelect,
  type = 'stickers',
}: {
  selectedPrompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
  type?: 'stickers' | 'animated_stickers';
}) {
  const { session } = useSession();
  const { data: prompts, isLoading } = useGetPrompts({
    session,
    promptFilters: {
      type,
    },
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    pagination: {
      page: 1,
      size: 10,
    },
  });
  console.log('PROMPTS', prompts);

  if (isLoading) {
    return <SpinnerFullPage text="Loading prompts..." />;
  }
  if (!prompts) {
    return <div>No prompts available</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {prompts?.prompts?.map(prompt => {
        const isSelected = selectedPrompts.some(p => p.id === prompt.id);
        return (
          <StickerPromptCard
            key={prompt.id}
            prompt={prompt}
            className={isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            onClick={() => {
              onPromptSelect(prompt);
            }}
          />
        );
      })}
    </div>
  );
}

function RouteComponent() {
  const [isStaticSticker, setIsStaticSticker] = useState(true);
  const [selectedPrompts, setSelectedPrompts] = useState<Prompt[]>([]);

  const handlePromptSelect = (prompt: Prompt) => {
    setSelectedPrompts(prev => {
      // Check if prompt is already selected
      const isAlreadySelected = prev.some(p => p.id === prompt.id);

      if (isAlreadySelected) {
        // Remove from selection
        return prev.filter(p => p.id !== prompt.id);
      } else {
        // Add to selection (max 10)
        if (prev.length >= 10) {
          console.warn('Maximum 10 prompts can be selected');
          return prev;
        }
        return [...prev, prompt];
      }
    });
  };

  const handleCreateCollection = () => {
    console.log('Creating collection with prompts:', selectedPrompts);
    // TODO: Implement collection creation logic
    // For now, just clear the selection
    setSelectedPrompts([]);
  };

  const handleClearSelection = () => {
    setSelectedPrompts([]);
  };

  return (
    <div>
      <div className="flex gap-2 p-4">
        <button
          onClick={() => setIsStaticSticker(true)}
          className={`rounded px-4 py-2 ${
            isStaticSticker ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Static
        </button>
        <button
          onClick={() => setIsStaticSticker(false)}
          className={`rounded px-4 py-2 ${
            !isStaticSticker ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Animated
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {isStaticSticker ? (
          <StickerPacks
            selectedPrompts={selectedPrompts}
            onPromptSelect={handlePromptSelect}
            type="stickers"
          />
        ) : (
          <StickerPacks
            selectedPrompts={selectedPrompts}
            onPromptSelect={handlePromptSelect}
            type="animated_stickers"
          />
        )}
      </div>

      {/* Fixed bottom bar - no portal needed! */}
      <StickerCollectionBar
        selectedPrompts={selectedPrompts}
        onCreateCollection={handleCreateCollection}
        onClear={handleClearSelection}
        maxPrompts={10}
      />
    </div>
  );
}
