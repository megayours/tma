import { useEffect } from 'react';

interface ErrorFallbackProps {
  error: unknown;
  componentStack: string;
  eventId: string;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  useEffect(() => {
    // Log error details to console for debugging
    console.error('App crashed with error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
        color: 'var(--tg-theme-text-color, #000000)',
      }}
    >
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.8 }}>
          We've been notified of the issue and are looking into it.
        </p>
        <button
          onClick={resetError}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: 'var(--tg-theme-button-color, #0088cc)',
            color: 'var(--tg-theme-button-text-color, #ffffff)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        {import.meta.env.DEV && (
          <details style={{ marginTop: '24px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
              Error Details (Dev Only)
            </summary>
            <pre
              style={{
                padding: '12px',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
              }}
            >
              {String(error)}
              {'\n\n'}
              {error instanceof Error ? error.stack : ''}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
