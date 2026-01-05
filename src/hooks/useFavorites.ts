import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import type { Session } from '@/auth/useAuth';
import type { Token } from '../types/response';
import { setCachedFavorite } from '@/utils/favoriteCache';
import { useSelectedNFTsSafe } from '@/contexts/SelectedNFTsContext';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import type { SupportedCollection } from '@/hooks/useCollections';

export type Favorite = {
  token: Token;
  createdAt: string;
  updatedAt: string;
};

/**
 * Filters favorites to only include those from the provided collections.
 * Works as an additional filter on top of community-level filtering.
 *
 * @param favorites - Array of favorites to filter
 * @param collections - Array of collections to filter by (address + chain matching)
 * @returns Filtered favorites array, or all favorites if collections is empty/undefined
 */
export function filterFavoritesByCollections(
  favorites: Favorite[] | undefined,
  collections?: SupportedCollection[]
): Favorite[] {
  if (!favorites || favorites.length === 0) {
    return [];
  }

  // If no collections provided or empty, return all favorites
  if (!collections || collections.length === 0) {
    return favorites;
  }

  // Filter favorites to match provided collections by address and chain
  return favorites.filter(favorite =>
    collections.some(
      collection =>
        collection.address === favorite.token.contract.address &&
        collection.chain === favorite.token.contract.chain
    )
  );
}

export function useGetFavorites(session: Session | null) {
  const { selectedFavorite, setSelectedFavorite: setSelectedFavoriteGlobal } =
    useSelectedNFTsSafe();
  const { selectedCommunity } = useSelectCommunity();
  const [isLoadingSelected, setIsLoadingSelected] = useState(true);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['favorites', session?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (!session) return [];
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/profile/favorites/${session.id}?sort=recent`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.map((favorite: any) => ({
          token: favorite.token,
          createdAt: favorite.created_at,
          updatedAt: favorite.updated_at,
        })) as Favorite[];
      }

      return [];
    },
    enabled: !!session?.id && !!session?.authToken,
  });

  // Filter favorites by selected community's collections
  const data = useMemo(() => {
    if (!selectedCommunity?.collections || !rawData) {
      return rawData;
    }

    return rawData.filter(favorite =>
      selectedCommunity.collections.some(
        collection =>
          collection.address === favorite.token.contract.address &&
          collection.chain === favorite.token.contract.chain
      )
    );
  }, [rawData, selectedCommunity?.id]);

  // Always select and cache the most-used favorite (data[0])
  useEffect(() => {
    if (!session?.id || !data) {
      setIsLoadingSelected(false);
      return;
    }

    if (data.length > 0) {
      // Select the first favorite (most recently used, already filtered by community)
      const mostUsedFavorite = data[0];
      setSelectedFavoriteGlobal(mostUsedFavorite);
      setCachedFavorite(session.id, mostUsedFavorite);
    } else {
      setSelectedFavoriteGlobal(null);
    }

    setIsLoadingSelected(false);
  }, [data, session?.id, setSelectedFavoriteGlobal]);

  const setSelectedFavorite = (favorite: Favorite) => {
    if (!session?.id) return;

    setSelectedFavoriteGlobal(favorite);
    setCachedFavorite(session.id, favorite);
  };

  return {
    favorites: data,
    isLoadingFavorites: isLoading,
    selectedFavorite,
    setSelectedFavorite,
    isLoadingSelected,
  };
}

export function useRemoveFromFavorites(session?: Session | null) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (token: Token) => {
      if (!session) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/profile/favorites`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
          body: JSON.stringify({
            contract: {
              chain: token.contract.chain,
              address: token.contract.address,
            },
            id: token.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return token; // Return the token for tracking which one is being removed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['favorites', session?.id],
      });
    },
  });

  return {
    removeFromFavorites: mutation.mutate,
    isRemoving: mutation.isPending,
    removingTokenId: mutation.variables?.id,
    mutation,
  };
}
