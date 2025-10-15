import { useMemo, useState, useEffect } from 'react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { useGetCommunityCollections } from './useCommunities';

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

  const communityId = useMemo(
    () => tgWebAppStartParam?.split('_')[0],
    [tgWebAppStartParam]
  );

  // Only fetch community collections if we have a valid communityId
  const { data } = useGetCommunityCollections(communityId || '');

  const result = useMemo(() => {
    if (!isTelegram) return undefined;
    if (!data?.collections) return undefined;

    return {
      collections: data.collections,
    };
  }, [isTelegram, data?.collections]);

  return result;
};
