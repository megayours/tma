import { useMemo } from 'react';
import type { Token } from '@/types/response';

export interface SelectedNFTDisplayProps {
  /** Single token, array of tokens, or null */
  nfts: Token | Token[] | null;

  /** Whether the NFT selector is currently open */
  isSelectorOpen: boolean;

  /** Callback when user clicks to toggle the selector */
  onToggleSelector: () => void;

  /** Optional heading text displayed above the NFT (hidden when selector is open) */
  heading?: string;

  /** Display mode - 'first' shows only first NFT, 'grid' shows all (future) */
  displayMode?: 'first' | 'grid';
}

/**
 * Displays selected NFT(s) with a circular image, edit icon, and smooth transitions.
 * Used across multiple selection flows (content generation, sticker packs, etc.)
 *
 * Features:
 * - Smooth size transitions when selector opens/closes (52px <-> 24px)
 * - Circular NFT image with edit icon overlay
 * - NFT name and collection name below image
 * - Optional heading with fade animation
 * - Click handler to toggle selector
 */
export function SelectedNFTDisplay({
  nfts,
  isSelectorOpen,
  onToggleSelector,
  heading,
  displayMode = 'first',
}: SelectedNFTDisplayProps) {
  // Normalize input to always work with an array
  const nftArray = useMemo(() => {
    if (!nfts) return [];
    return Array.isArray(nfts) ? nfts : [nfts];
  }, [nfts]);

  // Early return if no NFTs to display
  if (nftArray.length === 0) return null;

  // For now, always display first NFT (displayMode='first')
  // Future: support displayMode='grid' for multiple NFTs
  const displayNFT = nftArray[0];

  return (
    <div>
      {/* Optional Heading - Animated visibility */}
      {heading && (
        <h2
          className={`text-tg-text text-center font-semibold transition-all duration-500 ${
            isSelectorOpen
              ? 'mb-0 h-0 overflow-hidden opacity-0'
              : 'mb-6 h-auto opacity-100'
          }`}
        >
          {heading}
        </h2>
      )}

      {/* NFT Display Container */}
      <div
        className={`flex items-center justify-center transition-all duration-500`}
      >
        <div className="flex flex-col items-center">
          {/* NFT Image - Circular with Edit Icon Overlay */}
          <div
            className="relative cursor-pointer transition-all duration-500 ease-in-out"
            onClick={onToggleSelector}
          >
            {displayNFT.image && (
              <img
                src={displayNFT.image}
                alt={displayNFT.name || `NFT #${displayNFT.id}`}
                className={`rounded-full object-cover transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? 'h-24 w-24' : 'h-52 w-52'
                }`}
              />
            )}

            {/* Edit Icon - Positioned overlay with size transitions */}
            <div
              className={`bg-tg-accent-text absolute rounded-full transition-all duration-500 ease-in-out hover:opacity-90 ${
                isSelectorOpen
                  ? 'right-1 bottom-1 p-1.5'
                  : 'right-3 bottom-3 p-2.5'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`text-white transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? 'h-3 w-3' : 'h-5 w-5'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </div>

          {/* NFT Info - Name and Collection with fade transition */}
          <div
            className={`text-tg-text text-center transition-all duration-500 ease-in-out ${
              isSelectorOpen ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* NFT Name */}
            <div
              className={`font-semibold transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'text-sm' : 'text-base'
              }`}
            >
              {displayNFT.name || `NFT #${displayNFT.id}`}
            </div>

            {/* Collection Name */}
            <div
              className={`text-tg-hint transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'text-xs' : 'text-sm'
              }`}
            >
              {displayNFT.contract?.name || 'Unknown Collection'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
