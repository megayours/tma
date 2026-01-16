import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Token } from '@/types/response';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { useNFTsFromUrlParams } from '@/hooks/useNFTsFromUrlParams';
import { useSession } from '@/auth/SessionProvider';

interface UseNFTSelectionProps {
  minTokens: number;
  maxTokens: number;
  urlParams: Record<string, any>;
}

/**
 * Simplified NFT selection hook using index-based selection
 * - selectedTokens is an array of length maxTokens
 * - Indices 0 to minTokens-1 are required slots
 * - Indices minTokens to maxTokens-1 are optional slots
 * - currentIndex tracks which slot is being edited
 */
export function useNFTSelection({
  minTokens,
  maxTokens,
  urlParams,
}: UseNFTSelectionProps) {
  const navigate = useNavigate();
  const { session } = useSession();

  // Initialize arrays with length maxTokens
  const [selectedTokens, setSelectedTokens] = useState<Array<Token | undefined>>(
    () => Array(maxTokens).fill(undefined)
  );
  const [tokenUsersByIndex, setTokenUsersByIndex] = useState<Array<string | undefined>>(
    () => Array(maxTokens).fill(undefined)
  );
  const [tokenUsernamesByIndex, setTokenUsernamesByIndex] = useState<Array<string | undefined>>(
    () => Array(maxTokens).fill(undefined)
  );

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Parse tokens from URL
  const {
    tokens: urlTokens,
    isLoading: isLoadingUrlTokens,
    tokenUsersByIndex: urlTokenUsersByIndex,
    tokenUsernamesByIndex: urlTokenUsernamesByIndex,
  } = useNFTsFromUrlParams({
    urlParams,
    enabled: true,
  });

  const currentUserId = session?.id;
  const currentUsername = session?.username;

  // Initialize from URL on mount
  useEffect(() => {
    if (hasInitialized) return;

    if (urlTokens.length > 0) {
      // Pad arrays to maxTokens length
      const paddedTokens: Array<Token | undefined> = [...urlTokens];
      const paddedUsers: Array<string | undefined> = [...urlTokenUsersByIndex];
      const paddedUsernames: Array<string | undefined> = [...urlTokenUsernamesByIndex];

      while (paddedTokens.length < maxTokens) paddedTokens.push(undefined);
      while (paddedUsers.length < maxTokens) paddedUsers.push(undefined);
      while (paddedUsernames.length < maxTokens) paddedUsernames.push(undefined);

      setSelectedTokens(paddedTokens.slice(0, maxTokens));
      setTokenUsersByIndex(paddedUsers.slice(0, maxTokens));
      setTokenUsernamesByIndex(paddedUsernames.slice(0, maxTokens));
    }
    setHasInitialized(true);
  }, [urlTokens, urlTokenUsersByIndex, urlTokenUsernamesByIndex, hasInitialized, maxTokens]);


  // Handle URL hash changes for index navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const stepNum = parseInt(hash.replace('#', ''));
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= maxTokens) {
          const index = stepNum - 1;
          setCurrentIndex(index);
          setIsSelectorOpen(!selectedTokens[index]);
        }
      } else {
        setCurrentIndex(null);
        setIsSelectorOpen(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [maxTokens, selectedTokens]);

  // Helper: Update URL with tokens (filter out undefined)
  const updateUrlWithTokens = (
    tokens: Array<Token | undefined>,
    userIds: Array<string | undefined>,
    usernames: Array<string | undefined>
  ) => {
    const definedTokens = tokens.filter((t): t is Token => t !== undefined);
    if (definedTokens.length > 0) {
      const nftParams = encodeNFTsToParams(definedTokens, userIds, usernames);
      navigate({ to: '.', search: nftParams, replace: true });
    }
  };

  // Helper: Navigate to index or summary
  const navigateToIndexOrSummary = (index: number) => {
    window.location.hash = index < maxTokens ? `#${index + 1}` : '';
  };

  // Helper: Find first empty slot index
  const getFirstEmptySlotIndex = () => {
    for (let i = 0; i < maxTokens; i++) {
      if (!selectedTokens[i]) return i;
    }
    return -1;
  };

  // Token selection handler - takes index and token
  const handleTokenSelect = (index: number, token: Token | null) => {
    console.log('handleTokenSelect called:', { index, token: token?.id });
    if (!token || index < 0 || index >= maxTokens) {
      console.log('handleTokenSelect - invalid params, returning');
      return;
    }

    const updatedTokens = [...selectedTokens];
    updatedTokens[index] = token;

    const updatedUsers = [...tokenUsersByIndex];
    updatedUsers[index] = currentUserId;

    const updatedUsernames = [...tokenUsernamesByIndex];
    updatedUsernames[index] = currentUsername;

    console.log('handleTokenSelect - updating state:', {
      index,
      updatedTokens: updatedTokens.map(t => t?.id),
      currentUserId,
      currentUsername
    });

    setSelectedTokens(updatedTokens);
    setTokenUsersByIndex(updatedUsers);
    setTokenUsernamesByIndex(updatedUsernames);
    updateUrlWithTokens(updatedTokens, updatedUsers, updatedUsernames);

    // Navigate to next slot or summary
    navigateToIndexOrSummary(index + 1);
  };

  // Skip handler
  const handleSkip = (index: number) => {
    if (index < 0 || index >= maxTokens) return;
    navigateToIndexOrSummary(index + 1);
  };

  // Modify handler - navigate to specific index
  const handleModify = (index: number) => {
    if (index >= 0 && index < maxTokens) {
      window.location.hash = `#${index + 1}`;
    }
  };

  // Next button handler
  const handleNext = () => {
    if (showSummary) {
      // Navigate to first empty slot
      const firstEmptyIndex = getFirstEmptySlotIndex();
      if (firstEmptyIndex !== -1) {
        window.location.hash = `#${firstEmptyIndex + 1}`;
      }
    } else if (currentIndex !== null) {
      // Select current token if available
      const currentToken = selectedTokens[currentIndex];
      if (currentToken) {
        navigateToIndexOrSummary(currentIndex + 1);
      }
    }
  };

  // Computed values
  const showSummary = currentIndex === null;
  const currentToken = currentIndex !== null ? selectedTokens[currentIndex] : undefined;
  const isRequired = currentIndex !== null && currentIndex < minTokens;

  const hasEmptySlots = selectedTokens.some((token, i) => i < maxTokens && !token);

  const canGoNext = showSummary
    ? hasEmptySlots
    : Boolean(currentToken || !isRequired);

  const filledTokens = selectedTokens.filter((t): t is Token => t !== undefined);
  const canGenerate = filledTokens.length >= minTokens;

  const notifyUserIds = Array.from(
    new Set(tokenUsersByIndex.filter((userId): userId is string => Boolean(userId)))
  );

  console.log('useNFTSelection render:', {
    selectedTokens: selectedTokens.map(t => t?.id || 'empty'),
    currentIndex,
    showSummary,
    hasEmptySlots,
  });

  return {
    // Core state - exposed as arrays
    selectedTokens,
    tokenUsersByIndex,
    tokenUsernamesByIndex,
    currentIndex,
    currentToken,
    isSelectorOpen,
    showSummary,
    isRequired,
    isLoading: isLoadingUrlTokens,
    notifyUserIds,

    // Actions - now take index as parameter
    setIsSelectorOpen,
    handleTokenSelect,
    handleSkip,
    handleModify,
    handleNext,

    // Computed values
    canGoNext,
    canGenerate,
    hasEmptySlots,

    // Array utilities
    minTokens,
    maxTokens,
  };
}

export type NFTSelectionState = ReturnType<typeof useNFTSelection>;
