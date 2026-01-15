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
import { useToast } from '@/components/ui/toast';
import { useGetPrompt, usePromptMutation } from '@/hooks/usePrompts';
import { viewport, useSignal } from '@telegram-apps/sdk-react';
import { useNFTSet } from '@/hooks/useNFTSet';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';

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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Use React Query to get the prompt data
  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);

  // Prompt mutation for saving changes
  const promptMutation = usePromptMutation(session);

  // Get community data for NFT initialization
  const { defaultCollection, selectedCommunity } = useSelectCommunity();
  const allCollections = selectedCommunity?.collections;

  // Use the simplified single NFT set hook
  const {
    compulsoryNFTs,
    optionalNFTs,
    updateCompulsoryNFT,
    updateOptionalNFT,
    addOptionalNFT,
    removeOptionalNFT,
    addCompulsoryNFT,
    removeCompulsoryNFT,
    maxOptionalTokens,
  } = useNFTSet(prompt || null, defaultCollection, allCollections);

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
    // console.log(
    //   'Generating preview with:',
    //   promptText,
    //   compulsoryNFTs,
    //   optionalNFTs,
    //   hasChanges,
    //   currentAdditionalContentIds
    // );

    try {
      await generatePromptPreview(
        promptText,
        prompt,
        compulsoryNFTs,
        optionalNFTs,
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

  const safeAreaInsets = useSignal(viewport.safeAreaInsets);

  const paddingBottom = 300 + (safeAreaInsets?.bottom || 0);

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
      <div className="bg-tg-secondary-bg pointer-events-none fixed right-0 bottom-20 left-0 z-99 overflow-y-hidden">
        <div id="custom-input-container"></div>
      </div>

      {/* Bottom toolbar */}
      <div
        className="fixed right-0 left-0 z-30 border-t border-white/20"
        style={{ bottom: `${safeAreaInsets?.bottom || 0}px` }}
      >
        <div className="flex h-full flex-col pb-4">
          <div
            className="scrollbar-hide flex min-w-0 flex-row items-center justify-start overflow-x-scroll"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {selectedVersion && (
              <div className="flex flex-shrink-20">
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
                        additionalContentIds:
                          currentAdditionalContentIds.filter(
                            id => id !== contentId
                          ),
                      },
                    });

                    setHasChanges(true);
                  }}
                />
              </div>
            )}
            {currentAdditionalContentIds &&
              currentAdditionalContentIds.length > 0 && (
                <div className="border-tg-section-separator h-12 flex-shrink-0 border-1"></div>
              )}
            <div className="h-15 flex-shrink-0">
              <InputsEditor
                prompt={prompt}
                compulsoryNFTs={compulsoryNFTs}
                optionalNFTs={optionalNFTs}
                updateCompulsoryNFT={updateCompulsoryNFT}
                updateOptionalNFT={updateOptionalNFT}
                addOptionalNFT={addOptionalNFT}
                removeOptionalNFT={removeOptionalNFT}
                addCompulsoryNFT={addCompulsoryNFT}
                removeCompulsoryNFT={removeCompulsoryNFT}
                maxOptionalTokens={maxOptionalTokens}
              />
            </div>
          </div>
          <Divider />
          <div className="flex flex-row items-center gap-2 px-2 py-2">
            <div className="bg-tg-button text-tg-button-text flex items-center justify-center overflow-hidden rounded-4xl shadow-lg">
              <AddInputButton prompt={prompt} onOpenChange={setIsAddMenuOpen} />
            </div>
            <div className="flex flex-1 flex-col">
              <textarea
                placeholder="Example: The Character1 in a futuristic cityscape, vibrant colors, high detail"
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
                  !isAddMenuOpen &&
                  promptText.trim()
                ) {
                  handleGenerate();
                }
              }}
              className={`bg-tg-button text-tg-button-text flex cursor-pointer items-center justify-center rounded-4xl p-4 shadow-lg transition-all ${
                isGenerating ||
                promptMutation.isPending ||
                isAddMenuOpen ||
                !promptText.trim()
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
  return (
    <PromptEditorContent
      promptId={promptId}
      selectedNFTs={selectedNFTs}
      setSelectedNFTs={setSelectedNFTs}
    />
  );
};
