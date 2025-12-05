import { SelectedNFTDisplay } from './SelectedNFTDisplay';
import type { Token } from '@/types/response';

interface SelectedNFTsDisplayProps {
  selectedNFTs: Token[];
  isSelectorOpen: boolean;
  onToggleSelector: () => void;
}

export function SelectedNFTsDisplay({
  selectedNFTs,
}: SelectedNFTsDisplayProps) {
  if (selectedNFTs.length === 1) {
    return (
      <div className="mb-6 flex justify-center">
        <SelectedNFTDisplay
          selectedNFT={selectedNFTs[0]}
          isSelectorOpen={isSelectorOpen}
          onToggleSelector={onToggleSelector}
        />
      </div>
    );
  }
  return (
    <div className="no-scrollbar scrollbar-hide mb-6 flex flex-row gap-4 overflow-x-scroll pl-2 whitespace-nowrap">
      {selectedNFTs.map((nft, index) => {
        return (
          <div
            key={`${nft.contract.address}-${nft.id}-${index}`}
            className="shrink-0"
          >
            <SelectedNFTDisplay
              selectedNFT={nft}
              isSelectorOpen={isSelectorOpen}
              onToggleSelector={onToggleSelector}
            />
          </div>
        );
      })}
    </div>
  );
}
