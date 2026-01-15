import { useMemo } from 'react';
import { useLocation } from '@tanstack/react-router';
import type { Session } from '@/auth/useAuth';
import type { Token } from '@/types/response';
import { encodeNFTsToParams } from '@/utils/nftUrlParams';
import { buildShareUrl } from '@/utils/shareUrl';

interface UseNFTShareUrlParams {
  session: Session | null | undefined;
  notify: string[] | undefined;
  communityId?: string | null;
  tokens?: Token[];
}

/**
 * Hook for building share URLs with notify IDs
 * Combines existing notify IDs from URL with current user's session ID
 */
export function useNFTShareUrl({
  session,
  notify,
  communityId,
  tokens,
}: UseNFTShareUrlParams): string {
  const location = useLocation();

  return useMemo(() => {
    const botUrl = import.meta.env.VITE_PUBLIC_BOT_URL || '';
    const nftParams = tokens?.length ? encodeNFTsToParams(tokens) : null;
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

    // Add all existing notify IDs + current user ID to the share URL
    if (session?.id) {
      const allNotifyIds = [...(notify || []), session.id];
      allNotifyIds.forEach(id => {
        baseSearchParams.append('notify', id);
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
    notify,
    session?.id,
    tokens,
  ]);
}
