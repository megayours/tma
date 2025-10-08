import { useState, useEffect } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import {
  addToHomeScreen,
  checkHomeScreenStatus,
  onAddedToHomeScreen,
  onAddToHomeScreenFailed,
  offAddedToHomeScreen,
  offAddToHomeScreenFailed,
} from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { useToast } from '@/components/ui';

type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed';

export const AddToHomeScreenButton = () => {
  const { isTelegram } = useTelegramTheme();
  const { addToast } = useToast();
  const [status, setStatus] = useState<HomeScreenStatus>('unknown');
  const [isLoading, setIsLoading] = useState(false);

  // Check initial status
  useEffect(() => {
    if (isTelegram && checkHomeScreenStatus.isAvailable()) {
      checkHomeScreenStatus()
        .then(status => setStatus(status as HomeScreenStatus))
        .catch(() => setStatus('unknown'));
    }
  }, [isTelegram]);

  // Set up event listeners
  useEffect(() => {
    const handleAdded = () => {
      setStatus('added');
      setIsLoading(false);
      addToast({
        type: 'success',
        title: 'Success!',
        message: 'Added to home screen! 🎉',
      });
    };

    const handleFailed = () => {
      setIsLoading(false);
      addToast({
        type: 'error',
        title: 'Failed',
        message: 'Failed to add to home screen',
      });
    };

    if (isTelegram) {
      onAddedToHomeScreen(handleAdded);
      onAddToHomeScreenFailed(handleFailed);

      return () => {
        offAddedToHomeScreen(handleAdded);
        offAddToHomeScreenFailed(handleFailed);
      };
    }
  }, [isTelegram, addToast]);

  const handleAddToHomeScreen = () => {
    if (!addToHomeScreen.isAvailable()) {
      addToast({
        type: 'error',
        title: 'Not supported',
        message: 'Feature not supported on this device',
      });
      return;
    }

    setIsLoading(true);
    addToHomeScreen();
  };

  // Don't show if not in Telegram or if already added
  if (!isTelegram || status === 'unsupported' || status === 'added') {
    return null;
  }

  return (
    <Button
      mode="bezeled"
      size="s"
      onClick={handleAddToHomeScreen}
      disabled={isLoading}
      className="bg-blue-500 text-white hover:bg-blue-600"
    >
      {isLoading ? 'Adding...' : 'Add as app'}
    </Button>
  );
};
