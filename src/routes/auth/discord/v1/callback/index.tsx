import {
  createFileRoute,
  redirect,
  useNavigate,
  isRedirect,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/auth/discord/v1/callback/')({
  component: DiscordCallback,
  loader: async ({ location }) => {
    // Get the authorization code from URL search params
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      throw redirect({
        to: '/',
        search: {
          success: undefined,
          error: 'discord_auth_failed',
          message: error,
          user: undefined,
        },
      });
    }

    if (!code) {
      throw redirect({
        to: '/',
        search: {
          success: undefined,
          error: 'discord_auth_failed',
          message: 'No authorization code received',
          user: undefined,
        },
      });
    }

    try {
      console.log('code', code);
      console.log('state', state);
      // Call the Discord callback endpoint directly
      const callbackResponse = await fetch(
        `https://yours-fun-api.testnet.megayours.com/v1/auth/discord/callback?code=${code}&state=${state || ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // console.log('callbackResponse', callbackResponse);

      if (!callbackResponse.ok) {
        console.log('Failed to complete Discord authentication');
        throw new Error('Failed to complete Discord authentication');
      }

      const tokenData = await callbackResponse.json();

      console.log('tokenData', tokenData);
      // Store the token in localStorage
      localStorage.setItem('discord_token', tokenData.token);
      localStorage.setItem('auth_provider', 'discord');

      console.log('redirecting to home page');

      // Redirect to the home page with success message
      throw redirect({
        to: state || '/',
      });
    } catch (error) {
      console.error('Discord callback error:', error);

      // Check if this is a redirect (which is not an error)
      if (isRedirect(error)) {
        throw error; // Re-throw redirects as they're not errors
      }

      // Only handle actual errors
      throw redirect({
        to: '/',
        search: {
          success: undefined,
          error: 'discord_auth_failed',
          message: 'Failed to complete authentication',
          user: undefined,
        },
      });
    }
  },
});

function DiscordCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [message, setMessage] = useState(
    'Processing Discord authentication...'
  );
  const navigate = useNavigate();

  useEffect(() => {
    // This component will only render briefly before the loader redirects
    const timer = setTimeout(() => {
      setStatus('error');
      setMessage('Authentication is taking longer than expected...');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleReturnHome = () => {
    navigate({
      to: '/',
      search: {
        success: undefined,
        error: 'discord_auth_timeout',
        message: 'Authentication timed out',
        user: undefined,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <h2 className="mb-2 text-xl font-semibold">Discord Authentication</h2>
        <p className="text-gray-600">{message}</p>
        {status === 'error' && (
          <button
            onClick={handleReturnHome}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
}
