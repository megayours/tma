import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/auth/AuthProvider';

export const Route = createFileRoute('/auth/refresh')({
  component: AuthRefresh,
  validateSearch: (search) => ({
    redirectTo: search.redirectTo as string | undefined,
    provider: search.provider as string | undefined,
  }),
});

function AuthRefresh() {
  const { refreshAuth } = useAuthContext();
  const search = useSearch({ from: '/auth/refresh' });
  const [status, setStatus] = useState<'refreshing' | 'success' | 'error'>(
    'refreshing'
  );
  const [message, setMessage] = useState('Refreshing authentication...');

  useEffect(() => {
    const handleAuthRefresh = async () => {
      try {
        setStatus('refreshing');
        setMessage('Refreshing authentication...');

        // Wait a moment for the stored tokens to be available
        await new Promise(resolve => setTimeout(resolve, 100));

        // Attempt to refresh authentication
        const success = await refreshAuth();

        if (success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');

          // Redirect to the intended destination after a brief delay
          setTimeout(() => {
            window.location.href = search.redirectTo || '/';
          }, 1000);
        } else {
          setStatus('error');
          setMessage('Authentication failed. Redirecting to home...');

          // Redirect to home on failure
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
      } catch (error) {
        console.error('Auth refresh error:', error);
        setStatus('error');
        setMessage('Authentication error. Redirecting to home...');

        // Redirect to home on error
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };

    handleAuthRefresh();
  }, [refreshAuth, search.redirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === 'refreshing' && (
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        )}
        {status === 'success' && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-green-600 bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-red-600 bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )}

        <h2 className="mb-2 text-xl font-semibold">Authentication Refresh</h2>
        <p className="text-gray-600">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => (window.location.href = '/')}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go to Home
          </button>
        )}
      </div>
    </div>
  );
}
