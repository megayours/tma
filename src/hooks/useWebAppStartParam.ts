import { useMemo } from 'react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useGetCommunityCollections } from './useCommunities';

export const useWebAppStartParam = () => {
  const { isTelegram } = useTelegramTheme();
  const { tgWebAppStartParam } = useLaunchParams();

  console.log('tgWebAppStartParam', tgWebAppStartParam);
  const communityId = useMemo(
    () => tgWebAppStartParam?.split('_')[0],
    [tgWebAppStartParam]
  );

  console.log('communityId', communityId);
  const { data } = useGetCommunityCollections(communityId || '');

  const result = useMemo(() => {
    if (!isTelegram) return undefined;

    return {
      collections: data?.collections,
    };
  }, [isTelegram, data?.collections]);

  return result;
};
