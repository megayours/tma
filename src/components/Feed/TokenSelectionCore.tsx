import { useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { TokenSlot } from './TokenSlot';
import { NFTSelectionFlow } from '../NFT/flows';
import { useGetCollectionsWithPrompt } from '@/hooks/useCollections';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';

interface TokenSelectionCoreProps {
  selectedFavorite: { token: Token };
  requiredTokens: number;
  optionalTokens: number;
  onGenerate: (tokens: Token[]) => void;
  prompt: Prompt;
  showHeader?: boolean;
  onClose?: () => void;
  className?: string;
}

export const TokenSelectionCore = ({
  selectedFavorite,
  requiredTokens,
  optionalTokens,
  onGenerate,
  prompt,
  showHeader = false,
  onClose,
  className = '',
}: TokenSelectionCoreProps) => {
  const [selectedTokens, setSelectedTokens] = useState<(Token | null)[]>(() => {
    const tokens = Array(requiredTokens + optionalTokens).fill(null);
    tokens[0] = selectedFavorite.token;
    return tokens;
  });
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const { data: collections } = useGetCollectionsWithPrompt(prompt);

  const handleSlotClick = (index: number) => {
    setActiveSlotIndex(index);
  };

  const handleTokenSelect = (token: Token) => {
    if (activeSlotIndex !== null) {
      const newTokens = [...selectedTokens];
      newTokens[activeSlotIndex] = token;
      setSelectedTokens(newTokens);
      setActiveSlotIndex(null);
    }
  };

  const handleCloseSelection = () => {
    setActiveSlotIndex(null);
  };

  const handleGenerate = () => {
    const allTokens = selectedTokens.filter(Boolean) as Token[];
    onGenerate(allTokens);
  };

  const isGenerationEnabled = () => {
    return selectedTokens
      .slice(0, requiredTokens)
      .every(token => token !== null);
  };

  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`bg-tg-bg border-tg-hint/20 rounded-lg border shadow-lg ${className}`}
      onClick={handleCloudClick}
    >
      {/* Header */}
      {showHeader && (
        <div className="border-tg-section-separator flex items-center justify-between border-b p-4">
          <h3 className="text-tg-text text-lg font-semibold">Select NFTs</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-tg-hint hover:text-tg-text text-xl transition-colors"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* Token Slots Grid */}
      <div className="p-4">
        {/* Required Tokens */}
        {requiredTokens > 0 && (
          <div className="mb-6">
            <div className="text-tg-text mb-3 text-center text-sm font-medium">
              Required NFTs
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: requiredTokens }, (_, index) => (
                <TokenSlot
                  key={`required-${index}`}
                  type={index === 0 ? 'favorite' : 'required'}
                  token={selectedTokens[index]}
                  index={index === 0 ? undefined : index}
                  onClick={() => handleSlotClick(index)}
                  size={index === 0 ? 'large' : 'medium'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Tokens */}
        {optionalTokens > 0 && (
          <div className="mb-6">
            <div className="text-tg-text mb-3 text-center text-sm font-medium">
              Optional NFTs
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {Array.from({ length: optionalTokens }, (_, index) => (
                <TokenSlot
                  key={`optional-${index}`}
                  type="optional"
                  token={selectedTokens[requiredTokens + index]}
                  index={requiredTokens + index}
                  onClick={() => handleSlotClick(requiredTokens + index)}
                  size="medium"
                />
              ))}
            </div>
          </div>
        )}

        {activeSlotIndex !== null && (
          <div className="border-tg-section-separator border-t pt-4">
            <NFTSelectionFlow
              collections={collections || []}
              onTokenSelect={handleTokenSelect}
              enableMascotMode={true}
              segmentedControlStyle="buttons"
            />

            <div className="flex justify-center mt-4">
              <Button mode="outline" size="s" onClick={handleCloseSelection}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="border-tg-section-separator bg-tg-bg mt-6 border-t">
          <div className="flex w-full justify-center p-4">
            <Button
              mode="filled"
              size="l"
              onClick={handleGenerate}
              disabled={!isGenerationEnabled()}
              className="w-full max-w-sm"
            >
              Generate Content
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
