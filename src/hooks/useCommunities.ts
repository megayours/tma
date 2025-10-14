import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/auth/SessionProvider';
import type { SupportedCollection } from './useCollections';

type Community = {
  id: string;
  name: string;
  owner: string;
  type: 'discord';
  plan_id: number;
  last_token_topup_at: number | null;
  collections: SupportedCollection[];
};

export function useGetCommunityCollections(communityId: string) {
  const { session } = useSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ['communityCollections', communityId],
    queryFn: async () => {
      if (!session) return;
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/communities/${communityId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: session.authToken,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Normalize collections to have 'address' property and remove 'contract_address'
      if (data.collections) {
        data.collections = data.collections.map((c: any) => {
          const { contract_address, ...rest } = c;
          return {
            ...rest,
            address: contract_address,
          };
        });
      }
      return data as Community;
    },
    enabled: !!communityId && !!session,
  });

  return { data, isLoading, error };
}
