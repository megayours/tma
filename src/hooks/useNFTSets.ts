import { useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';
import { useGetFavorites } from './useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { useToast } from '@/components/ui/toast/ToastProvider';

/**
 * Function to create a new NFT set with favorite tokens
 */
const createNFTSet = (favorites: any[], minTokens: number): Token[] => {
  if (!favorites || !minTokens) return [];

  const favoriteTokens = favorites.map(fav => fav.token);
  const set: Token[] = [];

  // Create set with minTokens elements, cycling through favorites if needed
  for (let i = 0; i < minTokens; i++) {
    const tokenIndex = i % favoriteTokens.length;
    set.push(favoriteTokens[tokenIndex]);
  }

  return set;
};

/**
 * Custom hook for managing NFT sets
 * Provides state and functions for managing multiple NFT sets
 */
export const useNFTSets = (prompt: Prompt | null) => {
  const { session } = useSession();
  const { favorites } = useGetFavorites(session);
  const { addToast } = useToast();

  // Initialize nftSets state
  const [nftSets, setNftSets] = useState<Token[][]>([]);

  // Load NFT sets from localStorage when prompt changes
  useEffect(() => {
    console.log('REchecking nft sets');
    if (!prompt?.id) {
      setNftSets([]);
      return;
    }

    const storageKey = `nftSets_${prompt.id}`;
    const savedSets = localStorage.getItem(storageKey);

    if (savedSets) {
      try {
        const parsedSets = JSON.parse(savedSets);
        setNftSets(parsedSets);
        return;
      } catch (error) {
        console.error('Error parsing saved NFT sets:', error);
      }
    }

    // If no saved sets and we have favorites, create initial set
    if (favorites && prompt?.minTokens) {
      const initialSet = createNFTSet(favorites, prompt.minTokens);
      setNftSets([initialSet]);
    }
  }, [prompt?.id, prompt?.minTokens, favorites]);

  // Save NFT sets to localStorage whenever they actually change
  useEffect(() => {
    if (prompt?.id && nftSets.length > 0) {
      const storageKey = `nftSets_${prompt.id}`;
      const currentSaved = localStorage.getItem(storageKey);

      // Only save if the data is actually different
      if (currentSaved !== JSON.stringify(nftSets)) {
        localStorage.setItem(storageKey, JSON.stringify(nftSets));
      }
    }
  }, [nftSets, prompt?.id]);

  // Function to add a new NFT set
  const addNFTSet = () => {
    if (nftSets.length < 5 && favorites && prompt?.minTokens) {
      const newSet = createNFTSet(favorites, prompt.minTokens);
      setNftSets(prevNftSets => [...prevNftSets, newSet]);
    } else if (nftSets.length >= 5) {
      addToast({
        type: 'error',
        message: 'You can only add up to 5 NFT sets',
      });
    }
  };

  // Function to remove an NFT set
  const removeNFTSet = (index: number) => {
    if (nftSets.length > 1) {
      setNftSets(prevNftSets => prevNftSets.filter((_, i) => i !== index));
    }
  };

  // Function to update a specific NFT set
  const updateNFTSet = (index: number, newSet: Token[]) => {
    setNftSets(prevNftSets => {
      const updatedSets = prevNftSets.map((set, i) =>
        i === index ? newSet : set
      );
      return updatedSets;
    });
  };

  // Function to update a specific NFT within a set
  const updateNFTInSet = (
    setIndex: number,
    nftIndex: number,
    newToken: Token
  ) => {
    console.log('Updating NFT in set', setIndex, nftIndex, newToken);
    setNftSets(prevNftSets => {
      const updatedSets = prevNftSets.map((set, i) => {
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

  return {
    nftSets,
    setNftSets,
    addNFTSet,
    removeNFTSet,
    updateNFTSet,
    updateNFTInSet,
    canAddSet: nftSets.length < 5,
    canRemoveSet: nftSets.length > 1,
  };
};
