import { useState, useEffect, useCallback } from 'react';
import type { Token } from '@/types/response';
import type { SupportedCollection } from '@/hooks/useCollections';
import { SelectNFTsStep } from './SelectNFTsStep';
import { StepIndicator } from './StepIndicator';
import { StepNavigation } from './StepNavigation';
import { SelectedNFTDisplay } from '../SelectedNFTDisplay';
import { NFTSelector } from '../NFTSelector';
import { useNFTPreselection } from './useNFTPreselection';
import { NFTsSummary } from '../NFTsSummary';

export interface SelectNFTsProps {
  minTokens: number;
  maxTokens: number;
  collections?: SupportedCollection[];
  onTokensSelected: (tokens: Token[]) => void;
  onTokensChange?: (tokens: Token[]) => void;
  initialTokens?: Token[];
  heading?: string;
  showStepIndicator?: boolean;
  contentType?: 'image' | 'gif' | 'sticker' | 'animated_sticker';
}

/**
 * Unified component for single and multi-NFT selection
 * - Single token mode (minTokens=1, maxTokens=1): Direct selection without stepper
 * - Multi-token mode: Stepper UI with required/optional steps
 */
export function SelectNFTs({
  minTokens,
  maxTokens,
  collections,
  onTokensSelected,
  onTokensChange,
  initialTokens = [],
  heading,
  showStepIndicator,
}: SelectNFTsProps) {
  const isSingleToken = minTokens === 1 && maxTokens === 1;
  const useStepper = showStepIndicator ?? (minTokens > 1 || maxTokens > 1);

  // State
  const [selectedTokens, setSelectedTokens] = useState<Token[]>(initialTokens);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedTokens, setConfirmedTokens] = useState<Token[]>([]);

  // Sync with initialTokens when they change (e.g., from URL params)
  // Don't call onTokensChange - these came FROM the URL, no need to update it back
  useEffect(() => {
    if (initialTokens.length > 0) {
      setSelectedTokens(initialTokens);
      // If tokens are loaded from URL, move to the next unfilled step
      // This ensures we show the next step after the pre-filled ones
      const nextStep = Math.min(initialTokens.length, maxTokens - 1);
      setCurrentStep(nextStep);
    }
  }, [initialTokens]);

  // Preselection hook - disabled if initialTokens are provided
  const { preselectedTokens } = useNFTPreselection({
    count: minTokens,
    collections,
    enabled: selectedTokens.length === 0 && initialTokens.length === 0,
  });

  // Initialize with preselected tokens (only if no initialTokens)
  // Don't call onTokensChange for auto-preselection - only for manual changes
  useEffect(() => {
    if (
      selectedTokens.length === 0 &&
      preselectedTokens.length > 0 &&
      initialTokens.length === 0
    ) {
      setSelectedTokens(preselectedTokens);
      // Don't trigger onTokensChange for auto-preselection
    }
  }, [preselectedTokens, selectedTokens.length, initialTokens.length]);

  // Open selector if no tokens selected (single token mode only)
  useEffect(() => {
    if (isSingleToken) {
      setIsSelectorOpen(selectedTokens.length === 0);
    }
  }, [selectedTokens.length, isSingleToken]);

  // Handle token selection at specific index
  // Don't update URL here - wait for user to click Next/Continue
  const handleTokenSelect = useCallback(
    (index: number, token: Token | null) => {
      setSelectedTokens(prev => {
        const updated = [...prev];
        if (token) {
          updated[index] = token;
        } else {
          updated.splice(index, 1);
        }
        return updated;
      });
    },
    []
  );

  // Navigation handlers
  const handleNext = () => {
    // Only send confirmed tokens (up to and including current step)
    const tokensToConfirm = selectedTokens.slice(0, currentStep + 1);
    onTokensChange?.(tokensToConfirm);

    if (currentStep < maxTokens - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show summary, DON'T call onTokensSelected
      // Let parent route handle button click
      setIsConfirmed(true);
      setConfirmedTokens(tokensToConfirm);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // For optional tokens, user can skip
    handleNext();
  };

  // Validation
  const canGoNext = () => {
    const isRequiredStep = currentStep < minTokens;
    if (isRequiredStep) {
      return !!selectedTokens[currentStep];
    }
    return true; // Optional steps can always proceed
  };

  const canGoPrevious = currentStep > 0;
  const isOptionalStep = currentStep >= minTokens;

  // Single token mode (no stepper)
  if (isSingleToken) {
    return (
      <div>
        <h1 className="text-tg-text mb-2 text-center text-2xl font-bold">
          {heading || 'Select Your Character'}
        </h1>

        <SelectedNFTDisplay
          nfts={selectedTokens[0] || null}
          isSelectorOpen={isSelectorOpen}
          onToggleSelector={() => setIsSelectorOpen(!isSelectorOpen)}
        />

        {isSelectorOpen && (
          <NFTSelector
            collections={collections}
            onTokenSelect={token => {
              setSelectedTokens(token ? [token] : []);
              onTokensChange?.(token ? [token] : []);
              setIsSelectorOpen(false);
              onTokensSelected(token ? [token] : []);
            }}
            selectedNFT={selectedTokens[0] || null}
            onCancel={() => setIsSelectorOpen(false)}
          />
        )}
      </div>
    );
  }

  // Multi-token stepper mode
  return (
    <div>
      {isConfirmed ? (
        // Show summary after final confirmation
        <NFTsSummary tokens={confirmedTokens} heading={heading} />
      ) : (
        // Show stepper UI (existing code)
        <>
          <h1 className="text-tg-text mb-4 text-center text-2xl font-bold">
            {heading || 'Select Characters'}
          </h1>

          {useStepper && (
            <StepIndicator
              currentStep={currentStep}
              totalSteps={maxTokens}
              requiredSteps={minTokens}
            />
          )}

          <SelectNFTsStep
            stepNumber={currentStep}
            totalSteps={maxTokens}
            isRequired={currentStep < minTokens}
            collections={collections}
            selectedToken={selectedTokens[currentStep] || null}
            onTokenSelect={token => handleTokenSelect(currentStep, token)}
          />

          <StepNavigation
            currentStep={currentStep}
            totalSteps={maxTokens}
            canGoNext={canGoNext()}
            canGoPrevious={canGoPrevious}
            isOptionalStep={isOptionalStep}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSkip={isOptionalStep ? handleSkip : undefined}
          />
        </>
      )}
    </div>
  );
}
