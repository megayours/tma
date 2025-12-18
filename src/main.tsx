// Initialize Sentry
import * as Sentry from '@sentry/react';
import { initSentry } from './utils/sentry';
initSentry();
import { ErrorFallback } from './components/ErrorFallback';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
// import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ThemeProvider } from './auth/ThemeProvider';
import { AuthProvider } from './auth/AuthProvider';
import './style.css';

// Import and initialize build info logging
import { logBuildInfo, attachBuildInfoToWindow } from './utils/buildInfo';

// Log build information on startup
logBuildInfo();
attachBuildInfoToWindow();

// Listen for service worker cleanup completion message
// The self-destructing service worker (public/sw.js) will send this message
// after it unregisters itself and clears all caches
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'SW_CLEANUP_COMPLETE') {
      console.log(
        '[SW-Cleanup] Received cleanup complete message, reloading...'
      );
      window.location.reload();
    }
  });
}

// Import and run one-time migration to clean up old service workers
import { migrateFromServiceWorker } from './utils/clearServiceWorker';
migrateFromServiceWorker();

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    },
  },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
        {/* <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"> */}
        <ThemeProvider>
          <AuthProvider>
            <AppRoot>
              <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
              </QueryClientProvider>
            </AppRoot>
          </AuthProvider>
        </ThemeProvider>
        {/* </TonConnectUIProvider> */}
      </Sentry.ErrorBoundary>
    </StrictMode>
  );
}
