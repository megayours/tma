import { useMemo } from 'react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useGetCommunityCollections } from './useCommunities';

export const useWebAppStartParam = () => {
  const { isTelegram } = useTelegramTheme();
  const { tgWebAppStartParam } = useLaunchParams();

  const communityId = useMemo(
    () => tgWebAppStartParam?.split('_')[1],
    [tgWebAppStartParam]
  );

  const { data } = useGetCommunityCollections(communityId || '');

  const result = useMemo(() => {
    if (!isTelegram) return undefined;

    return {
      collections: data?.collections,
    };
  }, [isTelegram, data?.collections]);

  return result;
};
