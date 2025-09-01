import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';

interface PromptSettingsProps {
  prompt: Prompt;
  selectedNFTs: Token[];
  isOpen: boolean;
}

/**
 * PromptSettings component that displays prompt settings in a dropdown/popup.
 * This component is designed to be used within a TopBar or similar container.
 *
 * @param prompt - The prompt object containing prompt data
 * @param selectedNFTs - Array of selected NFT tokens
 * @param isOpen - Whether the settings popup is open
 */
export const PromptSettings = ({
  prompt,
  selectedNFTs,
  isOpen,
}: PromptSettingsProps) => {
  const settingsRef = useRef<HTMLDivElement>(null);

  // GSAP animation for settings dropdown
  useEffect(() => {
    if (settingsRef.current) {
      if (isOpen) {
        // Animate settings opening (slide down)
        gsap.to(settingsRef.current, {
          height: 'auto',
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            gsap.set(settingsRef.current, { height: 0, overflow: 'hidden' });
          },
          onComplete: () => {
            gsap.set(settingsRef.current, {
              height: 'auto',
              overflow: 'visible',
            });
          },
        });
      } else {
        // Animate settings closing (slide up)
        gsap.to(settingsRef.current, {
          height: 0,
          duration: 0.3,
          ease: 'power2.in',
          onStart: () => {
            gsap.set(settingsRef.current, { overflow: 'hidden' });
          },
        });
      }
    }
  }, [isOpen]);

  // Log when settings are opened (3 dots pressed)
  useEffect(() => {
    if (isOpen) {
      console.log('3 dots pressed');
    }
  }, [isOpen]);

  return (
    <div
      ref={settingsRef}
      className="bg-tg-section-bg h-screen overflow-hidden"
      style={{ height: 0 }}
    >
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Prompt Settings</h1>
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Prompt Name</h2>
            <p className="text-tg-hint">{prompt.name}</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Created</h2>
            <p className="text-tg-hint">
              {prompt.createdAt
                ? new Date(prompt.createdAt).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Versions</h2>
            <p className="text-tg-hint">
              {prompt.versions?.length || 0} versions
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Selected NFTs</h2>
            <p className="text-tg-hint">{selectedNFTs.length} NFTs selected</p>
          </div>
        </div>
      </div>
    </div>
  );
};
