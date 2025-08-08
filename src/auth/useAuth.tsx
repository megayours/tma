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
    const initializeAuth = async () => {
      try {
        if (isTMA()) {
          setIsTelegram(true);
          setUser(telegramUser);

          // Validate the user asynchronously
          if (telegramUser) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          // Discord Login logic here
          const discordToken = localStorage.getItem('discord_token');
          const authProvider = localStorage.getItem('auth_provider');

          if (discordToken && authProvider === 'discord') {
            console.log('validating DISCORD token');
            try {
              // Validate the token with your backend
              const response = await fetch(
                'https://yours-fun-api.testnet.megayours.com/v1/auth/validate',
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${discordToken}`,
                  },
                }
              );

              console.log('response', response);

              if (response.ok) {
                const data = await response.json();
                console.log('data', data);
                setUser(data);
                setIsAuthenticated(true);
              } else {
                // Token is invalid, clear storage
                localStorage.removeItem('discord_token');
                localStorage.removeItem('discord_user');
                localStorage.removeItem('auth_provider');
                setIsAuthenticated(false);
              }
            } catch (error) {
              console.error('Discord token validation error:', error);
              // Clear invalid tokens
              localStorage.removeItem('discord_token');
              localStorage.removeItem('discord_user');
              localStorage.removeItem('auth_provider');
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthenticating(false);
      }
    };

    initializeAuth();
  }, [isTMA, telegramUser]);

  const logout = () => {
    localStorage.removeItem('discord_token');
    localStorage.removeItem('discord_user');
    localStorage.removeItem('auth_provider');
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, isAuthenticating, isTelegram, user, logout };
}
