import { useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';
import { useGetFavorites } from './useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { useToast } from '@/components/ui/toast/ToastProvider';

/**
 * Function to create compulsory NFT tokens (exactly minTokens)
 */
const createCompulsoryNFTs = (favorites: any[], minTokens: number): Token[] => {
  if (!favorites || !minTokens) return [];

  const favoriteTokens = favorites.map(fav => fav.token);
  const compulsoryTokens: Token[] = [];

  // Create compulsory tokens with minTokens elements, cycling through favorites if needed
  for (let i = 0; i < minTokens; i++) {
    const tokenIndex = i % favoriteTokens.length;
    compulsoryTokens.push(favoriteTokens[tokenIndex]);
  }

  return compulsoryTokens;
};

/**
 * Custom hook for managing NFT sets with compulsory and optional tokens
 * Provides state and functions for managing multiple NFT sets split into compulsory and optional arrays
 */
export const useNFTSets = (prompt: Prompt | null) => {
  const { session } = useSession();
  const { favorites } = useGetFavorites(session);
  const { addToast } = useToast();

  // Initialize separate states for compulsory and optional NFTs
  const [compulsoryNFTs, setCompulsoryNFTs] = useState<Token[][]>([]);
  const [optionalNFTs, setOptionalNFTs] = useState<Token[][]>([]);

  // Load NFT sets from localStorage when prompt changes
  useEffect(() => {
    console.log('Rechecking NFT sets');
    if (!prompt?.id) {
      setCompulsoryNFTs([]);
      setOptionalNFTs([]);
      return;
    }

    const compulsoryStorageKey = `compulsoryNFTs_${prompt.id}`;
    const optionalStorageKey = `optionalNFTs_${prompt.id}`;
    const savedCompulsoryNFTs = localStorage.getItem(compulsoryStorageKey);
    const savedOptionalNFTs = localStorage.getItem(optionalStorageKey);

    if (savedCompulsoryNFTs && savedOptionalNFTs) {
      try {
        const parsedCompulsoryNFTs = JSON.parse(savedCompulsoryNFTs);
        const parsedOptionalNFTs = JSON.parse(savedOptionalNFTs);

        // Validate and adjust compulsory NFTs to respect minTokens constraint
        const validatedCompulsoryNFTs = parsedCompulsoryNFTs.map((set: Token[]) => {
          if (!favorites || !prompt?.minTokens) return set;

          const minTokens = prompt.minTokens;

          // Ensure compulsory set has exactly minTokens
          if (set.length !== minTokens) {
            return createCompulsoryNFTs(favorites, minTokens);
          }

          return set;
        });

        // Validate and adjust optional NFTs to respect maxTokens constraint
        const maxOptionalTokens = (prompt.maxTokens || prompt.minTokens || 0) - (prompt.minTokens || 0);
        const validatedOptionalNFTs = parsedOptionalNFTs.map((set: Token[]) => {
          // Trim optional sets if they exceed the allowed limit
          if (set.length > maxOptionalTokens) {
            return set.slice(0, maxOptionalTokens);
          }
          return set;
        });

        setCompulsoryNFTs(validatedCompulsoryNFTs);
        setOptionalNFTs(validatedOptionalNFTs);
        return;
      } catch (error) {
        console.error('Error parsing saved NFT sets:', error);
      }
    }

    // If no saved sets and we have favorites, create initial compulsory set
    if (favorites && prompt?.minTokens) {
      const initialCompulsorySet = createCompulsoryNFTs(favorites, prompt.minTokens);
      setCompulsoryNFTs([initialCompulsorySet]);
      setOptionalNFTs([[]]);  // Start with empty optional set
    }
  }, [prompt?.id, prompt?.minTokens, prompt?.maxTokens, favorites]);

  // Save NFT sets to localStorage whenever they actually change
  useEffect(() => {
    if (prompt?.id && compulsoryNFTs.length > 0) {
      const compulsoryStorageKey = `compulsoryNFTs_${prompt.id}`;
      const optionalStorageKey = `optionalNFTs_${prompt.id}`;

      const currentSavedCompulsory = localStorage.getItem(compulsoryStorageKey);
      const currentSavedOptional = localStorage.getItem(optionalStorageKey);

      // Only save if the data is actually different
      const newCompulsoryData = JSON.stringify(compulsoryNFTs);
      const newOptionalData = JSON.stringify(optionalNFTs);

      if (currentSavedCompulsory !== newCompulsoryData) {
        localStorage.setItem(compulsoryStorageKey, newCompulsoryData);
      }

      if (currentSavedOptional !== newOptionalData) {
        localStorage.setItem(optionalStorageKey, newOptionalData);
      }
    }
  }, [compulsoryNFTs, optionalNFTs, prompt?.id]);

  // Function to add a new NFT set (both compulsory and optional)
  const addNFTSet = () => {
    if (compulsoryNFTs.length < 5 && favorites && prompt?.minTokens) {
      const newCompulsorySet = createCompulsoryNFTs(favorites, prompt.minTokens);
      const newOptionalSet: Token[] = [];
      setCompulsoryNFTs(prevSets => [...prevSets, newCompulsorySet]);
      setOptionalNFTs(prevSets => [...prevSets, newOptionalSet]);
    } else if (compulsoryNFTs.length >= 5) {
      addToast({
        type: 'error',
        message: 'You can only add up to 5 NFT sets',
      });
    }
  };

  // Function to remove an NFT set
  const removeNFTSet = (index: number) => {
    if (compulsoryNFTs.length > 1) {
      setCompulsoryNFTs(prevSets => prevSets.filter((_, i) => i !== index));
      setOptionalNFTs(prevSets => prevSets.filter((_, i) => i !== index));
    }
  };

  // Function to update a compulsory NFT within a set
  const updateCompulsoryNFTInSet = (
    setIndex: number,
    nftIndex: number,
    newToken: Token
  ) => {
    console.log('Updating compulsory NFT in set', setIndex, nftIndex, newToken);
    setCompulsoryNFTs(prevSets => {
      const updatedSets = prevSets.map((set, i) => {
        if (i === setIndex) {
          const updatedSet = [...set];
          updatedSet[nftIndex] = newToken;
          return updatedSet;
        }
        return set;
      });
      return updatedSets;
    });
  };

  // Function to update an optional NFT within a set
  const updateOptionalNFTInSet = (
    setIndex: number,
    nftIndex: number,
    newToken: Token
  ) => {
    console.log('Updating optional NFT in set', setIndex, nftIndex, newToken);
    setOptionalNFTs(prevSets => {
      const updatedSets = prevSets.map((set, i) => {
        if (i === setIndex) {
          const updatedSet = [...set];
          updatedSet[nftIndex] = newToken;
          return updatedSet;
        }
        return set;
      });
      return updatedSets;
    });
  };

  // Function to add an optional NFT to a set
  const addOptionalNFT = (setIndex: number, newToken: Token) => {
    const maxOptionalTokens = (prompt?.maxTokens || prompt?.minTokens || 0) - (prompt?.minTokens || 0);

    setOptionalNFTs(prevSets => {
      const updatedSets = prevSets.map((set, i) => {
        if (i === setIndex && set.length < maxOptionalTokens) {
          return [...set, newToken];
        }
        return set;
      });
      return updatedSets;
    });
  };

  // Function to remove an optional NFT from a set
  const removeOptionalNFT = (setIndex: number, nftIndex: number) => {
    setOptionalNFTs(prevSets => {
      const updatedSets = prevSets.map((set, i) => {
        if (i === setIndex) {
          return set.filter((_, tokenIndex) => tokenIndex !== nftIndex);
        }
        return set;
      });
      return updatedSets;
    });
  };

  return {
    compulsoryNFTs,
    optionalNFTs,
    setCompulsoryNFTs,
    setOptionalNFTs,
    addNFTSet,
    removeNFTSet,
    updateCompulsoryNFTInSet,
    updateOptionalNFTInSet,
    addOptionalNFT,
    removeOptionalNFT,
    canAddSet: compulsoryNFTs.length < 5,
    canRemoveSet: compulsoryNFTs.length > 1,
    maxOptionalTokens: (prompt?.maxTokens || prompt?.minTokens || 0) - (prompt?.minTokens || 0),
  };
};
