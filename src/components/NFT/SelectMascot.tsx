import { useState, useRef, useEffect } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';
import { type SupportedCollection } from '@/hooks/useCollections';
import { type Token } from '../../types/response';

export interface SelectMascotProps {
  collection: SupportedCollection;
  onBack: () => void;
  className?: string;
  onTokenSelect: (tokenId: string) => void;
  onSubmitNFT: (token: Token) => void;
}

export function SelectMascot({
  collection,
  onBack,
  className = '',
  onTokenSelect,
  onSubmitNFT,
}: SelectMascotProps) {
  // Fetch tokens with IDs 1-5
  const token1 = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    '0'
  );
  const token2 = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    '1'
  );
  const token3 = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    '2'
  );
  const token4 = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    '3'
  );
  const token5 = useGetNFTByCollectionAndTokenId(
    collection.chain,
    collection.address,
    '4'
  );

  // Combine token responses
  const tokenResponses = [token1, token2, token3, token4, token5];
  console.log('torknens', token1);
  const tokens = tokenResponses.map(response => response.data).filter(Boolean);
  const isLoading = tokenResponses.some(response => response.isLoading);

  // Calculate middle index based on available tokens
  const middleIndex = Math.floor((tokens.length - 1) / 2);

  // State management
  const [selectedIndex, setSelectedIndex] = useState(middleIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update selected index when tokens load
  useEffect(() => {
    if (tokens.length > 0) {
      setSelectedIndex(middleIndex);
    }
  }, [middleIndex, tokens.length]);

  // Scroll to item
  const scrollToIndex = (index: number) => {
    if (itemRefs.current[index]) {
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      setSelectedIndex(index);
    }
  };

  // Handle navigation buttons
  const handlePrevious = () => {
    if (selectedIndex > 0) {
      scrollToIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < tokens.length - 1) {
      scrollToIndex(selectedIndex + 1);
    }
  };

  // Handle item click
  const handleItemClick = (index: number) => {
    scrollToIndex(index);
  };

  // Auto-scroll to center item on mount
  useEffect(() => {
    if (tokens.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        scrollToIndex(middleIndex);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tokens.length, isLoading, middleIndex]);

  // Handle scroll events to update selected index
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      itemRefs.current.forEach((item, index) => {
        if (item) {
          const itemRect = item.getBoundingClientRect();
          const itemCenter = itemRect.left + itemRect.width / 2;
          const distance = Math.abs(containerCenter - itemCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      setSelectedIndex(closestIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [tokens.length]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex flex-row">
          <div>
            <Button mode="plain" size="s" onClick={onBack} className="w-fit">
              ←
            </Button>
          </div>
          <h1 className="text-tg-text text-xl">{collection.name}</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-tg-hint text-sm">Loading mascots...</div>
        </div>
      </div>
    );
  }

  // Show empty state if no tokens
  if (tokens.length === 0) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="flex flex-row">
          <div>
            <Button mode="plain" size="s" onClick={onBack} className="w-fit">
              ←
            </Button>
          </div>
          <h1 className="text-tg-text text-xl">{collection.name}</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-tg-hint text-sm">No mascots available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-row">
        <div>
          <Button mode="plain" size="s" onClick={onBack} className="w-fit">
            ←
          </Button>
        </div>
        <h1 className="text-tg-text text-xl">{collection.name}</h1>
      </div>

      {/* Carousel */}
      <div className="relative py-8">
        {/* Left arrow button */}
        <button
          onClick={handlePrevious}
          disabled={selectedIndex === 0}
          className="bg-tg-secondary text-tg-text hover:bg-tg-secondary/80 absolute top-1/2 left-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right arrow button */}
        <button
          onClick={handleNext}
          disabled={selectedIndex === tokens.length - 1}
          className="bg-tg-secondary text-tg-text hover:bg-tg-secondary/80 absolute top-1/2 right-2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Carousel container */}
        <div
          ref={containerRef}
          className={`scrollbar-hide flex h-56 snap-x snap-mandatory items-center gap-4 overflow-x-auto px-16 ${tokens.length === 1 ? 'justify-center' : ''}`}
        >
          {tokens.map((token, index) => {
            const isCenter = index === selectedIndex;

            if (!token) return;

            return (
              <div
                key={token.id}
                ref={el => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleItemClick(index)}
                className="flex-shrink-0 cursor-pointer snap-center transition-all duration-300"
                style={{
                  transform: isCenter ? 'scale(1.2)' : 'scale(1)',
                  opacity: isCenter ? 1 : 0.6,
                }}
              >
                <div
                  className={`relative h-32 w-32 rounded-full transition-all duration-300 ${
                    isCenter
                      ? 'border-tg-button border-4'
                      : 'border-tg-section-separator border-2'
                  }`}
                >
                  {/* Image */}
                  <img
                    src={token.image || '/nfts/not-available.png'}
                    alt={token.name || `Token #${token.id}`}
                    className="h-full w-full rounded-full object-contain"
                    loading="lazy"
                  />

                  {/* Token ID badge */}
                  <div className="bg-tg-secondary text-tg-text absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold shadow-md">
                    #{token.id}
                  </div>
                </div>

                {/* Token name */}
                {token.name && (
                  <div className="mt-4 text-center">
                    <div className="text-tg-text max-w-[128px] truncate text-sm font-medium">
                      {token.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Select button */}
      {onSubmitNFT && onTokenSelect && tokens[selectedIndex] && (
        <div className="flex justify-center px-4 pb-4">
          <Button
            size="l"
            stretched
            onClick={() => {
              onTokenSelect(tokens[selectedIndex]!.id);
              onSubmitNFT(tokens[selectedIndex]!);
            }}
            className="max-w-md"
          >
            Select #{tokens[selectedIndex].id}
          </Button>
        </div>
      )}
    </div>
  );
}
