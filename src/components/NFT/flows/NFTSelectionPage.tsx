import { NFTsSummary } from '../display/NFTsSummary';
import { SelectedNFTDisplay } from '../display/SelectedNFTDisplay';
import { NFTSelector } from './NFTSelector';
import type { NFTSelectionPageState } from '@/hooks/useNFTSelectionPage';
import type { SupportedCollection } from '@/hooks/useCollections';

interface NFTSelectionPageUIProps {
  selectionState: NFTSelectionPageState;
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
    currentStep,
    currentToken,
    isSelectorOpen,
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
              Character {currentStep} of {maxTokens}
            </h1>
            <p className="text-tg-hint mb-4 text-center text-sm">
              {isRequired ? 'Required' : 'Optional'}
            </p>

            <SelectedNFTDisplay
              nfts={currentToken}
              isSelectorOpen={isSelectorOpen}
              onToggleSelector={() => setIsSelectorOpen(!isSelectorOpen)}
              username={
                currentStep !== null
                  ? tokenUsernamesByIndex?.[currentStep - 1]
                  : undefined
              }
            />

            {isSelectorOpen && (
              <NFTSelector
                collections={collections}
                onTokenSelect={handleTokenSelect}
                selectedNFT={currentToken}
                onCancel={() => setIsSelectorOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
