import { useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import type { SupportedCollection } from '@/hooks/useCollections';
import { SelectedNFTDisplay } from '../SelectedNFTDisplay';
import { NFTSelector } from '../NFTSelector';

interface SelectNFTsStepProps {
  stepNumber: number;
  totalSteps: number;
  isRequired: boolean;
  collections?: SupportedCollection[];
  selectedToken: Token | null;
  onTokenSelect: (token: Token | null) => void;
  heading?: string;
}

/**
 * Single step component for the stepper UI
 * Displays the step heading and either SelectedNFTDisplay (if token selected)
 * or NFTSelector (if no token or selector is open)
 */
export function SelectNFTsStep({
  stepNumber,
  totalSteps,
  isRequired,
  collections,
  selectedToken,
  onTokenSelect,
  heading,
}: SelectNFTsStepProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(!selectedToken);

  useEffect(() => {
    setIsSelectorOpen(!selectedToken);
  }, [selectedToken]);

  const stepLabel = isRequired ? 'Required' : 'Optional';
  const displayHeading =
    heading ||
    `Step ${stepNumber + 1} of ${totalSteps}: Select Character ${stepNumber + 1} (${stepLabel})`;

  return (
    <div>
      <h2 className="text-tg-text mb-4 text-center text-lg font-semibold">
        {displayHeading}
      </h2>

      <SelectedNFTDisplay
        nfts={selectedToken}
        isSelectorOpen={isSelectorOpen}
        onToggleSelector={() => setIsSelectorOpen(!isSelectorOpen)}
      />

      {isSelectorOpen && (
        <NFTSelector
          collections={collections}
          onTokenSelect={token => {
            onTokenSelect(token);
            setIsSelectorOpen(false);
          }}
          selectedNFT={selectedToken}
          onCancel={() => setIsSelectorOpen(false)}
        />
      )}
    </div>
  );
}
