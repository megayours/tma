import { useState, useEffect, useMemo } from 'react';
import type { Token } from '@/types/response';
import type { SupportedCollection } from '@/hooks/useCollections';
import { useGetFavorites } from '@/hooks/useFavorites';
import { useSession } from '@/auth/SessionProvider';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { useGetNFTByCollectionAndTokenId } from '@/hooks/useCollections';

export interface UseNFTPreselectionOptions {
  count: number; // How many tokens to preselect
  collections?: SupportedCollection[];
  enabled?: boolean; // Whether to run preselection
}

/**
 * Custom hook to preselect NFTs for single or multi-token selection flows
 *
 * Priority order:
 * 1. First N favorites (if available)
 * 2. Random token from default collection (fetched from backend, repeated N times)
 * 3. Random token from any available collection (fetched from backend, repeated N times)
 *
 * @param options - Configuration for preselection
 * @returns Preselected tokens array and loading state
 */
export function useNFTPreselection(options: UseNFTPreselectionOptions) {
  const { count, collections, enabled = true } = options;
  const { session } = useSession();
  const { favorites } = useGetFavorites(session);
  const { defaultCollection } = useSelectCommunity();

  // Determine fallback collection
  const fallbackCollection = useMemo(() => {
    if (!enabled) return null;
    if (favorites && favorites.length > 0) return null;

    // Priority 1: Use default collection
    if (defaultCollection) return defaultCollection;

    // Priority 2: Pick random collection from all available
    if (collections && collections.length > 0) {
      const randomIndex = Math.floor(Math.random() * collections.length);
      return collections[randomIndex];
    }

    return null;
  }, [favorites, defaultCollection, collections, enabled]);

  const randomTokenId = useMemo(() => {
    if (!fallbackCollection) return '0';
    return Math.floor(Math.random() * fallbackCollection.size).toString();
  }, [fallbackCollection]);

  // Fetch random token from backend (only when needed)
  const { data: fetchedToken } = useGetNFTByCollectionAndTokenId(
    fallbackCollection?.chain || '',
    fallbackCollection?.address || '',
    randomTokenId
  );

  // Compute preselected tokens
  const preselectedTokens = useMemo(() => {
    if (!enabled || count === 0) return [];

    // Priority 1: Use first N favorites
    if (favorites && favorites.length > 0) {
      return favorites.slice(0, count).map(fav => fav.token);
    }

    // Priority 2: Use fetched token (repeated N times for multi-token requirements)
    if (fetchedToken) {
      return Array(count).fill(fetchedToken);
    }

    return [];
  }, [favorites, fetchedToken, count, enabled]);

  return {
    preselectedTokens,
    isLoading: !preselectedTokens.length && enabled && !!fallbackCollection,
  };
}
