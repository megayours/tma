import { useEffect, useState, useCallback } from 'react';
import { Buffer } from 'buffer';
import { isTMA } from '@telegram-apps/bridge';
import { popup, hapticFeedback } from '@telegram-apps/sdk-react';
import { useTelegramRawInitData } from './useTelegram';

export type Session = {
  auth_provider: 'discord' | 'telegram';
  id: string;
  username: string;
  jwt: string;
  expiration?: number | null;
  rawUser: string;
  authToken: string;
  communityPermissions: Array<{
    communityId: string;
    permissions: string[];
  }>;
};

export type AuthError = {
  message: string;
  details?: string;
  statusCode?: number;
  timestamp: number;
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
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

    // Check for required fields (communityPermissions added later, old sessions won't have it)
    if (!sessionData.communityPermissions) {
      localStorage.removeItem('session');
      return false;
    }

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
  const authenticateDiscord = useCallback(async (): Promise<{
    success: boolean;
    error?: AuthError;
  }> => {
    const discordToken = localStorage.getItem('discord_token');
    const authProvider = localStorage.getItem('auth_provider');

    if (!discordToken || authProvider !== 'discord') {
      return {
        success: false,
        error: {
          message: 'No Discord token available',
          timestamp: Date.now(),
        },
      };
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/profile`,
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
          communityPermissions: data.community_permissions.map((c: any) => {
            return { communityId: c.community_id, permissions: c.permissions };
          }),
        };

        localStorage.setItem('session', JSON.stringify(session));
        setSession(session);
        setIsAuthenticated(true);
        setAuthError(null); // Clear any previous errors
        return { success: true };
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('discord_token');
        localStorage.removeItem('discord_user');
        localStorage.removeItem('auth_provider');
        localStorage.removeItem('session');
        setIsAuthenticated(false);
        setSession(null);

        // Handle HTTP error responses
        let errorMessage = 'Authentication failed';
        let errorDetails = '';

        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || '';
        } catch (e) {
          // Response body might not be JSON
          try {
            errorDetails = await response.text();
          } catch (textError) {
            // Ignore if can't read text either
          }
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            details: errorDetails,
            statusCode: response.status,
            timestamp: Date.now(),
          },
        };
      }
    } catch (error) {
      console.error('Discord token validation error:', error);
      localStorage.removeItem('session');
      setIsAuthenticated(false);
      setSession(null);
      return {
        success: false,
        error: {
          message: 'Network error',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        },
      };
    }
  }, []);

  // Extract Telegram authentication logic into reusable function
  const authenticateTelegram = useCallback(async (): Promise<{
    success: boolean;
    error?: AuthError;
  }> => {
    if (!checkIsTMA() || !telegramUser?.initData) {
      return {
        success: false,
        error: {
          message: 'Not in Telegram environment',
          timestamp: Date.now(),
        },
      };
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
          communityPermissions: data.community_permissions.map((c: any) => {
            return { communityId: c.community_id, permissions: c.permissions };
          }),
        };

        localStorage.setItem('session', JSON.stringify(session));
        setSession(session);
        setIsAuthenticated(true);
        setAuthError(null); // Clear any previous errors
        return { success: true };
      }

      // Handle HTTP error responses
      let errorMessage = 'Authentication failed';
      let errorDetails = '';

      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.error || '';
      } catch (e) {
        // Response body might not be JSON
        try {
          errorDetails = await response.text();
        } catch (textError) {
          // Ignore if can't read text either
        }
      }

      return {
        success: false,
        error: {
          message: errorMessage,
          details: errorDetails,
          statusCode: response.status,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('Telegram token validation error:', error);
      return {
        success: false,
        error: {
          message: 'Network error',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        },
      };
    }
  }, [checkIsTMA, telegramUser?.initData]);

  // Function to manually refresh authentication
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setAuthError(null); // Clear previous errors
    setHasAttemptedAuth(false); // Allow retry

    try {
      // Wait a moment for the stored tokens to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      // Try Discord authentication first
      const discordResult = await authenticateDiscord();
      if (discordResult.success) {
        setHasAttemptedAuth(true);
        return true;
      } else if (discordResult.error) {
        setAuthError(discordResult.error);
      }

      // If Discord fails, try Telegram
      const telegramResult = await authenticateTelegram();
      if (telegramResult.success) {
        setHasAttemptedAuth(true);
        return true;
      } else if (telegramResult.error) {
        setAuthError(telegramResult.error);
      }

      setHasAttemptedAuth(true);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [authenticateDiscord, authenticateTelegram]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent multiple simultaneous authentication attempts
      if (isAuthenticating) return;

      // Prevent retry loop - only attempt once per session
      if (hasAttemptedAuth) return;

      // Check if we already have a valid session first
      if (await isSessionValid()) {
        const sessionData = JSON.parse(localStorage.getItem('session') || '{}');
        setSession(sessionData);
        setIsAuthenticated(true);
        setHasAttemptedAuth(true);
        return;
      }

      setIsAuthenticating(true);
      setHasAttemptedAuth(true); // Mark that we've attempted auth

      try {
        if (checkIsTMA()) {
          setIsTelegram(true);

          // Validate the user asynchronously
          if (telegramUser) {
            if (!telegramUser.initData)
              throw new Error('No telegram init data found');

            const result = await authenticateTelegram();
            if (!result.success) {
              setIsAuthenticated(false);
              setAuthError(result.error || null);
            }
          } else {
            setIsAuthenticated(false);
            setAuthError({
              message: 'No Telegram user data available',
              timestamp: Date.now(),
            });
          }
        } else {
          // Try Discord authentication
          const result = await authenticateDiscord();
          if (!result.success) {
            setIsAuthenticated(false);
            setAuthError(result.error || null);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
        setAuthError({
          message: 'Authentication error',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        });
      } finally {
        setIsAuthenticating(false);
      }
    };
    if (!isAuthenticating && !isAuthenticated && !hasAttemptedAuth) {
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
    hasAttemptedAuth,
  ]);

  // Show Telegram native popup when authentication errors occur
  useEffect(() => {
    if (authError && hasAttemptedAuth && checkIsTMA()) {
      // Trigger error haptic feedback
      if (hapticFeedback?.notificationOccurred) {
        hapticFeedback.notificationOccurred('error');
      }

      // Show Telegram native popup
      const showErrorPopup = async () => {
        const errorMessage = authError.details
          ? `${authError.message}: ${authError.details}`
          : authError.message;

        if (popup?.open) {
          const result = await popup.open({
            title: 'Login Failed',
            message: errorMessage,
            buttons: [
              {
                id: 'retry',
                type: 'default',
                text: 'Retry',
              },
              {
                id: 'cancel',
                type: 'cancel',
              },
            ],
          });

          if (result === 'retry') {
            refreshAuth();
          }
        }
      };

      showErrorPopup();
    }
  }, [authError, hasAttemptedAuth, checkIsTMA, refreshAuth]);

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
    authError,
    hasAttemptedAuth,
  };
}
