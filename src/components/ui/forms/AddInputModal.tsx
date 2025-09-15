import { Section } from '@telegram-apps/telegram-ui';
import { createPortal } from 'react-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import type { Prompt } from '@/types/prompt';
import { AddInputMenu } from '../navigation/AddInputMenu';
import { SelectNFTModal } from './SelectNFTModal';
import { SelectPromptModal } from './SelectPromptModal';
import { SelectImageModal } from './SelectImageModal';

interface AddInputModalProps {
  isOpen: boolean;
  selectedContent: string | null;
  prompt: Prompt;
  onSelectContent: (contentType: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export const AddInputModal = ({
  isOpen,
  selectedContent,
  prompt,
  onSelectContent,
  onBack,
  onClose,
}: AddInputModalProps) => {
  const portalContainer = document.getElementById('custom-input-container');

  if (!isOpen || !portalContainer) {
    return null;
  }

  const modalContent = (
    <div className="bg-tg-bg pointer-events-auto relative left-0 flex h-auto min-h-16 w-full overflow-auto select-auto">
      {/* Main menu when no specific content is selected */}
      {selectedContent === null && (
        <AddInputMenu onSelectContent={onSelectContent} />
      )}

      {/* Specific content selection screens */}
      {selectedContent !== null && (
        <Section>
          <IoArrowBackOutline onClick={onBack} />
          <div className="text-tg-text">
            {selectedContent === 'nft' && (
              <SelectNFTModal prompt={prompt} onClose={onClose} />
            )}
            {selectedContent === 'prompt' && (
              <SelectPromptModal prompt={prompt} />
            )}
            {selectedContent === 'image' && (
              <SelectImageModal prompt={prompt} />
            )}
          </div>
        </Section>
      )}
    </div>
  );

  return createPortal(modalContent, portalContainer);
};