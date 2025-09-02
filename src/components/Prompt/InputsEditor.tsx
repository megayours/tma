import type { Prompt } from '@/types/prompt';
import { AvatarStack, Button, Avatar } from '@telegram-apps/telegram-ui';
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useLongPress } from 'use-long-press';
import { SelectCollection } from '../SelectCollection';
import { SelectTokenId } from '../SelectTokenId';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetSupportedCollections } from '@/hooks/useCollections';

/**
 * Custom hook for managing GSAP animations
 * Handles the smooth transitions when entering/exiting NFT modification mode
 * @param isModifyingNFTs - Whether we're in NFT modification mode
 */
const useNFTAnimations = (isModifyingNFTs: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      // Calculate the distance to move content from right to center
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.offsetWidth;
      const translateDistance = (containerWidth - contentWidth) / 2;

      // Animate the content container position
      gsap.to(contentRef.current, {
        x: isModifyingNFTs ? -translateDistance : 0, // Move left when modifying, back to 0 when not
        duration: 1,
        ease: 'power2.out',
      });

      // Animate the margin of each NFT item
      const avatars = contentRef.current.querySelectorAll('[class*="-ml-"]');
      avatars.forEach(avatar => {
        gsap.to(avatar, {
          marginLeft: isModifyingNFTs ? '8px' : '-8px', // Spread apart when modifying, overlap when not
          duration: 1,
          ease: 'power2.out',
        });
      });
    }
  }, [isModifyingNFTs]);

  return { containerRef, contentRef };
};

/**
 * Cloud tooltip component that appears above NFTs when long pressed
 * Shows additional options or information for the selected NFT
 * Now keyboard-aware and positions itself properly when keyboard opens
 */
const NFTCloud = ({
  index,
  supportedCollections,
}: {
  index: number;
  supportedCollections: SupportedCollection[];
}) => {
  const [selectedCollection, setSelectedCollection] =
    useState<SupportedCollection | null>(null);

  const handleCollectionSelect = (collection: SupportedCollection) => {
    console.log('NFTCloud: Collection selected:', collection.name);
    // Remove focus from any active textarea to prevent keyboard from opening
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setSelectedCollection(collection);
  };

  const handleBack = () => {
    setSelectedCollection(null);
  };

  const handleTokenSelect = (tokenId: string) => {
    console.log(
      'Selected token:',
      tokenId,
      'for collection:',
      selectedCollection?.name
    );
    // Here you can handle the token selection
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  console.log('NFTCloud: supportedCollections:', supportedCollections);

  return (
    <div
      className="bg-tg-bg overflow-y absolute -top-[400px] left-1/2 z-[9999] max-h-96 w-screen -translate-x-1/2 rounded-lg border border-gray-200 shadow-lg"
      data-cloud-index={index} // Used to identify this specific cloud for click-outside detection
      onClick={handleCloudClick}
    >
      {!selectedCollection && (
        <SelectCollection
          collections={supportedCollections || []}
          onCollectionSelect={handleCollectionSelect}
          size="s"
        />
      )}
      {selectedCollection && (
        <SelectTokenId
          collection={selectedCollection}
          onBack={handleBack}
          onTokenSelect={handleTokenSelect}
        />
      )}
    </div>
  );
};

/**
 * Individual NFT item component
 * Handles the display and interaction for a single NFT
 */
const NFTItem = ({
  index,
  isModifyingNFTs,
  longPressedIndex,
  onLongPress,
  supportedCollections,
}: {
  index: number;
  isModifyingNFTs: boolean;
  longPressedIndex: number | null;
  onLongPress: (index: number) => void;
  supportedCollections: SupportedCollection[];
}) => {
  const longPressBind = useLongPress(() => onLongPress(index), {
    threshold: 500, // 500ms threshold for long press
    cancelOnMovement: true, // Cancel if finger moves
  });

  return (
    <div
      key={index}
      className="bg-tg-bg relative -ml-2 flex flex-row items-center gap-2 rounded-full px-2 py-1 select-none"
      {...longPressBind()}
    >
      {/* Show cloud tooltip when this NFT is long pressed */}
      {longPressedIndex === index && (
        <NFTCloud
          index={index}
          supportedCollections={supportedCollections || []}
        />
      )}

      {/* Show NFT label when in modification mode */}
      {isModifyingNFTs && (
        <h1 className="text-tg-text text-sm select-none">NFT {index + 1}</h1>
      )}

      {/* NFT avatar */}
      <Avatar
        key={index}
        className=""
        onClick={() => {
          console.log('CLICKED');
          // Close cloud tooltip if it's open
          if (longPressedIndex === index) {
            // This will be handled by the parent component's click outside handler
          }
        }}
        src={'/nfts/not-available.png'}
        size={20}
      />
    </div>
  );
};

/**
 * Main InputsEditor component
 * Manages the overall state and renders the NFT grid with long press functionality
 */
export const InputsEditor = ({ prompt }: { prompt: Prompt }) => {
  // State to track whether we're in NFT modification mode
  const [isModifyingNFTs, setIsModifyingNFTs] = useState(false);

  const { data: supportedCollections } = useGetSupportedCollections();

  // Hook for managing GSAP animations
  const { containerRef, contentRef } = useNFTAnimations(isModifyingNFTs);
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);

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
    <div
      ref={containerRef}
      className="flex h-full flex-row items-center px-4"
      style={{ justifyContent: 'flex-end' }}
    >
      <div
        ref={contentRef}
        className="flex flex-row items-center"
        onClick={() => !isModifyingNFTs && setIsModifyingNFTs(!isModifyingNFTs)} // Toggle modification mode only when not already modifying
      >
        {/* Render NFT items based on prompt.maxTokens */}
        {Array.from({ length: prompt.maxTokens ?? 1 }).map((_, index) => (
          <NFTItem
            key={index}
            index={index}
            isModifyingNFTs={isModifyingNFTs}
            longPressedIndex={longPressedIndex}
            onLongPress={handleLongPress}
            supportedCollections={supportedCollections || []}
          />
        ))}
      </div>
    </div>
  );
};
