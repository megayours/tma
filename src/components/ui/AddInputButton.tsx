import { Button, Cell, Divider, Section } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import type { Prompt } from '../../types/prompt';
import { usePromptMutation } from '../../hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';

export const SelectNFT = ({
  prompt,
  onClose,
}: {
  prompt: Prompt;
  onClose: () => void;
}) => {
  const { session } = useSession();
  const { mutateAsync: updatePrompt, isPending } = usePromptMutation(session);
  const [step, setStep] = useState<'choice' | 'completed'>('choice');

  const handleMandatoryAsset = async () => {
    try {
      const updatedPrompt = {
        ...prompt,
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        minTokens: (prompt.minTokens ?? 0) + 1,
      };

      await updatePrompt({ prompt: updatedPrompt });
      setStep('completed');
      // Close modal after a short delay to show feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  const handleOptionalAsset = async () => {
    try {
      const updatedPrompt = {
        ...prompt,
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        // Don't increment minTokens for optional assets
      };

      await updatePrompt({ prompt: updatedPrompt });
      setStep('completed');
      // Close modal after a short delay to show feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  if (step === 'completed') {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="text-center">
          <div className="mb-2 text-2xl">✅</div>
          <div className="text-tg-text font-medium">NFT Asset Added</div>
          <div className="text-tg-hint text-sm">
            Min: {prompt.minTokens ?? 0}, Max: {prompt.maxTokens ?? 0}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="mb-4 text-center">
        <h3 className="text-tg-text mb-2 text-lg font-medium">Add NFT Asset</h3>
        <p className="text-tg-hint text-sm">
          Choose whether this NFT should be required or optional for content
          generation
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          mode="filled"
          size="l"
          onClick={handleMandatoryAsset}
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">Mandatory Asset</span>
            <span className="text-xs opacity-75">Required for generation</span>
          </div>
        </Button>

        <Button
          mode="bezeled"
          size="l"
          onClick={handleOptionalAsset}
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">Optional Asset</span>
            <span className="text-xs opacity-75">
              Can be used but not required
            </span>
          </div>
        </Button>
      </div>

      <div className="text-tg-hint mt-2 text-center text-xs">
        Current tokens - Min: {prompt.minTokens ?? 0}, Max:{' '}
        {prompt.maxTokens ?? 0}
      </div>
    </div>
  );
};

export const SelectPrompt = ({ prompt: _prompt }: { prompt: Prompt }) => {
  return <div>Select Prompt</div>;
};

export const SelectImage = ({ prompt: _prompt }: { prompt: Prompt }) => {
  return <div>Select Image</div>;
};

export function AddInputButton({
  prompt,
  promptTextareaRef,
}: {
  prompt: Prompt;
  promptTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedContent(null);
    // Focus textarea after closing
    setTimeout(() => {
      if (promptTextareaRef.current) {
        promptTextareaRef.current.focus();
      }
    }, 100);
  };

  const handleBackClick = () => {
    setSelectedContent(null);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedContent(null); // Reset content when opening
    }
  };

  // Find the portal container
  const portalContainer = document.getElementById('custom-input-container');

  // Check if portal container exists first, like in NFTCloud.tsx
  if (!portalContainer) {
    return (
      <button
        onClick={handleClick}
        className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Add content"
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
          className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    );
  }

  const addInputsContent = (
    <div className="bg-tg-bg pointer-events-auto relative left-0 flex h-auto min-h-16 w-full overflow-auto select-auto">
      {/* Main menu when no specific content is selected */}
      {selectedContent === null && (
        <div className="flex w-full flex-col gap-2 p-4">
          <Cell onClick={() => setSelectedContent('nft')}>NFT</Cell>
          <Divider />
          <Cell onClick={() => setSelectedContent('prompt')}>Prompt</Cell>
          <Divider />
          <Cell onClick={() => setSelectedContent('image')}>Image</Cell>
        </div>
      )}

      {/* Specific content selection screens */}
      {selectedContent !== null && (
        <Section>
          <IoArrowBackOutline onClick={handleBackClick} />
          <div className="text-tg-text">
            {selectedContent === 'nft' && (
              <SelectNFT prompt={prompt} onClose={handleCloseModal} />
            )}
            {selectedContent === 'prompt' && <SelectPrompt prompt={prompt} />}
            {selectedContent === 'image' && <SelectImage prompt={prompt} />}
          </div>
        </Section>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Add content"
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
          className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Portal for AddInputs content - only render when open and container exists */}
      {isOpen && createPortal(addInputsContent, portalContainer)}
    </>
  );
}
