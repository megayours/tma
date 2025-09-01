import { useState, useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { gsap } from 'gsap';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import { Button, Card, IconButton } from '@telegram-apps/telegram-ui';
import { BsThreeDots, BsChevronDown } from 'react-icons/bs';
import { TopBar } from '@/components/ui/TopBar';
import { PromptSettings } from './PromptSettings';

interface PromptBarProps {
  prompt: Prompt;
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
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
  setSelectedNFTs,
  settingsOpen,
  setSettingsOpen,
}: PromptBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  useEffect(() => {
    if (dropdownRef.current) {
      if (isExpanded) {
        // Animate dropdown opening
        gsap.to(dropdownRef.current, {
          height: 'auto',
          duration: 0.3,
          ease: 'power2.out',
          onStart: () => {
            gsap.set(dropdownRef.current, { height: 0, overflow: 'hidden' });
          },
          onComplete: () => {
            gsap.set(dropdownRef.current, {
              height: 'auto',
              overflow: 'visible',
            });
          },
        });

        // Animate chevron rotation
        gsap.to(chevronRef.current, {
          rotation: 180,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Animate dropdown closing
        gsap.to(dropdownRef.current, {
          height: 0,
          duration: 0.3,
          ease: 'power2.in',
          onStart: () => {
            gsap.set(dropdownRef.current, { overflow: 'hidden' });
          },
        });

        // Animate chevron rotation back
        gsap.to(chevronRef.current, {
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  }, [isExpanded]);

  return (
    <TopBar
      title={prompt.name}
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDropdown}
            className="hover:bg-tg-hint/10 flex h-6 w-6 items-center justify-center rounded-full transition-colors"
          >
            <div ref={chevronRef}>
              <BsChevronDown className="text-tg-hint text-sm" />
            </div>
          </button>
          <IconButton
            mode="plain"
            size="l"
            className="text-tg-hint hover:text-tg-text"
            onClick={toggleSettings}
          >
            <BsThreeDots />
          </IconButton>
        </div>
      }
    >
      {/* Dropdown content for prompt details */}
      <div ref={dropdownRef} className="overflow-hidden" style={{ height: 0 }}>
        <div className="px-4 py-3">
          <div className="space-y-3">
            {/* Prompt description */}
            {prompt.description && (
              <div>
                <h3 className="text-tg-text mb-1 text-sm font-medium">
                  Description
                </h3>
                <p className="text-tg-hint text-sm">{prompt.description}</p>
              </div>
            )}

            {/* Selected NFTs count */}
            <div>
              <h3 className="text-tg-text mb-2 text-sm font-medium">
                Selected NFTs
              </h3>
              {selectedNFTs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedNFTs.map((nft, index) => (
                    <div
                      key={`${nft.contract.address}-${nft.id}`}
                      className="bg-tg-hint/10 flex items-center gap-2 rounded-lg px-2 py-1"
                    >
                      <span className="text-tg-text text-xs">
                        {nft.name || `#${nft.id}`}
                      </span>
                      <button
                        onClick={() => {
                          const newSelected = selectedNFTs.filter(
                            (_, i) => i !== index
                          );
                          setSelectedNFTs(newSelected);
                        }}
                        className="text-tg-hint hover:text-tg-text text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-tg-hint text-sm">No NFTs selected</p>
              )}
            </div>

            {/* Additional prompt details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-tg-hint">Created:</span>
                <span className="text-tg-text ml-2">
                  {prompt.createdAt
                    ? new Date(prompt.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
              {prompt.updatedAt && (
                <div>
                  <span className="text-tg-hint">Updated:</span>
                  <span className="text-tg-text ml-2">
                    {new Date(prompt.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings popup */}
      <PromptSettings
        prompt={prompt}
        selectedNFTs={selectedNFTs}
        isOpen={settingsOpen}
      />
    </TopBar>
  );
};
