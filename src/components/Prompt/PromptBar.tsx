import { useState } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import {
  IconButton,
} from '@telegram-apps/telegram-ui';
import { TopBar } from '@/components/ui/TopBar';
import { PromptSettings } from './PromptSettings';
import { InlineButtonsItem } from '@telegram-apps/telegram-ui/dist/components/Blocks/InlineButtons/components/InlineButtonsItem/InlineButtonsItem';

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
  onPromptUpdate,
}: PromptBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleSettings = () => {
    if (settingsOpen) {
      // Closing settings - let PromptSettings handle auto-save
      setSettingsOpen(false);
    } else {
      // Opening settings
      setSettingsOpen(true);
    }
  };

  return (
    <TopBar
      title={prompt.name}
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDropdown}
            className="hover:bg-tg-hint/10 flex h-6 w-6 items-center justify-center rounded-full transition-colors"
          ></button>
          <IconButton
            mode="plain"
            size="l"
            className="text-tg-hint hover:text-tg-text"
            onClick={toggleSettings}
          >
            <InlineButtonsItem
              mode="plain"
              text={`${settingsOpen ? 'Save' : 'Edit'}`}
            ></InlineButtonsItem>
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
          onPromptUpdate={onPromptUpdate}
        />
      </div>
    </TopBar>
  );
};
