import { useRef, useState, useEffect } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import { Button, Divider } from '@telegram-apps/telegram-ui';

import { AddInputButton } from '../ui/AddInputButton';
import { IoSend } from 'react-icons/io5';
import { InputsEditor } from './InputsEditor';
import { usePromptPreviewGeneration } from '@/hooks/usePromptPreviewGeneration';
import { useSession } from '@/auth/SessionProvider';
import { ContentPreviews } from './ContentPreview';
import { NFTSetsProvider } from '@/contexts/NFTSetsContext';
import { useToast } from '@/components/ui/toast';

const PromptEditorContent = ({
  prompt: initialPrompt,
}: {
  prompt: Prompt | null;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
}) => {
  const { session } = useSession();
  const { addToast } = useToast();
  const [promptText, setPromptText] = useState(
    initialPrompt?.versions?.[0]?.text ?? ''
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Use the prompt from context directly
  const prompt = initialPrompt;
  const [selectedVersion, setSelectedVersion] = useState(
    prompt?.versions?.[(prompt.versions?.length ?? 0) - 1]
  );

  // Custom hook for prompt generation logic
  const { isGenerating, generatePromptPreview } = usePromptPreviewGeneration({
    session,
    onSuccess: result => {
      if (result.generated) {
        setHasChanges(false);
      }
    },
    onError: error => {
      console.error('Generation failed:', error);
      // Handle error here
    },
  });

  // Function to track changes (prompt updates will be handled by the mutation)
  const updatePrompt = (updates: Partial<Prompt>) => {
    if (prompt) {
      setHasChanges(true);
    }
  };

  // Calculate the height class for the textarea
  const getTextareaHeight = () => {
    if (!isTextareaFocused) {
      return 'h-12'; // 1 line when not focused (regardless of content)
    }
    return 'h-35'; // Max height when focused
  };

  const handleGenerate = async () => {
    if (!prompt) {
      console.error('No prompt available');
      return;
    }

    try {
      await generatePromptPreview(
        promptText,
        prompt,
        hasChanges,
        setSelectedVersion
      );
    } catch (error) {
      console.error('Error during generation:', error);
      addToast({
        type: 'error',
        title: 'Generation Error',
        message: 'An error occurred during generation. Please try again.',
      });
    }
  };

  if (!prompt) return <div>Loading...</div>;

  return (
    <div className="bg-tg-bg">
      {/* Main content area */}
      <div className="h-screen pb-60">
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
      <div className="bg-tg-bg pointer-events-none fixed right-0 bottom-20 left-0 z-29 overflow-y-scroll pb-10">
        <div id="custom-input-container"></div>
      </div>

      {/* Bottom toolbar */}
      <div className="bg-tg-secondary-bg border-tg-hint/20 safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-30 border-t">
        <div className="flex h-full flex-col pb-4">
          <div className="h-15">
            <InputsEditor prompt={prompt} />
          </div>
          <Divider />
          <div className="flex flex-row items-center gap-2 px-2 py-2">
            <div className="flex items-center justify-center">
              <AddInputButton
                updatePrompt={updatePrompt}
                prompt={prompt}
                promptTextareaRef={promptTextareaRef}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <textarea
                placeholder="Enter your prompt..."
                className={`resize-none rounded-2xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-200 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${getTextareaHeight()}`}
                ref={promptTextareaRef}
                value={promptText}
                onChange={e => {
                  setHasChanges(true);
                  setPromptText(e.target.value);
                }}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
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
    </div>
  );
};

export const PromptEditor = ({
  prompt: initialPrompt,
  selectedNFTs,
  setSelectedNFTs,
}: {
  prompt: Prompt | null;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
}) => {
  return (
    <NFTSetsProvider prompt={initialPrompt}>
      <PromptEditorContent
        prompt={initialPrompt}
        selectedNFTs={selectedNFTs}
        setSelectedNFTs={setSelectedNFTs}
      />
    </NFTSetsProvider>
  );
};
