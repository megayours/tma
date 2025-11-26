import { useRef, useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import { Divider } from '@telegram-apps/telegram-ui';
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
import { viewport, useSignal } from '@telegram-apps/sdk-react';

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

  // Use React Query to get the prompt data
  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);

  // Prompt mutation for saving changes
  const promptMutation = usePromptMutation(session);

  const [promptText, setPromptText] = useState('');
  const [currentAdditionalContentIds, setCurrentAdditionalContentIds] =
    useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState(
    prompt?.versions?.sort((a, b) => b.version - a.version)[0]
  );

  // Update selectedVersion when prompt data changes (after refetch)
  useEffect(() => {
    if (prompt?.versions) {
      const latestVersion = prompt.versions.sort(
        (a, b) => b.version - a.version
      )[0];
      setSelectedVersion(latestVersion);
    }
  }, [prompt]);

  // Update promptText and Additional Content IDs when prompt data loads/changes
  useEffect(() => {
    if (selectedVersion?.text) {
      setPromptText(selectedVersion.text);
    }
    if (selectedVersion?.additionalContentIds) {
      setCurrentAdditionalContentIds(
        selectedVersion.additionalContentIds || []
      );
    }
  }, [selectedVersion]);

  console.log('selectedVersion', selectedVersion);

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
    return 'h-50'; // Max height when focused
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

  const isViewportMounted = useSignal(viewport.isMounted);
  const viewportSafeAreaInsets = useSignal(viewport.safeAreaInsets);

  const paddingBottom = isViewportMounted
    ? 300 + (viewportSafeAreaInsets?.top || 0)
    : 300;

  return (
    <div
      className={`bg-tg-bg h-screen overflow-hidden`}
      style={{
        paddingBottom: `${paddingBottom}px`,
      }}
    >
      {/* Main content area */}
      <div className={`h-full overflow-hidden`}>
        {/* Your main content goes here */}
        {selectedVersion && (
          <div className="h-full overflow-hidden">
            <ContentPreviews
              prompt={prompt}
              selectedVersion={selectedVersion}
            />
          </div>
        )}
      </div>

      {/* Portal container for AddContentButton and NFTCloud */}
      <div className="bg-tg-bg pointer-events-none fixed right-0 bottom-20 left-0 z-29 overflow-y-hidden pb-16">
        <div id="custom-input-container"></div>
      </div>

      {/* Bottom toolbar */}
      <div className="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-30 border-t border-white/20">
        <div className="flex h-full flex-col pb-4">
          <div className="bg-tg-bg justify-startgap-2 flex flex-row items-center">
            {selectedVersion && (
              <AdditionalContentDisplay
                contentIds={currentAdditionalContentIds || []}
                isMutating={promptMutation.isPending}
                removeContent={async contentId => {
                  setCurrentAdditionalContentIds(
                    currentAdditionalContentIds.filter(id => id !== contentId)
                  );

                  // update prompt with the new additional content ids
                  await promptMutation.mutateAsync({
                    prompt: {
                      ...prompt,
                      additionalContentIds: currentAdditionalContentIds.filter(
                        id => id !== contentId
                      ),
                    },
                  });

                  setHasChanges(true);
                }}
              />
            )}
            <div className="border-tg-section-separator h-12 border-1"></div>
            <div className="h-15">
              <InputsEditor prompt={prompt} />
            </div>
          </div>
          <Divider />
          <div className="flex flex-row items-center gap-2 px-2 py-2">
            <div className="bg-tg-button text-tg-button-text flex items-center justify-center overflow-hidden rounded-4xl shadow-lg">
              <AddInputButton
                prompt={prompt}
                promptTextareaRef={promptTextareaRef}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <textarea
                placeholder="Example: The NFT1 in a futuristic cityscape, vibrant colors, high detail"
                className={`text-tg-text border-tg-button/20 resize-none rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-lg transition-all duration-200 outline-none ${getTextareaHeight()} scrollbar-hide`}
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
            <div
              onClick={() => {
                if (
                  !isGenerating &&
                  !promptMutation.isPending &&
                  promptText.trim()
                ) {
                  handleGenerate();
                }
              }}
              className={`bg-tg-button text-tg-button-text flex cursor-pointer items-center justify-center rounded-4xl p-4 shadow-lg transition-all ${
                isGenerating || promptMutation.isPending || !promptText.trim()
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:brightness-110 active:scale-95'
              }`}
            >
              {isGenerating || promptMutation.isPending ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              ) : (
                <IoSend className="h-3 w-3" />
              )}
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
