import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useSession } from '@/auth/SessionProvider';
import { useCreatePromptMutation } from '@/hooks/usePrompts';
import { Button } from '@telegram-apps/telegram-ui';

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
      <div className="flex h-screen flex-col gap-6 p-6">
        {!selectedType ? (
          <>
            <div>
              <h1 className="text-tg-text text-3xl font-bold">
                Create New Prompt
              </h1>
              <p className="text-tg-hint mt-2">
                Select the type of content you want to create
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                onClick={() => handleTypeSelect('images')}
                className="bg-tg-secondary-bg hover:bg-tg-bg border-tg-hint/20 flex flex-col items-center gap-4 rounded-xl border p-8 transition-all hover:scale-105"
              >
                <span className="text-6xl">🖼️</span>
                <div className="text-center">
                  <h3 className="text-tg-text text-xl font-semibold">Image</h3>
                  <p className="text-tg-hint mt-1 text-sm">
                    Create static images
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('videos')}
                className="bg-tg-secondary-bg hover:bg-tg-bg border-tg-hint/20 flex flex-col items-center gap-4 rounded-xl border p-8 transition-all hover:scale-105"
              >
                <span className="text-6xl">🎬</span>
                <div className="text-center">
                  <h3 className="text-tg-text text-xl font-semibold">GIF</h3>
                  <p className="text-tg-hint mt-1 text-sm">
                    Create animated GIFs
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('stickers')}
                className="bg-tg-secondary-bg hover:bg-tg-bg border-tg-hint/20 flex flex-col items-center gap-4 rounded-xl border p-8 transition-all hover:scale-105"
              >
                <span className="text-6xl">😊</span>
                <div className="text-center">
                  <h3 className="text-tg-text text-xl font-semibold">
                    Sticker
                  </h3>
                  <p className="text-tg-hint mt-1 text-sm">
                    Create static stickers
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('animated_stickers')}
                className="bg-tg-secondary-bg hover:bg-tg-bg border-tg-hint/20 flex flex-col items-center gap-4 rounded-xl border p-8 transition-all hover:scale-105"
              >
                <span className="text-6xl">✨</span>
                <div className="text-center">
                  <h3 className="text-tg-text text-xl font-semibold">
                    Animated Sticker
                  </h3>
                  <p className="text-tg-hint mt-1 text-sm">
                    Create animated stickers
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <button
                onClick={() => setSelectedType(null)}
                className="text-tg-link mb-4 flex items-center gap-2 hover:opacity-80"
              >
                ← Back
              </button>
              <div className="flex items-center gap-3">
                <span className="text-5xl">{getTypeEmoji()}</span>
                <div>
                  <h1 className="text-tg-text text-3xl font-bold">
                    Name Your {getTypeName()}
                  </h1>
                  <p className="text-tg-hint mt-1">
                    Give your prompt a memorable name
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-tg-text font-medium">Prompt Name</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={promptName}
                  onChange={e => setPromptName(e.target.value)}
                  placeholder="Enter a name for your prompt"
                  className="bg-tg-secondary-bg text-tg-text placeholder:text-tg-hint border-tg-hint/20 focus:border-tg-link rounded-xl border px-4 py-3 outline-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && promptName.trim()) {
                      handleCreate();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
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
            </div>

            {isPending && (
              <div className="text-tg-hint text-center">
                Creating your prompt...
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
