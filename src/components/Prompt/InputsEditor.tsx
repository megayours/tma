import type { Prompt } from '@/types/prompt';
import { AvatarStack, Button, Avatar } from '@telegram-apps/telegram-ui';
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { SelectCollection } from '../SelectCollection';
import { SelectTokenId } from '../SelectTokenId';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetSupportedCollections } from '@/hooks/useCollections';

/**
 * Custom hook for handling long press interactions
 * Manages the state and timing for long press detection
 * @param isActive - Whether long press detection should be active
 * @param onLongPress - Callback function when long press is detected
 */
const useLongPress = (
  isActive: boolean,
  onLongPress: (index: number) => void
) => {
  // Track which NFT is currently being long pressed
  const [longPressedIndex, setLongPressedIndex] = useState<number | null>(null);
  // Store the timeout reference to cancel if needed
  const longPressTimeoutRef = useRef<number | null>(null);

  /**
   * Handles mouse/touch down events
   * Starts a timer to detect long press after 500ms
   */
  const handleMouseDown = (
    index: number,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    if (!isActive) return; // Only track long press when modifying NFTs

    // Prevent default behavior to avoid text selection
    event.preventDefault();
    event.stopPropagation();

    // Start a 500ms timer to detect long press
    longPressTimeoutRef.current = setTimeout(() => {
      setLongPressedIndex(index);
      onLongPress(index);
    }, 500);
  };

  /**
   * Handles mouse/touch up events
   * Cancels the long press timer and stops propagation if long press occurred
   */
  const handleMouseUp = (event?: React.MouseEvent | React.TouchEvent) => {
    // Clear the long press timer
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    // If a long press occurred, stop event propagation
    if (longPressedIndex !== null && event) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /**
   * Handles clicks outside the cloud tooltip
   * Closes the cloud when clicking outside of it
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (longPressedIndex !== null) {
        const target = event.target as Element;
        // Find the cloud element using data attribute
        const cloudElement = document.querySelector(
          `[data-cloud-index="${longPressedIndex}"]`
        );

        // If click is outside the cloud, close it
        if (cloudElement && !cloudElement.contains(target)) {
          setLongPressedIndex(null);
        }
      }
    };

    // Add global click listener when cloud is open
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [longPressedIndex]);

  return {
    longPressedIndex,
    setLongPressedIndex,
    handleMouseDown,
    handleMouseUp,
  };
};

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
      className="bg-tg-bg absolute -top-100 left-2/3 z-50 max-h-96 w-screen -translate-x-1/2 overflow-y-auto rounded-lg shadow-lg"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        touchAction: 'manipulation',
        pointerEvents: 'auto',
      }}
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
  onMouseDown,
  onMouseUp,
  supportedCollections,
}: {
  index: number;
  isModifyingNFTs: boolean;
  longPressedIndex: number | null;
  onMouseDown: (
    index: number,
    event: React.MouseEvent | React.TouchEvent
  ) => void;
  onMouseUp: (event?: React.MouseEvent | React.TouchEvent) => void;
  supportedCollections: SupportedCollection[];
}) => (
  <div
    key={index}
    className="bg-tg-bg relative -ml-2 flex flex-row items-center gap-2 rounded-full px-2 py-1"
    style={{
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      touchAction: 'manipulation',
    }}
    onMouseDown={e => onMouseDown(index, e)}
    onMouseUp={e => onMouseUp(e)}
    onMouseLeave={e => onMouseUp(e)} // Cancel long press if mouse leaves
    onTouchStart={e => onMouseDown(index, e)}
    onTouchEnd={e => onMouseUp(e)}
    onTouchCancel={e => onMouseUp(e)}
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
      <h1 className="text-tg-text text-sm">NFT {index + 1}</h1>
    )}

    {/* NFT avatar */}
    <Avatar
      key={index}
      className=""
      onClick={() => {
        console.log('CLICKED');
      }}
      src={'/nfts/not-available.png'}
      size={20}
    />
  </div>
);

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

  // Hook for managing long press interactions
  const { longPressedIndex, handleMouseDown, handleMouseUp } = useLongPress(
    isModifyingNFTs, // Only allow long press when in modification mode
    (index: number) => {
      console.log(`Long pressed NFT ${index + 1}`);
      // Add your long press action here
    }
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-row items-center px-4"
      style={{ justifyContent: 'flex-end' }}
    >
      <div
        ref={contentRef}
        className="flex flex-row items-center"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          touchAction: 'manipulation',
        }}
        onClick={() => !isModifyingNFTs && setIsModifyingNFTs(!isModifyingNFTs)} // Toggle modification mode only when not already modifying
      >
        {/* Render NFT items based on prompt.maxTokens */}
        {Array.from({ length: prompt.maxTokens ?? 1 }).map((_, index) => (
          <NFTItem
            key={index}
            index={index}
            isModifyingNFTs={isModifyingNFTs}
            longPressedIndex={longPressedIndex}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            supportedCollections={supportedCollections || []}
          />
        ))}
      </div>
    </div>
  );
};
