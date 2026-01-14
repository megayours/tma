import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { Token } from '@/types/response';
import { decodeNFTsFromParams } from '@/utils/nftUrlParams';

export interface UseNFTsFromUrlParamsOptions {
  urlParams: Record<string, unknown>;
  enabled?: boolean;
}

/**
 * Custom hook to fetch NFT tokens from URL parameters in parallel
 *
 * @param options - Configuration options
 * @param options.urlParams - URL search params object
 * @param options.enabled - Whether to fetch from URL params (default: true)
 *
 * @returns Object containing:
 *  - tokens: Array of successfully fetched Token objects
 *  - isLoading: True if any query is still loading
 *  - hasError: True if any query has failed
 *  - hasUrlParams: True if URL contains NFT parameters
 *
 * @example
 * const { tokens, isLoading, hasUrlParams } = useNFTsFromUrlParams({
 *   urlParams: search,
 *   enabled: !isManuallyModified,
 * });
 */
export function useNFTsFromUrlParams(options: UseNFTsFromUrlParamsOptions) {
  const { urlParams, enabled = true } = options;

  // Decode NFT identifiers from URL params
  const nftIdentifiers = useMemo(
    () => (enabled ? decodeNFTsFromParams(urlParams) : []),
    [urlParams, enabled]
  );

  // Use TanStack Query's useQueries for parallel fetching
  const queries = useQueries({
    queries: nftIdentifiers.map(({ chain, contractAddress, tokenId }) => ({
      queryKey: ['nftByCollectionAndTokenId', chain, contractAddress, tokenId],
      queryFn: async (): Promise<Token | null> => {
        const response = await fetch(
          `${import.meta.env.VITE_PUBLIC_API_URL}/tokens/${chain}/${contractAddress}/${tokenId}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        // Gracefully handle 404s - return null instead of throwing
        if (response.status === 404) return null;

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as Token;
      },
      enabled: enabled && !!chain && !!contractAddress && !!tokenId,
      retry: 1, // Only retry once to fail fast
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Aggregate results from all queries
  const tokens = useMemo(() => {
    return queries
      .map(query => query.data)
      .filter((token): token is Token => token !== null && token !== undefined);
  }, [queries]);

  const isLoading = queries.some(query => query.isLoading);
  const hasError = queries.some(query => query.isError);

  return {
    tokens,
    isLoading,
    hasError,
    hasUrlParams: nftIdentifiers.length > 0,
  };
}
