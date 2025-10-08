import { useTelegramTheme } from '@/auth/useTelegram';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { useGetCommunityCollections } from './useCommunities';

const getParamsFromTelegram = () => {
  const { tgWebAppStartParam } = useLaunchParams();
  console.log('start param', tgWebAppStartParam);
  const communityId = tgWebAppStartParam?.split('_')[1];
  const { data } = useGetCommunityCollections(communityId || '');
  const supportedCollections = data?.collections;
  console.log('Supported Collection', supportedCollections);
  return { collections: supportedCollections };
};

export const useWebAppStartParam = () => {
  const { isTelegram } = useTelegramTheme();

  console.log('isTelegram', isTelegram);

  if (isTelegram) {
    return getParamsFromTelegram();
  }
  return undefined;
};
