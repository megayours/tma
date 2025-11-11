import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useSession } from '@/auth/SessionProvider';
import { useCreatePromptMutation } from '@/hooks/usePrompts';
import { Button } from '@telegram-apps/telegram-ui';
import { TgInput } from '@/components/ui/forms/TgInput';

export const Route = createFileRoute('/_main/profile/prompt/create')({
  component: CreatePromptComponent,
});

function CreatePromptComponent() {
  const { session } = useSession();
  const isMegaAdmin = session && parseInt(session.role) >= 2;
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
            <div className="p-4">
              <h1 className="text-tg-text text-2xl font-bold">
                Create New Prompt
              </h1>
              <p className="text-tg-hint mt-2 text-base">
                Select the type of content you want to create
              </p>
            </div>

            <div className="text-tg-text mx-4 flex flex-col gap-2">
              <h1 className="text-sm">MEMEs {isMegaAdmin && 'Admin'}</h1>
              <div
                onClick={() =>
                  !isMegaAdmin ? null : handleTypeSelect('images')
                }
                className="cursor-pointer"
              >
                <div
                  className={`border-tg-section-separator flex flex-row items-center gap-2 overflow-hidden rounded-2xl border p-4 ${!isMegaAdmin && 'bg-tg-secondary-bg'}`}
                >
                  <span className="text-5xl">🖼️</span>
                  <span className="text-lg">Image</span>
                  {!isMegaAdmin && (
                    <span className="text-tg-hint">(Coming Soon)</span>
                  )}
                </div>
              </div>
              <div
                onClick={() =>
                  !isMegaAdmin ? null : handleTypeSelect('videos')
                }
                className="cursor-pointer"
              >
                <div
                  className={`border-tg-section-separator flex flex-row items-center gap-2 overflow-hidden rounded-2xl border p-4 ${!isMegaAdmin && 'bg-tg-secondary-bg'}`}
                >
                  <span className="text-5xl">🎬</span>
                  <span className="text-lg">GIF</span>
                  {!isMegaAdmin && (
                    <span className="text-tg-hint">(Coming Soon)</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-tg-text mx-4 flex flex-col gap-2 pt-4">
              <h1 className="text-sm">Stickers</h1>
              <div
                onClick={() => handleTypeSelect('stickers')}
                className="cursor-pointer"
              >
                <div className="border-tg-section-separator flex flex-row items-center gap-2 overflow-hidden rounded-2xl border p-4">
                  <span className="text-5xl">😊</span>
                  <span className="text-lg">Sticker</span>
                </div>
              </div>
              <div
                onClick={() => handleTypeSelect('animated_stickers')}
                className="cursor-pointer"
              >
                <div className="border-tg-section-separator flex flex-row items-center gap-2 overflow-hidden rounded-2xl border p-4">
                  <span className="text-5xl">✨</span>
                  <span className="text-lg">Animated Sticker</span>
                </div>
              </div>
            </div>
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

            <div className="mx-4">
              <TgInput
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
            </div>

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
