import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '@/auth/SessionProvider';
import { useCreatePromptMutation } from '../../hooks/usePrompts';

export function CreatePostButton() {
  const { session } = useSession();
  const { mutateAsync: createPrompt } = useCreatePromptMutation();

  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = async (
    type: 'images' | 'videos' | 'stickers' | 'animated_stickers'
  ) => {
    setShowOptions(false);
    try {
      const prompt = await createPrompt({
        session,
        type,
        name: 'New Post ' + new Date().getTime().toString(),
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 relative flex h-8 w-8 items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Create new post"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${showOptions ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {showOptions && (
        <>
          {/* Backdrop to close options */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowOptions(false)}
          />

          {/* Options menu */}
          <div className="absolute bottom-full left-1/2 z-20 mb-2 w-[200px] -translate-x-1/2 transform py-4">
            <div className="bg-tg-secondary-bg border-tg-hint/20 flex w-full flex-col gap-6 space-y-1 rounded-lg border p-2 shadow-lg">
              <button
                onClick={() => handleOptionSelect('images')}
                className="hover:bg-tg-bg flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left transition-colors"
              >
                <div className="flex flex-row items-center gap-6">
                  <span className="text-lg">🖼️</span>
                  <span className="text-tg-text text-xl font-medium">
                    Image
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleOptionSelect('videos')}
                className="hover:bg-tg-bg flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left transition-colors"
              >
                <div className="flex flex-row items-center gap-6">
                  <span className="text-lg">🎥</span>
                  <span className="text-tg-text text-xl font-medium">
                    Video
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleOptionSelect('stickers')}
                className="hover:bg-tg-bg flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left transition-colors"
              >
                <div className="flex flex-row items-center gap-6">
                  <span className="text-lg">✨</span>
                  <span className="text-tg-text text-xl font-medium">
                    Sticker
                  </span>
                </div>
              </button>
              <button
                onClick={() => handleOptionSelect('animated_stickers')}
                className="hover:bg-tg-bg flex w-full items-center space-x-3 rounded-md px-3 py-2 text-left transition-colors"
              >
                <div className="flex flex-row items-center gap-6">
                  <span className="text-lg">🪩</span>
                  <span className="text-tg-text text-xl font-medium">
                    Animated Sticker
                  </span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
