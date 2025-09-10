import { useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Session } from '@/auth/useAuth';
import { usePromptMutation } from './usePrompts';
import { usePreviewContentMutation } from './useContents';
import { useNFTSetsContext } from '@/contexts/NFTSetsContext';
import type { Token } from '@/types/response';

interface UsePromptGenerationOptions {
  session: Session | null | undefined;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface UsePromptGenerationReturn {
  isGenerating: boolean;
  generatePromptPreview: (
    promptText: string,
    prompt: Prompt,
    hasChanges?: boolean,
    setSelectedVersion?: any
  ) => Promise<
    Array<{ setIndex: number; nftSet: any[]; result: { contentId: number } }>
  >;
  reset: () => void;
}

export function usePromptPreviewGeneration(
  options: UsePromptGenerationOptions = { session: null }
): UsePromptGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const { onSuccess, onError } = options;
  const { session } = options;
  const { nftSets } = useNFTSetsContext();
  const { mutateAsync: updatePrompt } = usePromptMutation(session);
  const { mutateAsync: previewContent } = usePreviewContentMutation(session);

  const generatePromptPreview = useCallback(
    async (
      promptText: string,
      prompt: Prompt,
      hasChanges = false,
      setSelectedVersion?: any
    ) => {
      if (!session) {
        throw new Error('No session available');
      }

      if (!promptText.trim() || isGenerating) {
        throw new Error('Invalid prompt text or already generating');
      }

      if (!nftSets || !nftSets.length) {
        throw new Error('No NFT sets available');
      }

      setIsGenerating(true);

      try {
        // Check if the prompt has been modified - only do this once
        if (hasChanges) {
          try {
            const newPrompt = await updatePrompt({
              prompt: {
                ...prompt,
                prompt: promptText,
              },
            });

            if (newPrompt?.versions?.length) {
              setSelectedVersion?.(
                newPrompt.versions[newPrompt.versions.length - 1]
              );
            }
          } catch (error) {
            console.error('Failed to update prompt:', error);
            throw error;
          }
        }

        // Create promises for each NFT set
        const generationPromises = nftSets.map(async (nftSet, index) => {
          // Convert NFT set to tokens format expected by generatePromptPreview
          const tokens = nftSet.map(token => ({
            contract: {
              chain: token.contract.chain,
              address: token.contract.address,
              name: token.contract.name,
            },
            id: token.id,
          }));

          // Call previewContent for this NFT set
          const result = await previewContent({
            promptId: prompt.id!,
            contentIds: [],
            tokens: tokens as Token[],
          });

          if (!result) {
            throw new Error(
              `Failed to generate content preview for set ${index}`
            );
          }

          return {
            setIndex: index,
            nftSet,
            result,
          };
        });

        // Wait for all generations to complete
        const results = await Promise.all(generationPromises);

        // Call success callback if provided
        onSuccess?.({
          promptText,
          generated: true,
          results,
        });

        return results;
      } catch (error) {
        console.error('Generation failed:', error);
        // Call error callback if provided
        onError?.(error as Error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [
      session,
      isGenerating,
      updatePrompt,
      previewContent,
      onSuccess,
      onError,
      nftSets,
    ]
  );

  const reset = useCallback(() => {
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    generatePromptPreview,
    reset,
  };
}
