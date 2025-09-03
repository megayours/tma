import { useState, useCallback } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Session } from '@/auth/useAuth';
import { usePromptMutation } from './usePrompts';
import { usePreviewContentMutation } from './useContents';

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
  ) => Promise<{ contentId: number }>;
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
      hasChanges = false,
      setSelectedVersion?: any
    ) => {
      console.log(
        'Generating prompt preview...',
        promptText,
        prompt,
        hasChanges
      );
      if (!session) {
        throw new Error('No session available');
      }

      if (!promptText.trim() || isGenerating) {
        throw new Error('Invalid prompt text or already generating');
      }

      setIsGenerating(true);

      try {
        // Check if the prompt has been modified
        if (hasChanges) {
          try {
            const newPrompt = await updatePrompt({
              prompt: {
                ...prompt,
                prompt: promptText,
              },
            });
            console.log('New prompt:', newPrompt);
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

        console.log('Generating content for:', promptText);

        const result = await previewContent({
          promptId: prompt.id!,
          contentIds: [],
          tokens: [
            {
              contract: {
                chain: 'abstract',
                address: '0x516dc288e26b34557f68ea1c1ff13576eff8a168',
                name: 'Abstract',
              },
              id: '220',
            },
          ],
        });

        if (!result) {
          throw new Error('Failed to generate content preview');
        }

        // Call success callback if provided
        onSuccess?.({
          promptText,
          generated: true,
          contentId: result.contentId,
        });

        return result;
      } catch (error) {
        console.error('Generation failed:', error);
        // Call error callback if provided
        onError?.(error as Error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [session, isGenerating, updatePrompt, previewContent, onSuccess, onError]
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
