import { useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';
import { useGetFavorites } from './useFavorites';
import { useSession } from '@/auth/SessionProvider';
import type { SupportedCollection } from './useCollections';
import { usePromptMutation } from './usePrompts';

/**
 * Function to create compulsory NFT tokens (exactly minTokens)
 * If no favorites exist, falls back to random token from default collection or any available collection
 */
export const createCompulsoryNFTs = (
  favorites: any[] | null,
  minTokens: number,
  defaultCollection?: SupportedCollection,
  allCollections?: SupportedCollection[]
): Token[] => {
  if (!minTokens) return [];

  // If no favorites, use random tokenId from default collection or random collection
  if (!favorites || favorites.length === 0) {
    let selectedCollection = defaultCollection;

    // If no default collection, pick a random one from all available collections
    if (!selectedCollection && allCollections && allCollections.length > 0) {
      const randomCollectionIndex = Math.floor(Math.random() * allCollections.length);
      selectedCollection = allCollections[randomCollectionIndex];
    }

    if (!selectedCollection) return [];

    // Generate a random tokenId within the collection size range
    const randomTokenId = Math.floor(Math.random() * selectedCollection.size).toString();

    const fallbackToken: Token = {
      id: randomTokenId,
      name: undefined,
      image: undefined,
      description: undefined,
      attributes: undefined,
      owner: undefined,
      contract: {
        chain: selectedCollection.chain,
        address: selectedCollection.address,
        name: selectedCollection.name,
      },
    };

    return Array(minTokens).fill(fallbackToken);
  }

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
 * Custom hook for managing a single NFT set with compulsory and optional tokens
 * Simplified version that handles only one set instead of multiple
 */
export const useNFTSet = (
  prompt: Prompt | null,
  defaultCollection?: SupportedCollection,
  allCollections?: SupportedCollection[]
) => {
  const { session } = useSession();
  const { favorites } = useGetFavorites(session);
  const promptMutation = usePromptMutation(session);

  // Initialize state for single NFT set
  const [compulsoryNFTs, setCompulsoryNFTs] = useState<Token[]>([]);
  const [optionalNFTs, setOptionalNFTs] = useState<Token[]>([]);

  // Initialize NFT set when prompt changes
  useEffect(() => {
    if (!prompt?.id) {
      setCompulsoryNFTs([]);
      setOptionalNFTs([]);
      return;
    }

    // Create initial compulsory set (from favorites, default collection, or random collection)
    if (prompt?.minTokens && (favorites || defaultCollection || allCollections)) {
      const initialCompulsorySet = createCompulsoryNFTs(favorites || null, prompt.minTokens, defaultCollection, allCollections);
      setCompulsoryNFTs(initialCompulsorySet);
      setOptionalNFTs([]);  // Start with empty optional set
    }
  }, [prompt?.id, prompt?.minTokens, prompt?.maxTokens, favorites, defaultCollection, allCollections]);

  // Function to update a compulsory NFT
  const updateCompulsoryNFT = (nftIndex: number, newToken: Token) => {
    setCompulsoryNFTs(prev => {
      const updated = [...prev];
      updated[nftIndex] = newToken;
      return updated;
    });
  };

  // Function to update an optional NFT
  const updateOptionalNFT = (nftIndex: number, newToken: Token) => {
    setOptionalNFTs(prev => {
      const updated = [...prev];
      updated[nftIndex] = newToken;
      return updated;
    });
  };

  // Function to add an optional NFT
  const addOptionalNFT = (newToken: Token) => {
    const maxOptionalTokens = (prompt?.maxTokens || prompt?.minTokens || 0) - (prompt?.minTokens || 0);
    if (optionalNFTs.length < maxOptionalTokens) {
      setOptionalNFTs(prev => [...prev, newToken]);
    }
  };

  // Function to remove an optional NFT
  const removeOptionalNFT = (nftIndex: number) => {
    setOptionalNFTs(prev => prev.filter((_, index) => index !== nftIndex));
  };

  // Function to remove a compulsory NFT at a specific index
  // This also updates the prompt's minTokens and maxTokens by decrementing both by 1
  const removeCompulsoryNFT = async (nftIndex: number) => {
    if (!prompt) return;

    // Remove the NFT from the local state
    setCompulsoryNFTs(prev => prev.filter((_, index) => index !== nftIndex));

    // Update the prompt with decremented minTokens and maxTokens
    const newMinTokens = Math.max(0, (prompt.minTokens || 0) - 1);
    const newMaxTokens = Math.max(0, (prompt.maxTokens || 0) - 1);

    await promptMutation.mutateAsync({
      prompt: {
        ...prompt,
        minTokens: newMinTokens,
        maxTokens: newMaxTokens,
      },
    });
  };

  // Function to add a compulsory NFT
  // This also updates the prompt's minTokens and maxTokens by incrementing both by 1
  const addCompulsoryNFT = async () => {
    if (!prompt) return;

    // Create a new compulsory NFT token
    const newCompulsoryNFTs = createCompulsoryNFTs(
      favorites || null,
      1,
      defaultCollection,
      allCollections
    );

    if (newCompulsoryNFTs.length === 0) return;

    // Add the NFT to the local state
    setCompulsoryNFTs(prev => [...prev, newCompulsoryNFTs[0]]);

    // Update the prompt with incremented minTokens and maxTokens
    const newMinTokens = (prompt.minTokens || 0) + 1;
    const newMaxTokens = (prompt.maxTokens || 0) + 1;

    await promptMutation.mutateAsync({
      prompt: {
        ...prompt,
        minTokens: newMinTokens,
        maxTokens: newMaxTokens,
      },
    });
  };

  const maxOptionalTokens = (prompt?.maxTokens || prompt?.minTokens || 0) - (prompt?.minTokens || 0);

  return {
    compulsoryNFTs,
    optionalNFTs,
    updateCompulsoryNFT,
    updateOptionalNFT,
    addOptionalNFT,
    removeOptionalNFT,
    addCompulsoryNFT,
    removeCompulsoryNFT,
    maxOptionalTokens,
  };
};
