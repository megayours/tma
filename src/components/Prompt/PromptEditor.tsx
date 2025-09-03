import { useRef, useState } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import {
  AvatarStack,
  Button,
  Divider,
  IconButton,
  Avatar,
  Textarea,
  Cell,
  Section,
  Input,
} from '@telegram-apps/telegram-ui';

import { AddInputButton } from '../ui/AddInputButton';
import { IoSend } from 'react-icons/io5';
import { IoArrowBackOutline } from 'react-icons/io5';
import { InputsEditor } from './InputsEditor';
import { usePromptPreviewGeneration } from '@/hooks/usePromptPreviewGeneration';
import { useSession } from '@/auth/SessionProvider';
import { ContentPreviews } from './ContentPreview';
import { SelectNFT, SelectPrompt, SelectImage } from '../ui/AddInputButton';

export const PromptEditor = ({
  prompt: initialPrompt,
  selectedNFTs,
  setSelectedNFTs,
}: {
  prompt: Prompt | null;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
}) => {
  console.log('PromptEditor', initialPrompt);
  const { session } = useSession();
  const [promptText, setPromptText] = useState(
    initialPrompt?.versions?.[0]?.text ?? ''
  );
  const [prompt, setPrompt] = useState<Prompt | null>(initialPrompt);
  const [hasChanges, setHasChanges] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedVersion, setSelectedVersion] = useState(
    prompt?.versions?.[(prompt.versions?.length ?? 0) - 1]
  );

  // Custom hook for prompt generation logic
  const { isGenerating, generatePromptPreview } = usePromptPreviewGeneration({
    session,
    onSuccess: result => {
      console.log('Generation successful:', result);
      if (result.generated) {
        setHasChanges(false);
      }
    },
    onError: error => {
      console.error('Generation failed:', error);
      // Handle error here
    },
  });

  // Function to update prompt and track changes
  const updatePrompt = (updates: Partial<Prompt>) => {
    if (prompt) {
      setPrompt({ ...prompt, ...updates });
      setHasChanges(true);
    }
  };

  const handleGenerate = () => {
    const contentId = generatePromptPreview(
      promptText,
      prompt!,
      hasChanges,
      setSelectedVersion
    );
    console.log('Content ID:', contentId);
  };

  if (!prompt) return <div>Loading...</div>;

  return (
    <div className="bg-tg-bg min-h-screen">
      {/* Main content area */}
      <div className="h-screen pb-100">
        {/* Your main content goes here */}
        {selectedVersion && (
          <div className="h-full">
            <ContentPreviews
              prompt={prompt}
              selectedVersion={selectedVersion}
            />
          </div>
        )}
      </div>

      {/* Portal container for AddContentButton and NFTCloud */}
      <div className="bg-tg-bg pointer-events-none fixed right-0 bottom-20 left-0 z-29 overflow-y-scroll pb-20">
        <div id="custom-input-container"></div>
      </div>

      {/* Fixed bottom toolbar */}
      <div className="bg-tg-secondary-bg border-tg-hint/20 safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-30 h-52 border-t">
        <div className="h-12">
          <InputsEditor prompt={prompt} />
        </div>
        <Divider />
        <div className="flex h-40 flex-row items-center gap-2 px-2">
          <div className="flex items-center justify-center">
            <AddInputButton
              updatePrompt={updatePrompt}
              prompt={prompt}
              promptTextareaRef={promptTextareaRef}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <Textarea
              placeholder="Enter your prompt..."
              className="bg-tg-section-bg text-tg-text transition-all duration-200"
              ref={promptTextareaRef}
              value={promptText}
              onChange={e => {
                setHasChanges(true);
                setPromptText(e.target.value);
              }}
              disabled={isGenerating}
            />
          </div>
          <div className="flex flex-col items-center justify-start gap-2">
            <Button
              mode="filled"
              size="m"
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              loading={isGenerating}
            >
              <IoSend className="text-tg-button-text" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
