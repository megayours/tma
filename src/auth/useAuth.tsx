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

  // Separate function to check if session is valid without setting state
  const isSessionValid = useCallback(() => {
    const session = localStorage.getItem('session');
    if (!session) return false;

    const sessionData = JSON.parse(session);
    if (sessionData.auth_provider === 'discord') {
      const sessionExpirationMargin = 1000 * 60 * 60 * 1; // 1 hour
      if (sessionData.expiration > Date.now() + sessionExpirationMargin) {
        return true;
      } else {
        localStorage.removeItem('session');
        return false;
      }
    } else if (sessionData.auth_provider === 'telegram') {
      const jwt = JSON.parse(session).jwt;
      const jwtQueryParams = new URLSearchParams(jwt);
      const jwtAuthDate = jwtQueryParams.get('auth_date');
      if (!jwtAuthDate) return false;
      const jwtAuthDateTimestamp = parseInt(jwtAuthDate) * 1000;

      if (jwtAuthDateTimestamp < Date.now() + 1000 * 60 * 60 * 1) {
        localStorage.removeItem('session');
        return false;
      }
      return true;
    }

    return false;
  }, []);

  // Extract Discord authentication logic into reusable function
  const authenticateDiscord = useCallback(async (): Promise<boolean> => {
    const discordToken = localStorage.getItem('discord_token');
    const authProvider = localStorage.getItem('auth_provider');

    if (!discordToken || authProvider !== 'discord') {
      return false;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/validate`,
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

        localStorage.setItem('session', JSON.stringify(session));
        setSession(session);
        setIsAuthenticated(true);
        return true;
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('discord_token');
        localStorage.removeItem('discord_user');
        localStorage.removeItem('auth_provider');
        localStorage.removeItem('session');
        setIsAuthenticated(false);
        setSession(null);
        return false;
      }
    } catch (error) {
      console.error('Discord token validation error:', error);
      localStorage.removeItem('session');
      setIsAuthenticated(false);
      setSession(null);
      return false;
    }
  }, []);

  // Extract Telegram authentication logic into reusable function
  const authenticateTelegram = useCallback(async (): Promise<boolean> => {
    if (!checkIsTMA() || !telegramUser?.initData) {
      return false;
    }

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

      if (response.ok) {
        const data = await response.json();
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
        return true;
      }
      return false;
    } catch (error) {
      console.error('Telegram token validation error:', error);
      return false;
    }
  }, [checkIsTMA, telegramUser?.initData]);

  // Function to manually refresh authentication
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      // Wait a moment for the stored tokens to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try Discord authentication first
      const discordSuccess = await authenticateDiscord();
      if (discordSuccess) {
        return true;
      }

      // If Discord fails, try Telegram
      const telegramSuccess = await authenticateTelegram();
      if (telegramSuccess) {
        return true;
      }

      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [authenticateDiscord, authenticateTelegram]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple simultaneous authentication attempts
      if (isAuthenticating) return;

      // Check if we already have a valid session first
      if (await isSessionValid()) {
        const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
        setSession(sessionData);
        setIsAuthenticated(true);
        return;
      }

      setIsAuthenticating(true);

      try {
        if (checkIsTMA()) {
          setIsTelegram(true);

          // Validate the user asynchronously
          if (telegramUser) {
            if (!telegramUser.initData)
              throw new Error('No telegram init data found');

            const success = await authenticateTelegram();
            if (!success) {
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          // Try Discord authentication
          const success = await authenticateDiscord();
          if (!success) {
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
    if (!isAuthenticating && !isAuthenticated) {
      initializeAuth();
    }
  }, [
    checkIsTMA,
    telegramUser?.initData,
    isSessionValid,
    authenticateDiscord,
    authenticateTelegram,
    isAuthenticating,
    isAuthenticated,
  ]);

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
    refreshAuth,
  };
}
