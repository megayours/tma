import { useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';
import type { Token } from '@/types/response';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { buildShareUrl } from '@/utils/shareUrl';

interface UseNFTShareUrlParams {
  communityId?: string | null;
  tokens?: Token[];
  tokenUsersByIndex?: Array<string | undefined>;
  tokenUsernamesByIndex?: Array<string | undefined>;
}

/**
 * Hook for building share URLs with NFT + slot user IDs
 */
export function useNFTShareUrl({
  communityId,
  tokens,
  tokenUsersByIndex,
  tokenUsernamesByIndex,
}: UseNFTShareUrlParams): string {
  const location = useLocation();

  return useMemo(() => {
    const botUrl = import.meta.env.VITE_PUBLIC_BOT_URL || '';
    const nftParams =
      tokens?.length
        ? encodeNFTsToParams(tokens, tokenUsersByIndex, tokenUsernamesByIndex)
        : null;
    const baseSearchParams = new URLSearchParams();

    if (nftParams) {
      Object.entries(nftParams).forEach(([key, value]) => {
        baseSearchParams.set(key, value);
      });
    } else if (location.search) {
      Object.entries(location.search).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (item !== undefined && item !== null) {
              baseSearchParams.append(key, String(item));
            }
          });
        } else if (value !== undefined && value !== null) {
          baseSearchParams.set(key, String(value));
        }
      });
    }

    const searchString = baseSearchParams.toString();
    const currentPath = searchString
      ? `${location.pathname}?${searchString}`
      : location.pathname;

    return buildShareUrl(botUrl, currentPath, communityId);
  }, [
    communityId,
    location.pathname,
    location.search,
    tokenUsersByIndex,
    tokenUsernamesByIndex,
    tokens,
  ]);
}
