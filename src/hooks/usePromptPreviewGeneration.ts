import { useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Session } from '@/auth/useAuth';
import { usePromptMutation } from './usePrompts';
import { usePreviewContentMutation } from './useContents';
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
    compulsoryNFTs: Token[],
    optionalNFTs: Token[],
    hasChanges?: boolean,
    setSelectedVersion?: any,
    currentAdditionalContentIds?: string[]
  ) => Promise<{ nftSet: Token[]; result: { contentId: number } }>;
  reset: () => void;
}

export function usePromptPreviewGeneration(
  options: UsePromptGenerationOptions = { session: null }
): UsePromptGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const { onSuccess, onError } = options;
  const { session } = options;
  const { mutateAsync: updatePrompt } = usePromptMutation(session);
  const { mutateAsync: previewContent } = usePreviewContentMutation(session);

  const generatePromptPreview = useCallback(
    async (
      promptText: string,
      prompt: Prompt,
      compulsoryNFTs: Token[],
      optionalNFTs: Token[],
      hasChanges = false,
      setSelectedVersion?: any,
      currentAdditionalContentIds?: string[]
    ) => {
      if (!session) {
        throw new Error('No session available');
      }

      if (!promptText.trim() || isGenerating) {
        throw new Error('Invalid prompt text or already generating');
      }

      if (!compulsoryNFTs || !compulsoryNFTs.length) {
        throw new Error('No NFTs available');
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
                additionalContentIds: currentAdditionalContentIds,
              },
            });

            if (newPrompt?.versions?.length) {
              setSelectedVersion?.(
                newPrompt.versions[newPrompt.versions.length - 1]
              );
            }
          } catch (error) {
            console.error('Failed to update prompt:', error);
            throw new Error(
              `Failed to save prompt changes: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        // Combine compulsory and optional NFTs into single set
        const combinedSet = [...compulsoryNFTs, ...optionalNFTs];

        // Convert combined NFT set to tokens format expected by generatePromptPreview
        const tokens = combinedSet.map(token => ({
          contract: {
            chain: token.contract.chain,
            address: token.contract.address,
            name: token.contract.name,
          },
          id: token.id,
        }));

        // Call previewContent for the NFT set
        const result = await previewContent({
          promptId: prompt.id!,
          contentIds: [],
          tokens: tokens as Token[],
        });

        if (!result) {
          throw new Error('Failed to generate content preview');
        }

        const response = {
          nftSet: combinedSet,
          result,
        };

        // Call success callback if provided
        onSuccess?.({
          promptText,
          generated: true,
          result: response,
        });

        return response;
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
