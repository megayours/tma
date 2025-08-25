import { useEffect, useState, useCallback } from 'react';
import { Buffer } from 'buffer';
import { isTMA } from '@telegram-apps/bridge';
import { useTelegramRawInitData } from './useTelegram';

export type Session = {
  auth_provider: 'discord' | 'telegram';
  id: string;
  username: string;
  jwt: string;
  expiration?: number | null;
  rawUser: string;
  authToken: string;
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const telegramUser = useTelegramRawInitData();

  // Memoize the isTMA check to prevent unnecessary re-renders
  const checkIsTMA = useCallback(() => isTMA(), []);

  function getExpTimestamp(token: string) {
    // Check if this is a Telegram init data string (contains query_id)
    if (token.includes('query_id=')) {
      // Parse the URL-encoded query string
      const urlParams = new URLSearchParams(token);
      const authDate = urlParams.get('auth_date');
      if (authDate) {
        // Convert auth_date to milliseconds (it's in seconds)
        return parseInt(authDate) * 1000;
      }
      return null;
    }

    // Handle traditional JWT format
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      return decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  console.log('isAuthenticated', isAuthenticated);
  console.log('isAuthenticating', isAuthenticating);
  console.log('session', session);

  // Separate function to check if session is valid without setting state
  const isSessionValid = useCallback(() => {
    console.log('AAAALPHAAAA:');
    const session = localStorage.getItem('session');
    if (!session) return false;

    const sessionData = JSON.parse(session);

    console.log('ALPHA:', sessionData, sessionData.auth_provider);
    if (sessionData.auth_provider === 'discord') {
      const sessionExpirationMargin = 1000 * 60 * 60 * 1; // 1 hour
      if (sessionData.expiration > Date.now() + sessionExpirationMargin) {
        return true;
      } else {
        localStorage.removeItem('session');
        return false;
      }
    } else if (sessionData.auth_provider === 'telegram') {
      console.log('PROVIDER IS TELEGRAM');

      const jwt = JSON.parse(session).jwt;
      const jwtQueryParams = new URLSearchParams(jwt);
      const jwtAuthDate = jwtQueryParams.get('auth_date');
      if (!jwtAuthDate) return false;
      const jwtAuthDateTimestamp = parseInt(jwtAuthDate) * 1000;

      if (jwtAuthDateTimestamp < Date.now() + 1000 * 60 * 60 * 1) {
        localStorage.removeItem('session');
        console.log('Telegram session expired, clearing');
        return false;
      }
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log(1);
      // Prevent multiple simultaneous authentication attempts
      if (isAuthenticating) return;

      // Check if we already have a valid session first
      console.log(isSessionValid(), 'IS SESSION VALID');
      if (await isSessionValid()) {
        console.log('0.1');
        const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
        setSession(sessionData);
        setIsAuthenticated(true);
        return;
      }
      console.log('2');

      setIsAuthenticating(true);

      try {
        if (checkIsTMA()) {
          setIsTelegram(true);
          console.log('Logging in with Telegram');

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
                  expiration: getExpTimestamp(telegramUser.initData),
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
    console.log('00');
    console.log(
      isAuthenticating,
      '🧼🧼 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    );

    if (!isAuthenticating && !isAuthenticated) {
      console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
      initializeAuth();
    }
    console.log('ZZZ');
  }, [checkIsTMA, telegramUser?.initData, isSessionValid]); // Removed isAuthenticating from dependencies

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
