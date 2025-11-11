import { useMemo, useState, useEffect } from 'react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { useGetCommunityCollections } from './useCommunities';
import { base64UrlDecode } from '@/utils/base64';

export const useWebAppStartParam = () => {
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

  const communityId = useMemo(() => {
    if (!tgWebAppStartParam) return undefined;

    try {
      // Decode from base64
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
  }, [tgWebAppStartParam]);

  // Only fetch community collections if we have a valid communityId
  const { data } = useGetCommunityCollections(communityId || '');

  const result = useMemo(() => {
    if (!isTelegram) return undefined;
    if (!data?.collections) return undefined;

    return {
      collections: data.collections,
      communityId,
    };
  }, [isTelegram, data?.collections, communityId]);

  return result;
};
