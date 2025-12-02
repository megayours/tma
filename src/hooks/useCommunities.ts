import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/auth/SessionProvider';
import type { SupportedCollection } from './useCollections';
import { useGetNFTByCollectionAndTokenId } from './useCollections';
import { useMemo } from 'react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { base64UrlDecode } from '@/utils/base64';

export type Community = {
  id: string;
  name: string;
  owner: string;
  type: 'discord';
  image: string | null;
  plan_id: number;
  last_token_topup_at: number | null;
  collections: SupportedCollection[];
  default_collection_id: number | null;
};

/**
 * Hook to get communityId and authDate from either Telegram start param or URL query params
 * - If in Telegram: decodes base64url start param and extracts communityId + authDate from initData
 * - If not in Telegram (web): parses ?communityId from URL
 */
export function useCommunityId(): {
  communityId: string | undefined;
  authDate: number | null;
} {
  const { isTelegram } = useTelegramTheme();

  // Retrieve launch params synchronously (not in useEffect) to ensure they're available on first render
  const launchParams = useMemo(() => {
    if (!isTelegram) return null;

    try {
      return retrieveLaunchParams();
    } catch (error) {
      console.warn('Failed to retrieve launch params:', error);
      return null;
    }
  }, [isTelegram]);

  return useMemo(() => {
    if (isTelegram && launchParams) {
      // In Telegram: decode base64url start param and extract communityId
      let communityId: string | undefined = undefined;

      if (launchParams.tgWebAppStartParam) {
        try {
          // Decode from base64url
          const decodedString = base64UrlDecode(
            launchParams.tgWebAppStartParam
          );

          // Extract query string if it exists
          // decodedString can be like: /post/23?communityId=-123&gg=23
          if (decodedString.includes('?')) {
            const queryString = decodedString.split('?')[1];

            // Parse query params
            const params = new URLSearchParams(queryString);
            communityId = params.get('communityId') || undefined;
          }
        } catch (error) {
          console.error('Failed to parse communityId from start param:', error);
        }
      }

      // Extract auth_date from initData
      const authDate = new Date(launchParams.tgWebAppData?.auth_date!);
      return { communityId, authDate: authDate.getTime() };
    } else {
      // In web browser: parse URL query params directly
      if (typeof window === 'undefined') {
        return { communityId: undefined, authDate: null };
      }

      const urlParams = new URLSearchParams(window.location.search);
      const communityIdFromUrl = urlParams.get('communityId');

      return { communityId: communityIdFromUrl || undefined, authDate: null };
    }
  }, [isTelegram, launchParams]);
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
              integrations: c.integrations || [],
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

export function useGetCommunities() {
  const { session } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      if (!session) return [];

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/communities?type=telegram&status=live`,
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

      const result = await response.json();

      // The API returns { communities: [...] }, extract the array
      const communities = result.communities || [];

      // Normalize collections to have 'address' property and remove 'contract_address'
      return communities.map((community: any) => {
        if (community.collections) {
          community.collections = community.collections.map((c: any) => {
            const { contract_address, ...rest } = c;
            return {
              ...rest,
              address: contract_address,
              integrations: c.integrations || [],
            };
          });
        }

        return community as Community;
      });
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return { data: data || [], isLoading, error };
}

/**
 * Hook to get the default avatar NFT for a given community
 * Returns the NFT token (id: '0') from the community's default collection
 */
export function useGetDefaultAvatar(communityId: string | undefined) {
  const { data: community } = useGetCommunityCollections(communityId);

  const selectedCollection = community?.collections.find(
    c => c.id === community.default_collection_id?.toString()
  );

  const shouldFetch =
    !!selectedCollection?.chain && !!selectedCollection?.address;

  const {
    data: token,
    isLoading,
    error,
  } = useGetNFTByCollectionAndTokenId(
    selectedCollection?.chain || '',
    selectedCollection?.address || '',
    '0'
  );

  return {
    data: shouldFetch ? token : undefined,
    isLoading: shouldFetch ? isLoading : false,
    error: shouldFetch ? error : null,
  };
}
