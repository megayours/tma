import { useState } from 'react';
import type { Prompt } from '@/types/prompt';
import { AddButton } from './AddButton';
import { AddInputModal } from '../forms/AddInputModal';
import { usePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { useQueryClient } from '@tanstack/react-query';

export function AddInputButton({
  prompt,
  promptTextareaRef,
}: {
  prompt: Prompt;
  promptTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const { mutateAsync: updatePrompt } = usePromptMutation(session);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isAddingNFT, setIsAddingNFT] = useState(false);

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

  const handleSelectContent = async (contentType: string) => {
    // Auto-add mandatory NFT asset with optimistic update
    if (contentType === 'nft') {
      setIsAddingNFT(true);

      const updatedPrompt = {
        ...prompt,
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        minTokens: (prompt.minTokens ?? 0) + 1,
      };

      // Optimistic update - update cache immediately
      queryClient.setQueryData(['prompt', prompt.id.toString()], updatedPrompt);

      // Close modal immediately for instant feedback
      handleCloseModal();

      // Update backend in background
      try {
        await updatePrompt({ prompt: updatedPrompt });
      } catch (error) {
        console.error('Failed to update prompt:', error);
        // Revert optimistic update on error
        queryClient.setQueryData(['prompt', prompt.id.toString()], prompt);
      } finally {
        setIsAddingNFT(false);
      }
      return;
    }

    // For other content types, use the normal flow
    setSelectedContent(contentType);
  };

  // Check if portal container exists first
  const portalContainer = document.getElementById('custom-input-container');
  if (!portalContainer) {
    return <AddButton isOpen={isOpen} onClick={handleClick} isLoading={isAddingNFT} />;
  }

  return (
    <>
      <AddButton isOpen={isOpen} onClick={handleClick} isLoading={isAddingNFT} />
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
