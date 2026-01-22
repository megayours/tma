import { NFTsSummary } from '../display/NFTsSummary';
import { NFTSelector } from './NFTSelector';
import type { NFTSelectionState } from '@/hooks/useNFTSelection';
import type { SupportedCollection } from '@/hooks/useCollections';

interface NFTSelectionPageUIProps {
  selectionState: NFTSelectionState;
  maxTokens: number;
  collections?: SupportedCollection[];
}

/**
 * Pure UI component for NFT selection pages
 * Displays either a summary view or step-by-step selection
 * Does NOT render buttons - parent route is responsible for button rendering
 */
export function NFTSelectionPageUI({
  selectionState,
  maxTokens,
  collections,
}: NFTSelectionPageUIProps) {
  const {
    selectedTokens,
    currentIndex,
    currentToken,
    showSummary,
    isRequired,
    setIsSelectorOpen,
    handleTokenSelect,
    handleModify,
    isLoading,
    tokenUsernamesByIndex,
  } = selectionState;

  if (isLoading) {
    return null; // Parent will handle loading state
  }

  // Convert index to step number for display (1-based)
  const currentStepNumber = currentIndex !== null ? currentIndex + 1 : null;

  console.log('NFTSelectionPage - selectedTokens:', selectedTokens);
  console.log('NFTSelectionPage - currentIndex:', currentIndex);
  console.log('NFTSelectionPage - showSummary:', showSummary);

  return (
    <div className="scrollbar-hide flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6">
        {showSummary ? (
          <>
            <h1 className="text-tg-text mb-4 text-center text-2xl font-bold">
              {maxTokens > 1 ? 'Characters Selection' : 'Character Selection'}
            </h1>
            <NFTsSummary
              tokens={selectedTokens}
              maxTokens={maxTokens}
              onModify={handleModify}
              usernamesByIndex={tokenUsernamesByIndex}
            />
          </>
        ) : (
          <>
            <h1 className="text-tg-text mb-2 text-center text-2xl font-bold">
              Character {currentStepNumber} of {maxTokens}
            </h1>
            <p className="text-tg-hint mb-4 text-center text-sm">
              {isRequired ? 'Required' : 'Optional'}
            </p>

            {/* <SelectedNFTDisplay
              nfts={currentToken}
              isSelectorOpen={isSelectorOpen}
              onToggleSelector={() => setIsSelectorOpen(!isSelectorOpen)}
              username={
                currentIndex !== null
                  ? tokenUsernamesByIndex?.[currentIndex]
                  : undefined
              }
            />

            {isSelectorOpen && */}
            {currentIndex !== null && (
              <NFTSelector
                collections={collections}
                onTokenSelect={token => handleTokenSelect(currentIndex, token)}
                selectedNFT={currentToken}
                onCancel={() => {
                  handleTokenSelect(currentIndex, null);
                  setIsSelectorOpen(false);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
