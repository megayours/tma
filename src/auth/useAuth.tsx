import { useEffect, useState, useCallback } from 'react';
import { Buffer } from 'buffer';
import { isTMA } from '@telegram-apps/bridge';
import { useTelegramRawInitData } from './useTelegram';

export type Session = {
  auth_provider: 'discord' | 'telegram';
  id: string;
  username: string;
  jwt: string;
  expiration?: number;
  rawUser: string;
  authToken: string;
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const telegramUser = useTelegramRawInitData();

  // Memoize the isTMA check to prevent unnecessary re-renders
  const checkIsTMA = useCallback(() => isTMA(), []);

  function getExpTimestamp(token: string) {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded.exp;
  }

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple simultaneous authentication attempts
      if (isAuthenticating && session) return;

      // Check if we already have a valid session first
      if (checkIsAuthenticated()) {
        setIsAuthenticating(false);
        return;
      }

      try {
        if (checkIsTMA()) {
          setIsTelegram(true);

          // Validate the user asynchronously
          if (telegramUser) {
            if (!telegramUser.initData)
              throw new Error('No telegram init data found');

            try {
              const response = await fetch(
                `${import.meta.env.VITE_PUBLIC_API_URL}/auth/validate`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `tma ${telegramUser.initData}`,
                  },
                }
              );

              const data = await response.json();
              if (response.ok) {
                const session: Session = {
                  auth_provider: 'telegram',
                  id: data.id,
                  username: data.name,
                  jwt: telegramUser.initData,
                  rawUser: JSON.stringify(data),
                  authToken: 'tma ' + telegramUser.initData,
                };

                localStorage.setItem('session', JSON.stringify(session));
                setSession(session);
                setIsAuthenticated(true);
              } else {
                setIsAuthenticated(false);
              }
            } catch (error) {
              console.error('Telegram token validation error:', error);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          // Discord Login logic here
          const discordToken = localStorage.getItem('discord_token');
          const authProvider = localStorage.getItem('auth_provider');

          if (!discordToken) throw new Error('No discord token found');

          if (discordToken && authProvider === 'discord') {
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

              if (response.ok) {
                const data = await response.json();

                const tokenExpirationTime = getExpTimestamp(discordToken);

                const session: Session = {
                  auth_provider: 'discord',
                  id: data.id,
                  username: data.name,
                  jwt: discordToken,
                  expiration: tokenExpirationTime,
                  rawUser: JSON.stringify(data),
                  authToken: 'Bearer ' + discordToken,
                };

                // we can save the session
                localStorage.setItem('session', JSON.stringify(session));
                setSession(session);
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
              localStorage.removeItem('session');
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
  }, [checkIsTMA, telegramUser?.initData]); // Only depend on the actual initData, not the entire telegramUser object

  const checkIsAuthenticated = () => {
    const session = localStorage.getItem('session');
    if (session && JSON.parse(session).auth_provider === 'discord') {
      //check if the session is valid
      const sessionData = JSON.parse(session);
      const sessionExpirationMargin = 1000 * 60 * 60 * 1; // 1 hour
      if (sessionData.expiration > Date.now() + sessionExpirationMargin) {
        // we prefer to refresh the session a bit before it expires for smoother experience
        setIsAuthenticated(true);
        setSession(sessionData);
        return true;
      } else {
        localStorage.removeItem('session');
        setIsAuthenticated(false);
        return false;
      }
    } else if (session && JSON.parse(session).auth_provider === 'telegram') {
      setIsAuthenticated(true);
      setSession(JSON.parse(session));
      return true;
    } else {
      setIsAuthenticated(false);
      setSession(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('session');
    setIsAuthenticated(false);
    setSession(null);
  };

  return {
    isAuthenticated,
    isAuthenticating,
    isTelegram,
    session,
    logout,
  };
}
