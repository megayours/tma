import { Section } from '@telegram-apps/telegram-ui';
import { createPortal } from 'react-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import type { Prompt } from '@/types/prompt';
import { AddInputMenu } from '../navigation/AddInputMenu';
import { SelectNFTModal } from './SelectNFTModal';
import { SelectPromptModal } from './SelectPromptModal';
import { SelectImageModal } from './SelectImageModal';
import { useGetModel } from '@/hooks/useModels';
import { useState, useEffect } from 'react';

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
  const latestVersion = prompt.versions?.[0]!;

  const { model, isLoading: isLoadingModel } = useGetModel(
    latestVersion.model!
  );

  const [additionalImagesEnabled, setAdditionalImagesEnabled] = useState(true);

  useEffect(() => {
    if (latestVersion.additionalContentIds === undefined) {
      setAdditionalImagesEnabled(true);
      return;
    }
    if (
      (latestVersion.additionalContentIds?.length ?? 0) +
        (latestVersion.maxTokens ?? 0) >
      (model?.capabilities?.[0]?.maxImages || 0)
    ) {
      setAdditionalImagesEnabled(false);
    } else {
      setAdditionalImagesEnabled(true);
    }
  }, [model]);

  if (!isOpen || !portalContainer) {
    return null;
  }

  if (isLoadingModel) {
    return createPortal(
      <div className="bg-tg-bg pointer-events-auto relative left-0 flex h-auto min-h-16 w-full items-center justify-center overflow-auto p-4 select-auto">
        <div className="text-tg-hint text-sm">Loading...</div>
      </div>,
      portalContainer
    );
  }

  const modalContent = (
    <div className="bg-tg-bg pointer-events-auto relative left-0 h-auto min-h-16 w-full overflow-auto select-auto">
      {/* Main menu when no specific content is selected */}
      {selectedContent === null && (
        <AddInputMenu
          onSelectContent={onSelectContent}
          additionalImagesEnabled={additionalImagesEnabled}
        />
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
              <SelectImageModal prompt={prompt} onClose={onClose} />
            )}
          </div>
        </Section>
      )}
    </div>
  );

  return createPortal(modalContent, portalContainer);
};
