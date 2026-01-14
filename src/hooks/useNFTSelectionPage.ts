import type { SupportedCollection } from '@/hooks/useCollections';
import { useNFTSelectionFlow } from './useNFTSelectionFlow';

interface UseNFTSelectionPageProps {
  minTokens: number;
  maxTokens: number;
  collections?: SupportedCollection[];
  urlParams: Record<string, any>;
}

/**
 * Hook for managing NFT selection page state
 * Wraps useNFTSelectionFlow and exposes state + computed values
 * Used by routes to access selection state for rendering buttons
 */
export function useNFTSelectionPage({
  minTokens,
  maxTokens,
  collections,
  urlParams,
}: UseNFTSelectionPageProps) {
  const flowState = useNFTSelectionFlow({
    minTokens,
    maxTokens,
    collections,
    urlParams,
  });

  // Check if there are empty slots
  const hasEmptySlots = () => {
    for (let i = 0; i < maxTokens; i++) {
      if (!flowState.selectedTokens[i]) {
        return true;
      }
    }
    return false;
  };

  // Find first empty slot index
  const getFirstEmptySlotIndex = () => {
    for (let i = 0; i < maxTokens; i++) {
      if (!flowState.selectedTokens[i]) {
        return i;
      }
    }
    return -1;
  };

  // Navigate to next empty slot or select current token
  const handleNext = () => {
    // If we're on the summary screen, navigate to first empty slot
    if (flowState.showSummary && !flowState.currentToken) {
      const firstEmptyIndex = getFirstEmptySlotIndex();
      if (firstEmptyIndex !== -1) {
        const stepNumber = firstEmptyIndex + 1;
        window.location.hash = `#${stepNumber}`;
        return;
      }
    }

    // Otherwise, select the current token
    if (flowState.currentToken) {
      flowState.handleTokenSelect(flowState.currentToken);
    }
  };

  const hasEmptySlotsValue = hasEmptySlots();

  return {
    // Core state
    selectedTokens: flowState.selectedTokens,
    currentStep: flowState.currentStep,
    currentToken: flowState.currentToken,
    isSelectorOpen: flowState.isSelectorOpen,
    showSummary: flowState.showSummary,
    isRequired: flowState.isRequired,
    isLoading: flowState.isLoading,
    notify: flowState.notify,

    // Actions
    setIsSelectorOpen: flowState.setIsSelectorOpen,
    handleTokenSelect: flowState.handleTokenSelect,
    handleSkip: flowState.handleSkip,
    handleModify: flowState.handleModify,
    handleNext,

    // Computed values for button states
    // When on summary screen, canGoNext means there are empty slots to fill
    // When on a step, canGoNext means there's a token to select or the step is optional
    canGoNext: flowState.showSummary
      ? hasEmptySlotsValue
      : Boolean(flowState.currentToken || !flowState.isRequired),
    canGenerate: flowState.selectedTokens.length >= minTokens,
    hasEmptySlots: hasEmptySlotsValue,
  };
}

export type NFTSelectionPageState = ReturnType<typeof useNFTSelectionPage>;
