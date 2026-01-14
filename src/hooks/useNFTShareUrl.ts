import { useMemo } from 'react';
import type { Session } from '@/auth/useAuth';
import { buildShareUrl } from '@/utils/shareUrl';

interface UseNFTShareUrlParams {
  session: Session | null | undefined;
  notify: string[] | undefined;
  communityId?: string | null;
}

/**
 * Hook for building share URLs with notify IDs
 * Combines existing notify IDs from URL with current user's session ID
 */
export function useNFTShareUrl({
  session,
  notify,
  communityId,
}: UseNFTShareUrlParams): string {
  return useMemo(() => {
    const botUrl = import.meta.env.VITE_PUBLIC_BOT_URL || '';
    let currentPath = window.location.pathname + window.location.search;

    // Add all existing notify IDs + current user ID to the share URL
    if (session?.id) {
      const allNotifyIds = [...(notify || []), session.id];
      const notifyParams = allNotifyIds
        .map(id => `notify=${encodeURIComponent(id)}`)
        .join('&');
      const separator = currentPath.includes('?') ? '&' : '?';
      currentPath = `${currentPath}${separator}${notifyParams}`;
    }

    return buildShareUrl(botUrl, currentPath, communityId);
  }, [communityId, notify, session?.id]);
}
