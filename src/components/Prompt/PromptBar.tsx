import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import { IconButton } from '@telegram-apps/telegram-ui';
import { TopBar } from '@/components/ui';
import { PromptSettings } from './PromptSettings';
import { usePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { Link } from '@tanstack/react-router';
import { FaChevronDown } from 'react-icons/fa';

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

  // Handle publication toggle
  const handlePublicationToggle = async () => {
    if (promptMutation.isPending) return;

    try {
      await promptMutation.mutateAsync({
        prompt: {
          ...prompt,
          published: prompt.published ? 0 : 1,
        },
      });
    } catch (error) {
      console.error('Failed to update publication status:', error);
    }
  };

  // Determine button text and state
  const getButtonText = () => {
    if (promptMutation.isPending) {
      return 'Saving...';
    }
    return settingsOpen ? 'Save' : 'Settings';
  };

  return (
    <TopBar
      title={
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Row 1: Prompt Name */}
          <div className="flex flex-col items-center gap-0">
            <div className="flex flex-row gap-2">
              <div className="flex flex-row items-center">
                <Link to={`/profile/admin`}>
                  <FaChevronDown />
                </Link>
              </div>
              <h1 className="text-tg-text text-lg font-bold">{prompt.name}</h1>
            </div>
            <div className="">
              <span className="text-xs font-medium">({prompt.type})</span>
            </div>
          </div>

          {/* Row 2: Type, Status, and Edit Button */}
          <div className="text-tg-text flex items-center justify-center gap-2">
            <div
              onClick={handlePublicationToggle}
              className="cursor-pointer overflow-hidden rounded-4xl border border-white/20 bg-white/10 px-3 py-1 shadow-sm backdrop-blur-lg hover:opacity-80 transition-opacity"
            >
              <span className="text-xs font-medium">
                {promptMutation.isPending ? 'updating...' : prompt.published ? 'published' : 'unpublished'}
              </span>
            </div>
            <div className="bg-tg-button text-tg-button-text overflow-hidden rounded-4xl border border-white/20 px-4 py-1 shadow-lg backdrop-blur-lg">
              <IconButton
                mode="plain"
                size="s"
                className="hover:text-tg-text flex h-6 items-center justify-center"
                onClick={toggleSettings}
                disabled={promptMutation.isPending}
              >
                {promptMutation.isPending && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                )}
                <span className="text-tg-button-text text-xs">
                  {getButtonText()}
                </span>
              </IconButton>
            </div>
          </div>
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
