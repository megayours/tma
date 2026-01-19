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

  // Decode NFT identifiers from URL params (may be sparse array)
  const nftIdentifiers = useMemo(
    () => (enabled ? decodeNFTsFromParams(urlParams) : []),
    [urlParams, enabled]
  );

  // Create array of [index, identifier] pairs for defined identifiers only
  const definedIdentifiers = useMemo(
    () =>
      nftIdentifiers
        .map((identifier, index) => ({ identifier, originalIndex: index }))
        .filter((item) => item.identifier !== undefined),
    [nftIdentifiers]
  );

  // Use TanStack Query's useQueries for parallel fetching (only for defined identifiers)
  const queries = useQueries({
    queries: definedIdentifiers.map(({ identifier }) => ({
      queryKey: [
        'nftByCollectionAndTokenId',
        identifier!.chain,
        identifier!.contractAddress,
        identifier!.tokenId,
      ],
      queryFn: async (): Promise<Token | null> => {
        const { chain, contractAddress, tokenId } = identifier!;
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
      enabled:
        enabled &&
        !!identifier!.chain &&
        !!identifier!.contractAddress &&
        !!identifier!.tokenId,
      retry: 1, // Only retry once to fail fast
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Aggregate results from all queries, preserving sparse array structure
  const { tokens, tokenUsersByIndex, tokenUsernamesByIndex } = useMemo(() => {
    // Create sparse arrays with same length as nftIdentifiers
    const resolvedTokens: Array<Token | undefined> = Array(
      nftIdentifiers.length
    ).fill(undefined);
    const resolvedUsers: Array<string | undefined> = Array(
      nftIdentifiers.length
    ).fill(undefined);
    const resolvedUsernames: Array<string | undefined> = Array(
      nftIdentifiers.length
    ).fill(undefined);

    // Map query results back to their original indices
    definedIdentifiers.forEach(({ originalIndex }, queryIndex) => {
      const token = queries[queryIndex].data ?? null;
      if (token) {
        resolvedTokens[originalIndex] = token;
        resolvedUsers[originalIndex] = nftIdentifiers[originalIndex]?.userId;
        resolvedUsernames[originalIndex] =
          nftIdentifiers[originalIndex]?.username;
      }
    });

    return {
      tokens: resolvedTokens,
      tokenUsersByIndex: resolvedUsers,
      tokenUsernamesByIndex: resolvedUsernames,
    };
  }, [queries, definedIdentifiers, nftIdentifiers]);

  const isLoading = queries.some(query => query.isLoading);
  const hasError = queries.some(query => query.isError);

  return {
    tokens,
    isLoading,
    hasError,
    hasUrlParams: nftIdentifiers.length > 0,
    tokenUsersByIndex,
    tokenUsernamesByIndex,
  };
}
