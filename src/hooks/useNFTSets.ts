import { useState, useEffect } from 'react';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';
import { useGetFavorites } from './useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { useToast } from '@/components/ui/toast/ToastProvider';
import type { SupportedCollection } from './useCollections';

/**
 * Function to create compulsory NFT tokens (exactly minTokens)
 * If no favorites exist, falls back to random token from default collection or any available collection
 */
const createCompulsoryNFTs = (
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
 * Custom hook for managing NFT sets with compulsory and optional tokens
 * Provides state and functions for managing multiple NFT sets split into compulsory and optional arrays
 */
export const useNFTSets = (
  prompt: Prompt | null,
  defaultCollection?: SupportedCollection,
  allCollections?: SupportedCollection[]
) => {
  const { session } = useSession();
  const { favorites } = useGetFavorites(session);
  const { addToast } = useToast();

  // Initialize separate states for compulsory and optional NFTs
  const [compulsoryNFTs, setCompulsoryNFTs] = useState<Token[][]>([]);
  const [optionalNFTs, setOptionalNFTs] = useState<Token[][]>([]);

  // Load NFT sets from localStorage when prompt changes
  useEffect(() => {
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
          if (!prompt?.minTokens) return set;

          const minTokens = prompt.minTokens;

          // Ensure compulsory set has exactly minTokens
          if (set.length !== minTokens) {
            return createCompulsoryNFTs(favorites || null, minTokens, defaultCollection, allCollections);
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

    // If no saved sets, create initial compulsory set (from favorites, default collection, or random collection)
    if (prompt?.minTokens && (favorites || defaultCollection || allCollections)) {
      const initialCompulsorySet = createCompulsoryNFTs(favorites || null, prompt.minTokens, defaultCollection, allCollections);
      setCompulsoryNFTs([initialCompulsorySet]);
      setOptionalNFTs([[]]);  // Start with empty optional set
    }
  }, [prompt?.id, prompt?.minTokens, prompt?.maxTokens, favorites, defaultCollection, allCollections]);

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
    if (compulsoryNFTs.length < 5 && prompt?.minTokens && (favorites || defaultCollection || allCollections)) {
      const newCompulsorySet = createCompulsoryNFTs(favorites || null, prompt.minTokens, defaultCollection, allCollections);
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
