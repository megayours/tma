import { useQuery } from '@tanstack/react-query';
import type { Session } from '@/auth/useAuth';
import type { Contract } from '../types/contract';
import type { Token } from '../types/response';

export type Favorite = {
  token: Token;
  createdAt: string;
  updatedAt: string;
};

export function useGetFavorites(session: Session) {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites', session.id],
    queryFn: async (): Promise<Favorite[]> => {
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
    enabled: !!session.id && !!session.authToken,
  });

  return { favorites: data, isLoadingFavorites: isLoading };
}
