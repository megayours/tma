import { useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import type { Prompt } from '../../types/prompt';
import { NFTItem } from './NFTItem';

/**
 * InputSelector component
 * Renders a single NFT set with all its tokens
 */
export const InputSelector = ({
  nftSet,
  isOpen,
  prompt,
  onCloudClose,
  setIndex,
}: {
  nftSet: Token[];
  isOpen: boolean;
  prompt: Prompt;
  onCloudClose: () => void;
  setIndex: number;
}) => {
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);

  // Enhanced onCloudClose that resets both states
  const handleCloudClose = () => {
    setLongPressedIndex(null);
    onCloudClose();
  };

  // Handle long press on NFT items
  const handleLongPress = (index: number) => {
    // Remove focus from any active textarea to prevent keyboard from opening
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setLongPressedIndex(index);
  };

  // Handle click outside to close cloud tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-cloud-index]')) {
        setLongPressedIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-row items-center">
      {/* Render NFT items from the nftSet */}
      {nftSet.map((token, index) => (
        <NFTItem
          key={index}
          token={token}
          index={index}
          isModifyingNFTs={isOpen}
          longPressedIndex={longPressedIndex}
          onLongPress={handleLongPress}
          prompt={prompt}
          onCloudClose={handleCloudClose}
          setIndex={setIndex}
        />
      ))}
    </div>
  );
};
