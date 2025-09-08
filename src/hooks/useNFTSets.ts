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
  console.log('nftSets', nftSets);

  // Initialize nftSets when prompt or favorites change
  useEffect(() => {
    if (!prompt?.id || !favorites || !prompt?.minTokens) {
      setNftSets([]);
      return;
    }

    // Only initialize if nftSets is empty
    if (nftSets.length === 0) {
      const initialSet = createNFTSet(favorites, prompt.minTokens);
      setNftSets([initialSet]);
    }
  }, [prompt?.id, prompt?.minTokens, favorites, nftSets.length]);

  // Function to add a new NFT set
  const addNFTSet = () => {
    console.log('addNFTSet', nftSets);
    if (nftSets.length < 5 && favorites && prompt?.minTokens) {
      const newSet = createNFTSet(favorites, prompt.minTokens);
      setNftSets(prevNftSets => [...prevNftSets, newSet]);
      console.log('addNFTSet', nftSets);
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
      console.log('updatedSets', updatedSets);
      return updatedSets;
    });
  };

  // Function to update a specific NFT within a set
  const updateNFTInSet = (
    setIndex: number,
    nftIndex: number,
    newToken: Token
  ) => {
    console.log('updateNFTInSet', nftSets);
    const allSets = nftSets;
    console.log(1);
    const setToChange = allSets[setIndex];
    console.log(2);
    setToChange[nftIndex] = newToken;
    console.log(3);
    allSets[setIndex] = setToChange;
    console.log(4);
    setNftSets(allSets);
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
