import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/auth/SessionProvider';
import type { SupportedCollection } from './useCollections';
import { useMemo, useState, useEffect } from 'react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { base64UrlDecode } from '@/utils/base64';

type Community = {
  id: string;
  name: string;
  owner: string;
  type: 'discord';
  image: string | null;
  plan_id: number;
  last_token_topup_at: number | null;
  collections: SupportedCollection[];
};

/**
 * Hook to get communityId from either Telegram start param or URL query params
 * - If in Telegram: decodes base64url start param and extracts communityId
 * - If not in Telegram (web): parses ?communityId from URL
 */
export function useCommunityId(): string | undefined {
  const { isTelegram } = useTelegramTheme();
  const [tgWebAppStartParam, setTgWebAppStartParam] = useState<
    string | undefined
  >();

  useEffect(() => {
    // Only try to retrieve launch params if we're in Telegram
    if (isTelegram) {
      try {
        const params = retrieveLaunchParams();
        setTgWebAppStartParam(params.tgWebAppStartParam);
      } catch (error) {
        console.warn('Failed to retrieve launch params:', error);
        setTgWebAppStartParam(undefined);
      }
    }
  }, [isTelegram]);

  return useMemo(() => {
    if (isTelegram) {
      // In Telegram: decode base64url start param and extract communityId
      if (!tgWebAppStartParam) return undefined;

      try {
        // Decode from base64url
        const decodedString = base64UrlDecode(tgWebAppStartParam);

        // Extract query string if it exists
        // decodedString can be like: /post/23?communityId=-123&gg=23
        if (!decodedString.includes('?')) return undefined;

        const queryString = decodedString.split('?')[1];

        // Parse query params
        const params = new URLSearchParams(queryString);
        const communityIdValue = params.get('communityId');

        return communityIdValue || undefined;
      } catch (error) {
        console.error('Failed to parse communityId from start param:', error);
        return undefined;
      }
    } else {
      // In web browser: parse URL query params directly
      if (typeof window === 'undefined') return undefined;

      const urlParams = new URLSearchParams(window.location.search);
      const communityIdFromUrl = urlParams.get('communityId');

      return communityIdFromUrl || undefined;
    }
  }, [isTelegram, tgWebAppStartParam]);
}

export function useGetCommunityCollections(communityId?: string) {
  const { session } = useSession();

  const isEnabled = !!communityId && communityId !== '' && !!session;

  const { data, isLoading, error } = useQuery({
    queryKey: ['communityCollections', communityId],
    queryFn: async () => {
      if (!session || !communityId) return;

      try {
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
          // Provide more specific error messages based on status code
          if (response.status === 404) {
            throw new Error(`Community '${communityId}' not found`);
          } else if (response.status === 401 || response.status === 403) {
            throw new Error('Unauthorized access to community');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later');
          } else {
            throw new Error(`Failed to fetch community: ${response.status}`);
          }
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse community response:', parseError);
          throw new Error('Invalid response from server');
        }

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
      } catch (error) {
        // Re-throw if it's already our custom error
        if (error instanceof Error) {
          throw error;
        }
        // Handle network errors or other unknown errors
        console.error('Error fetching community collections:', error);
        throw new Error('Network error. Please check your connection');
      }
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent unnecessary refetches
    retry: (failureCount, error) => {
      // Don't retry on 404 or auth errors
      if (error instanceof Error) {
        if (
          error.message.includes('not found') ||
          error.message.includes('Unauthorized')
        ) {
          return false;
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return { data, isLoading, error };
}
