import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useSession } from '@/auth/SessionProvider';
import { useCreatePromptMutation } from '@/hooks/usePrompts';
import { Button, Cell, Section, Input } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/profile/prompt/create')({
  component: CreatePromptComponent,
});

function CreatePromptComponent() {
  const { session } = useSession();
  const navigate = useNavigate();
  const { mutateAsync: createPrompt, isPending } = useCreatePromptMutation();
  const [selectedType, setSelectedType] = useState<
    'images' | 'videos' | 'stickers' | 'animated_stickers' | null
  >(null);
  const [promptName, setPromptName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTypeSelect = (
    type: 'images' | 'videos' | 'stickers' | 'animated_stickers'
  ) => {
    setSelectedType(type);
  };

  // Focus input when selectedType changes to a value
  useEffect(() => {
    if (selectedType && inputRef.current) {
      // Small timeout to ensure the input is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedType]);

  const handleCreate = async () => {
    if (!selectedType || !promptName.trim()) return;

    try {
      const prompt = await createPrompt({
        session,
        type: selectedType,
        name: promptName.trim(),
      });
      if (prompt) {
        navigate({
          to: `/profile/prompt/edit/${prompt.id}`,
        });
      }
    } catch (error) {
      console.error('Failed to create prompt:', error);
    }
  };

  const getTypeEmoji = () => {
    switch (selectedType) {
      case 'images':
        return '🖼️';
      case 'videos':
        return '🎬';
      case 'stickers':
        return '😊';
      case 'animated_stickers':
        return '✨';
      default:
        return '';
    }
  };

  const getTypeName = () => {
    switch (selectedType) {
      case 'images':
        return 'Image';
      case 'videos':
        return 'GIF';
      case 'stickers':
        return 'Sticker';
      case 'animated_stickers':
        return 'Animated Sticker';
      default:
        return '';
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        {!selectedType ? (
          <>
            <div className="p-6">
              <h1 className="text-tg-text text-2xl font-bold">
                Create New Prompt
              </h1>
              <p className="text-tg-hint mt-2 text-base">
                Select the type of content you want to create
              </p>
            </div>

            <Section header="MEMEs" className="mx-4">
              <Cell
                onClick={() => handleTypeSelect('images')}
                before={<span className="text-5xl">🖼️</span>}
                subtitle=""
                className="py-4"
              >
                <span className="text-lg">Image</span>
              </Cell>
              <Cell
                onClick={() => handleTypeSelect('videos')}
                before={<span className="text-5xl">🎬</span>}
                subtitle=""
                className="py-4"
              >
                <span className="text-lg">GIF</span>
              </Cell>
            </Section>

            <Section header="Stickers" className="mx-4">
              <Cell
                onClick={() => handleTypeSelect('stickers')}
                before={<span className="text-5xl">😊</span>}
                subtitle=""
                className="py-4"
              >
                <span className="text-lg">Sticker</span>
              </Cell>
              <Cell
                onClick={() => handleTypeSelect('animated_stickers')}
                before={<span className="text-5xl">✨</span>}
                subtitle=""
                className="py-4"
              >
                <span className="text-lg">Animated Sticker</span>
              </Cell>
            </Section>
          </>
        ) : (
          <>
            <div className="p-6">
              <button
                onClick={() => setSelectedType(null)}
                className="text-tg-link mb-4 flex items-center gap-2 text-base hover:opacity-80"
              >
                ← Back
              </button>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getTypeEmoji()}</span>
                <div>
                  <h1 className="text-tg-text text-2xl font-bold">
                    Name Your {getTypeName()}
                  </h1>
                  <p className="text-tg-hint mt-1 text-base">
                    Give your prompt a memorable name
                  </p>
                </div>
              </div>
            </div>

            <Section className="mx-4">
              <Input
                ref={inputRef}
                header="Prompt Name"
                placeholder="Enter a name for your prompt"
                value={promptName}
                onChange={e => setPromptName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && promptName.trim()) {
                    handleCreate();
                  }
                }}
              />
            </Section>

            <div className="p-6">
              <Button
                mode="filled"
                size="l"
                stretched
                onClick={handleCreate}
                disabled={isPending || !promptName.trim()}
              >
                {isPending ? 'Creating...' : 'Create Prompt'}
              </Button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
