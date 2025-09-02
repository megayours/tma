import {
  Button,
  Card,
  Cell,
  Divider,
  Input,
  Placeholder,
  Section,
} from '@telegram-apps/telegram-ui';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import type { Prompt } from '../../types/prompt';

export const SelectNFT = ({
  prompt,
  updatePrompt,
}: {
  prompt: Prompt;
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      // Small delay to ensure the component is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleNFTSelect = () => {
    if (updatePrompt) {
      updatePrompt({
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        minTokens: (prompt.minTokens ?? 0) + 1,
      });
      // Todo close modal
    }
  };

  return (
    <>
      <Button onClick={handleNFTSelect}>
        PLEASE CLICK ME, I am useless button
      </Button>
    </>
  );
};

export const SelectPrompt = ({
  updatePrompt,
  prompt,
}: {
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
  prompt: Prompt;
}) => {
  console.log('PROMPT', prompt);
  return <div>Select Prompt</div>;
};

export const SelectImage = ({
  prompt,
  updatePrompt,
}: {
  prompt: Prompt;
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
}) => {
  console.log('PROMPT', prompt);
  return <div>Select Image</div>;
};

export function AddInputButton({
  updatePrompt,
  prompt,
  promptTextareaRef,
}: {
  updatePrompt: ((updates: Partial<Prompt>) => void) | null;
  prompt: Prompt;
  promptTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const handleAddNFT = () => {
    updatePrompt?.({
      maxTokens: (prompt?.maxTokens ?? 0) + 1,
      minTokens: (prompt?.minTokens ?? 0) + 1,
    });
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

  const handleClose = () => {
    setIsOpen(false);
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
          <Cell onClick={handleAddNFT}>NFT</Cell>
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
            Select {selectedContent}
            {selectedContent === 'nft' && (
              <SelectNFT updatePrompt={updatePrompt} prompt={prompt} />
            )}
            {selectedContent === 'prompt' && (
              <SelectPrompt updatePrompt={updatePrompt} prompt={prompt} />
            )}
            {selectedContent === 'image' && (
              <SelectImage prompt={prompt} updatePrompt={updatePrompt} />
            )}
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
