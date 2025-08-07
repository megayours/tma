import { useEffect, useState } from 'react';
import { isTMA } from '@telegram-apps/bridge';
import { useTelegramRawInitData } from './useTelegram';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<any>(null);
  const telegramUser = useTelegramRawInitData();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (isTMA()) {
          setIsTelegram(true);
          console.log('telegramUser', telegramUser);
          setUser(telegramUser);
          setIsAuthenticated(true);
        } else {
          // Discord Login logic here
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthenticating(false);
      }
    };

    initializeAuth();
  }, [isTMA]);

  return { isAuthenticated, isAuthenticating, isTelegram, user };
}
