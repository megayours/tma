import { isTMA } from '@telegram-apps/bridge';
import { useRawInitData, initData } from '@telegram-apps/sdk-react';

export function useTelegramRawInitData(): string | undefined {
  if (isTMA()) {
    return useRawInitData();
  } else {
    return undefined;
  }
}
