import { useQuery } from '@tanstack/react-query';
import type { Pagination } from '../types/requests';
import type { Token } from '../types/response';

export type SupportedCollection = {
  address: string;
  chain: string;
  name: string;
  image: string;
};

export function useGetSupportedCollections() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['supportedCollections'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/tokens/used-collections`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as SupportedCollection[];
    },
  });

  return { data, isLoading, error };
}

export function useGetTokensByCollection(
  collection?: SupportedCollection,
  page: number = 1,
  limit: number = 10
) {
  const { data, isLoading, error } = useQuery({
    queryKey: [
      'tokensByCollection',
      collection?.address,
      collection?.chain,
      page,
      limit,
    ],
    queryFn: async (): Promise<{
      tokens: Token[];
      pagination: Pagination;
    }> => {
      if (!collection) {
        throw new Error('No collection provided');
      }

      // Modern approach: Use URLSearchParams for cleaner query string building
      const searchParams = new URLSearchParams({
        chain: collection.chain,
        contract_address: collection.address,
        page: page.toString(),
        page_size: limit.toString(),
      });

      const url = `${import.meta.env.VITE_PUBLIC_API_URL}/tokens?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('response', data);
      return {
        tokens: data.data,
        pagination: data.pagination,
      } as {
        tokens: Token[];
        pagination: Pagination;
      };
    },
    enabled: !!collection?.address && !!collection?.chain, // Only run if we have required data
  });

  return { data, isLoading, error };
}
