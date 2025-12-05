import type { Token } from '@/types/response';
import { useState, useEffect } from 'react';
import { NFTSelector } from '@/routes/sticker-packs/$stickerPackId/select-nfts/NFTSelector';

// Selected NFT Display Component
export function SelectedNFTDisplay({
  selectedNFT,
  onToggleSelector,
  sizeOpen = 'h-52 w-52',
  sizeClosed = 'h-24 w-24',
}: {
  selectedNFT: Token | null;
  isSelectorOpen: boolean;
  onToggleSelector: () => void;
  sizeOpen?: string;
  sizeClosed?: string;
}) {
  const [selectedNFTs, setSelectedNFTs] = useState<Token[]>([]);
  // State for selector visibility
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Open selector if no NFT selected, close if one is selected
  useEffect(() => {
    setIsSelectorOpen(selectedNFTs.length === 0);
  }, [selectedNFTs.length]);

  const handleTokenSelect = useCallback((token: Token, index: number) => {
    setSelectedNFTs(token ? [token] : []);
    setIsSelectorOpen(false);
  }, []);

  const handleToggleSelector = () => {
    setIsSelectorOpen(prev => !prev);
  };

  return (
    <div>
      <div
        className={`flex items-center justify-center transition-all duration-500`}
      >
        <div className="flex flex-col items-center">
          {/* NFT Image - Circular with Edit Icon */}
          <div
            className="relative cursor-pointer transition-all duration-500 ease-in-out"
            onClick={onToggleSelector}
          >
            {selectedNFT.image && (
              <img
                src={selectedNFT.image}
                alt={selectedNFT.name || `NFT #${selectedNFT.id}`}
                className={`rounded-full object-cover transition-all duration-500 ease-in-out ${
                  isSelectorOpen ? sizeClosed : sizeOpen
                }`}
              />
            )}

            {/* Edit Icon - Overlay */}
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

          {/* NFT Info Below */}
          <div
            className={`text-tg-text text-center transition-all duration-500 ease-in-out ${
              isSelectorOpen ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div
              className={`font-semibold transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'text-sm' : 'text-base'
              }`}
            >
              {selectedNFT.name || `NFT #${selectedNFT.id}`}
            </div>
            <div
              className={`text-tg-hint transition-all duration-500 ease-in-out ${
                isSelectorOpen ? 'text-xs' : 'text-sm'
              }`}
            >
              {selectedNFT.contract?.name || 'Unknown Collection'}
            </div>
          </div>
        </div>
      </div>
      {/* NFT Selector */}
      {isSelectorOpen && (
        <NFTSelector
          collections={collections}
          onTokenSelect={handleTokenSelect}
          selectedNFT={selectedNFTs[0] || null}
          onCancel={() => setIsSelectorOpen(false)}
        />
      )}
    </div>
  );
}
