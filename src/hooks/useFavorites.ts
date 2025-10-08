import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import type { Session } from '@/auth/useAuth';
import type { Token } from '../types/response';
import { getCachedFavorite, setCachedFavorite } from '@/utils/favoriteCache';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';

export type Favorite = {
  token: Token;
  createdAt: string;
  updatedAt: string;
};

export function useGetFavorites(session: Session | null) {
  const { selectedFavorite, setSelectedFavorite: setSelectedFavoriteGlobal } = useSelectedNFTs();
  const [isLoadingSelected, setIsLoadingSelected] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites', session?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (!session) return [];
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/profile/favorites/${session.id}`,
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

  // Initialize selected favorite from cache or default to first
  useEffect(() => {
    if (!session?.id || !data) {
      setIsLoadingSelected(false);
      return;
    }

    const cachedFavorite = getCachedFavorite(session.id);

    if (cachedFavorite && data.some(fav => fav.token.id === cachedFavorite.token.id)) {
      // Use cached favorite if it still exists in the list
      setSelectedFavoriteGlobal(cachedFavorite);
    } else if (data.length > 0) {
      // Default to first favorite if no cached or cached doesn't exist
      const firstFavorite = data[0];
      setSelectedFavoriteGlobal(firstFavorite);
      setCachedFavorite(session.id, firstFavorite);
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
    isLoadingSelected
  };
}

export function useRemoveFromFavorites(session?: Session) {
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
