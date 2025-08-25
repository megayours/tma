import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@/auth/useAuth';
import type { Token } from '../types/response';

export type Favorite = {
  token: Token;
  createdAt: string;
  updatedAt: string;
};

export function useGetFavorites(session?: Session) {
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

  return { favorites: data, isLoadingFavorites: isLoading };
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
