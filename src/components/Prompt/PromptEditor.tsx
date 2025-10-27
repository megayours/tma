import { useRef, useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import { Button, Divider } from '@telegram-apps/telegram-ui';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

import { AddInputButton, SpinnerFullPage } from '@/components/ui';
import { IoSend } from 'react-icons/io5';
import { InputsEditor } from './InputsEditor';
import { AdditionalContentDisplay } from './AdditionalContentDisplay';
import { usePromptPreviewGeneration } from '@/hooks/usePromptPreviewGeneration';
import { useSession } from '@/auth/SessionProvider';
import { ContentPreviews } from './ContentPreview';
import { NFTSetsProvider } from '@/contexts/NFTSetsContext';
import { useToast } from '@/components/ui/toast';
import { useGetPrompt, usePromptMutation } from '@/hooks/usePrompts';

const PromptEditorContent = ({
  promptId,
}: {
  promptId: string;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
}) => {
  const { session } = useSession();
  const { addToast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isViewportMounted = useSignal(viewport.isMounted);

  // Use React Query to get the prompt data
  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);

  // Prompt mutation for saving changes
  const promptMutation = usePromptMutation(session);

  const [promptText, setPromptText] = useState('');
  const [currentAdditionalContentIds, setCurrentAdditionalContentIds] =
    useState<string[]>([]);
  // Update promptText when prompt data loads/changes
  useEffect(() => {
    if (prompt?.versions?.[0]?.text) {
      setPromptText(prompt.versions[0].text);
      setCurrentAdditionalContentIds(
        prompt.versions[0].additionalContentIds || []
      );
    }
  }, [prompt?.versions]);
  const [selectedVersion, setSelectedVersion] = useState(
    prompt?.versions?.sort((a, b) => b.version - a.version)[0]
  );

  console.log('selectedVersion', selectedVersion);

  // Custom hook for prompt generation logic
  const { isGenerating, generatePromptPreview } = usePromptPreviewGeneration({
    session,
    onSuccess: result => {
      if (result.generated) {
        setHasChanges(false);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Prompt updated and preview generated successfully!',
        });
      }
    },
    onError: error => {
      console.error('Generation failed:', error);
      addToast({
        type: 'error',
        title: 'Error',
        message:
          error.message || 'Failed to generate preview. Please try again.',
      });
    },
  });

  // Changes are now tracked automatically by the usePromptMutation hook

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
        setSelectedVersion,
        currentAdditionalContentIds
      );
    } catch (error) {
      // Error handling is now done in the usePromptPreviewGeneration hook
      console.error('Error during generation:', error);
    }
  };

  if (isLoading) return <SpinnerFullPage text="Loading prompt..." />;
  if (error) return <div>Error loading prompt: {error.message}</div>;
  if (!prompt) return <div>Prompt not found</div>;

  return (
    <div className="bg-tg-bg">
      {/* Main content area */}
      <div className={`h-screen ${isViewportMounted ? 'pb-80' : 'pb-60'}`}>
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
      <div className="bg-tg-bg pointer-events-none fixed right-0 bottom-20 left-0 z-29 overflow-y-scroll pb-16">
        <div id="custom-input-container"></div>
      </div>

      {/* Bottom toolbar */}
      <div className="bg-tg-secondary-bg border-tg-hint/20 safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-30 border-t">
        <div className="flex h-full flex-col pb-4">
          <div className="justify-startgap-2 flex flex-row items-center">
            {selectedVersion && (
              <AdditionalContentDisplay
                contentIds={currentAdditionalContentIds || []}
                removeContent={contentId => {
                  setCurrentAdditionalContentIds(
                    currentAdditionalContentIds.filter(id => id !== contentId)
                  );
                  setHasChanges(true);
                }}
              />
            )}
            <div className="h-15">
              <InputsEditor prompt={prompt} />
            </div>
          </div>
          <Divider />
          <div className="flex flex-row items-center gap-2 px-2 py-2">
            <div className="flex items-center justify-center">
              <AddInputButton
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
                disabled={isGenerating || promptMutation.isPending}
              />
            </div>
            <div className="flex flex-col items-center justify-start gap-2">
              <Button
                mode="filled"
                size="m"
                onClick={handleGenerate}
                disabled={
                  isGenerating || promptMutation.isPending || !promptText.trim()
                }
                loading={isGenerating || promptMutation.isPending}
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
  promptId,
  selectedNFTs,
  setSelectedNFTs,
}: {
  promptId: string;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
}) => {
  const { session } = useSession();
  const { data: prompt } = useGetPrompt(promptId, session);

  return (
    <NFTSetsProvider prompt={prompt || null}>
      <PromptEditorContent
        promptId={promptId}
        selectedNFTs={selectedNFTs}
        setSelectedNFTs={setSelectedNFTs}
      />
    </NFTSetsProvider>
  );
};
