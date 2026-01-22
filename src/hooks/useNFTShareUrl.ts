import { useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';
import type { Token } from '@/types/response';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { buildShareUrl } from '@/utils/shareUrl';

interface UseNFTShareUrlParams {
  communityId?: string | null;
  tokens?: Array<Token | undefined>;
  tokenUsersByIndex?: Array<string | undefined>;
  tokenUsernamesByIndex?: Array<string | undefined>;
  endpoint?: string;
}

/**
 * Simplified hook for building share URLs with NFT selections
 * Supports sparse arrays to preserve NFT slot positions
 */
export function useNFTShareUrl({
  communityId,
  tokens = [],
  tokenUsersByIndex = [],
  tokenUsernamesByIndex = [],
  endpoint,
}: UseNFTShareUrlParams): string {
  const location = useLocation();

  return useMemo(() => {
    const botUrl = import.meta.env.VITE_PUBLIC_BOT_URL || '';

    // Build params from current tokens or fall back to current URL
    // Check if there's at least one defined token in the sparse array
    const nftParams = tokens.some(t => t !== undefined)
      ? encodeNFTsToParams(tokens, tokenUsersByIndex, tokenUsernamesByIndex)
      : null;

    const baseSearchParams = new URLSearchParams();

    if (nftParams) {
      Object.entries(nftParams).forEach(([key, value]) => {
        baseSearchParams.set(key, value);
      });
    } else if (location.search) {
      // Fallback to current URL params
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
    const pathToUse = endpoint ?? location.pathname;
    const currentPath = searchString
      ? `${pathToUse}?${searchString}`
      : pathToUse;

    return buildShareUrl(botUrl, currentPath, communityId);
  }, [communityId, endpoint, location.pathname, location.search, tokens, tokenUsersByIndex, tokenUsernamesByIndex]);
}
