import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Token } from '@/types/response';
import type { SupportedCollection } from '@/hooks/useCollections';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { useNFTsFromUrlParams } from '@/hooks/useNFTsFromUrlParams';
import { useNFTPreselection } from '@/components/NFT/flows/multi-step';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';

interface UseNFTSelectionFlowProps {
  minTokens: number;
  maxTokens: number;
  collections?: SupportedCollection[];
  urlParams: Record<string, any>;
}

/**
 * Shared hook for NFT selection flow with URL hash-based step navigation
 * Handles:
 * - URL parameter parsing and token initialization
 * - Favorite token auto-selection for single token flows
 * - NFT preselection
 * - Step navigation via URL hash
 * - Token state management
 */
export function useNFTSelectionFlow({
  minTokens,
  maxTokens,
  collections,
  urlParams,
}: UseNFTSelectionFlowProps) {
  const navigate = useNavigate();
  const { session } = useSession();
  const { favorites, isLoadingFavorites } = useGetFavorites(session);
  const favoriteToken = favorites?.[0]?.token;

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Track programmatic navigation to prevent race conditions
  const isProgrammaticNavigationRef = useRef(false);

  // Parse tokens from URL
  const {
    tokens: urlTokens,
    isLoading: isLoadingUrlTokens,
    hasUrlParams,
  } = useNFTsFromUrlParams({
    urlParams,
    enabled: true,
  });

  // Preselect tokens if no URL params
  const { preselectedTokens, isLoading: isPreselecting } = useNFTPreselection({
    count: 1,
    collections,
    enabled: !hasUrlParams && urlTokens.length === 0,
  });

  // Helper to initialize with tokens and mark as programmatic navigation
  const initializeWithTokens = (tokens: Token[]) => {
    setSelectedTokens(tokens);
    if (tokens.length > 0) {
      isProgrammaticNavigationRef.current = true;
      const nftParams = encodeNFTsToParams(tokens);
      navigate({ to: '.', search: nftParams, replace: true });
    }
    setHasInitialized(true);
  };

  // Initialize tokens from URL, preselection, or favorites (only on mount)
  useEffect(() => {
    if (hasInitialized) return;

    if (urlTokens.length > 0) {
      setSelectedTokens(urlTokens);
      setHasInitialized(true);
    } else if (preselectedTokens.length > 0) {
      initializeWithTokens(preselectedTokens);
    } else if (favoriteToken && maxTokens === 1) {
      initializeWithTokens([favoriteToken]);
    }
  }, [urlTokens, preselectedTokens, favoriteToken, maxTokens, navigate, hasInitialized]);

  // Sync URL changes after initialization (when user manually changes URL)
  useEffect(() => {
    // Skip if this was a programmatic navigation
    if (isProgrammaticNavigationRef.current) {
      isProgrammaticNavigationRef.current = false;
      return;
    }

    // Only sync from URL if initialized and has URL params
    if (hasInitialized && hasUrlParams && urlTokens.length > 0) {
      setSelectedTokens(urlTokens);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasUrlParams, urlTokens.length, hasInitialized]);

  // Handle URL hash changes for step navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const stepNum = parseInt(hash.replace('#', ''));
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= maxTokens) {
          setCurrentStep(stepNum);
        }
      } else {
        setCurrentStep(null);
        setIsSelectorOpen(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [maxTokens]);

  // Auto-open selector when step changes
  useEffect(() => {
    if (currentStep !== null) {
      const stepIndex = currentStep - 1;
      setIsSelectorOpen(!selectedTokens[stepIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Helper to navigate to next step or summary
  const navigateToStepOrSummary = (nextStep: number) => {
    window.location.hash = nextStep <= maxTokens ? `#${nextStep}` : '';
  };

  const handleTokenSelect = (token: Token | null) => {
    if (!token || currentStep === null) return;

    const stepIndex = currentStep - 1;
    const updatedTokens = [...selectedTokens];
    updatedTokens[stepIndex] = token;
    setSelectedTokens(updatedTokens);

    isProgrammaticNavigationRef.current = true;
    const nftParams = encodeNFTsToParams(updatedTokens);
    navigate({ to: '.', search: nftParams, replace: true });

    navigateToStepOrSummary(currentStep + 1);
  };

  const handleSkip = () => {
    if (currentStep === null) return;
    navigateToStepOrSummary(currentStep + 1);
  };

  const handleModify = (index?: number) => {
    if (index !== undefined) {
      window.location.hash = `#${index + 1}`;
    }
  };

  const stepIndex = currentStep ? currentStep - 1 : -1;
  const currentToken = stepIndex >= 0 ? selectedTokens[stepIndex] : null;
  const isRequired = stepIndex >= 0 && stepIndex < minTokens;
  const showSummary = currentStep === null;

  return {
    // State
    selectedTokens,
    currentStep,
    currentToken,
    isSelectorOpen,
    showSummary,
    isRequired,

    // Actions
    setIsSelectorOpen,
    handleTokenSelect,
    handleSkip,
    handleModify,

    // Loading states
    isLoading: isLoadingUrlTokens || isPreselecting || isLoadingFavorites,
  };
}
