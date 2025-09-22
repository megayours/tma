import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import { IconButton } from '@telegram-apps/telegram-ui';
import { TopBar } from '@/components/ui';
import { PromptSettings } from './PromptSettings';
import { usePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';

interface PromptBarProps {
  prompt: Prompt;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  onPromptUpdate?: (updatedPrompt: Prompt) => void;
}

/**
 * PromptBar component that displays at the top of the prompt editor page.
 * Uses the TopBar component to show prompt information and settings popup.
 *
 * @param prompt - The current prompt object
 * @param selectedNFTs - Array of selected NFT tokens
 * @param setSelectedNFTs - Function to update the selected NFTs
 * @param settingsOpen - Whether the settings are open
 * @param setSettingsOpen - Function to toggle settings open state
 *
 * @example
 * ```tsx
 * <PromptBar
 *   prompt={currentPrompt}
 *   selectedNFTs={selectedNFTs}
 *   setSelectedNFTs={setSelectedNFTs}
 *   settingsOpen={settingsOpen}
 *   setSettingsOpen={setSettingsOpen}
 * />
 * ```
 */
export const PromptBar = ({
  prompt,
  selectedNFTs,
  settingsOpen,
  setSettingsOpen,
}: PromptBarProps) => {
  const { session } = useSession();
  const promptMutation = usePromptMutation(session);

  const toggleSettings = () => {
    if (settingsOpen) {
      // Closing settings - let PromptSettings handle auto-save
      setSettingsOpen(false);
    } else {
      // Opening settings
      setSettingsOpen(true);
    }
  };

  // Determine button text and state
  const getButtonText = () => {
    if (promptMutation.isPending) {
      return 'Saving...';
    }
    return settingsOpen ? 'Save' : 'Edit';
  };

  return (
    <TopBar
      title={`${prompt.name} (${prompt.published ? 'published' : 'unpublished'})`}
      actions={
        <div className="flex items-center justify-center gap-3">
          <IconButton
            mode="plain"
            size="s"
            className="text-tg-hint hover:text-tg-text flex h-12 items-center justify-center"
            onClick={toggleSettings}
            disabled={promptMutation.isPending}
          >
            {promptMutation.isPending && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
            {getButtonText()}
          </IconButton>
        </div>
      }
    >
      {/* Settings popup */}
      <div className="w-screen">
        <PromptSettings
          prompt={prompt}
          selectedNFTs={selectedNFTs}
          isOpen={settingsOpen}
          promptMutation={promptMutation}
        />
      </div>
    </TopBar>
  );
};
