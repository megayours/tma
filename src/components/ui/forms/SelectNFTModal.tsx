import { Button } from '@telegram-apps/telegram-ui';
import { useState } from 'react';
import type { Prompt } from '@/types/prompt';
import { usePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';

interface SelectNFTModalProps {
  prompt: Prompt;
  onClose: () => void;
}

export const SelectNFTModal = ({ prompt, onClose }: SelectNFTModalProps) => {
  const { session } = useSession();
  const { mutateAsync: updatePrompt, isPending } = usePromptMutation(session);
  const [step, setStep] = useState<'choice' | 'completed'>('choice');

  const handleMandatoryAsset = async () => {
    try {
      const updatedPrompt = {
        ...prompt,
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        minTokens: (prompt.minTokens ?? 0) + 1,
      };

      await updatePrompt({ prompt: updatedPrompt });
      setStep('completed');
      // Close modal after a short delay to show feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  const handleOptionalAsset = async () => {
    try {
      const updatedPrompt = {
        ...prompt,
        maxTokens: (prompt.maxTokens ?? 0) + 1,
        // Don't increment minTokens for optional assets
      };

      await updatePrompt({ prompt: updatedPrompt });
      setStep('completed');
      // Close modal after a short delay to show feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to update prompt:', error);
    }
  };

  if (step === 'completed') {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="text-center">
          <div className="mb-2 text-2xl">✅</div>
          <div className="text-tg-text font-medium">NFT Asset Added</div>
          <div className="text-tg-hint text-sm">
            Min: {prompt.minTokens ?? 0}, Max: {prompt.maxTokens ?? 0}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="mb-4 text-center">
        <h3 className="text-tg-text mb-2 text-lg font-medium">Add NFT Asset</h3>
        <p className="text-tg-hint text-sm">
          Choose whether this NFT should be required or optional for content
          generation
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          mode="filled"
          size="l"
          onClick={handleMandatoryAsset}
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">Mandatory Asset</span>
            <span className="text-xs opacity-75">Required for generation</span>
          </div>
        </Button>

        <Button
          mode="bezeled"
          size="l"
          onClick={handleOptionalAsset}
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium">Optional Asset</span>
            <span className="text-xs opacity-75">
              Can be used but not required
            </span>
          </div>
        </Button>
      </div>

      <div className="text-tg-hint mt-2 text-center text-xs">
        Current tokens - Min: {prompt.minTokens ?? 0}, Max:{' '}
        {prompt.maxTokens ?? 0}
      </div>
    </div>
  );
};
