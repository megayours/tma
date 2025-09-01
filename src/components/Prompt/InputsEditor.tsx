import type { Prompt } from '@/types/prompt';
import { AvatarStack, Button, Avatar } from '@telegram-apps/telegram-ui';
import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const InputsEditor = ({ prompt }: { prompt: Prompt }) => {
  const [isModifyingNFTs, setIsModifyingNFTs] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const longPressTimeoutRef = useRef<number | null>(null);

  const handleLongPress = (
    index: number,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(`Long pressed NFT ${index + 1}`);
    // Add your long press action here
  };

  const handleMouseDown = (
    index: number,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    if (!isModifyingNFTs) return; // Only track long press when modifying NFTs

    longPressTimeoutRef.current = setTimeout(() => {
      handleLongPress(index, event);
    }, 500); // 500ms = 0.5 seconds
  };

  const handleMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      // Get the container width to calculate the translation distance
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.offsetWidth;

      // Calculate the distance to move (from right to center)
      const translateDistance = (containerWidth - contentWidth) / 2;

      gsap.to(contentRef.current, {
        x: isModifyingNFTs ? -translateDistance : 0,
        duration: 2,
        ease: 'power2.out',
      });

      // Animate the margin of each Avatar
      const avatars = contentRef.current.querySelectorAll('[class*="-ml-"]');
      avatars.forEach(avatar => {
        gsap.to(avatar, {
          marginLeft: isModifyingNFTs ? '8px' : '-8px', // 4 = 16px, -2 = -8px
          duration: 2,
          ease: 'power2.out',
        });
      });
    }
  }, [isModifyingNFTs]);

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-row items-center px-4"
      style={{ justifyContent: 'flex-end' }}
    >
      <div
        ref={contentRef}
        className="flex flex-row items-center"
        onClick={() => setIsModifyingNFTs(!isModifyingNFTs)}
      >
        {Array.from({ length: prompt.maxTokens ?? 1 }).map((_, index) => (
          <div
            key={index}
            className="bg-tg-bg -ml-2 flex flex-row items-center gap-2 rounded-full px-2 py-1"
            onMouseDown={e => handleMouseDown(index, e)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isModifyingNFTs && (
              <h1 className="text-tg-text text-sm">NFT {index + 1}</h1>
            )}

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
        ))}
      </div>
    </div>
  );
};
