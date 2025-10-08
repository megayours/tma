import { useState } from 'react';
import type { Prompt } from '@/types/prompt';
import { AddButton } from './AddButton';
import { AddInputModal } from '../forms/AddInputModal';

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

  const handleSelectContent = (contentType: string) => {
    setSelectedContent(contentType);
  };

  // Check if portal container exists first
  const portalContainer = document.getElementById('custom-input-container');
  if (!portalContainer) {
    return <AddButton isOpen={isOpen} onClick={handleClick} />;
  }

  return (
    <>
      <AddButton isOpen={isOpen} onClick={handleClick} />
      <AddInputModal
        isOpen={isOpen}
        selectedContent={selectedContent}
        prompt={prompt}
        onSelectContent={handleSelectContent}
        onBack={handleBackClick}
        onClose={handleCloseModal}
      />
    </>
  );
}
