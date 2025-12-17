import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
// import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ThemeProvider } from './auth/ThemeProvider';
import { AuthProvider } from './auth/AuthProvider';
import './style.css';

// Initialize Sentry
import { initSentry } from './utils/sentry';
initSentry();

// Import and initialize build info logging
import { logBuildInfo, attachBuildInfoToWindow } from './utils/buildInfo';

// Log build information on startup
logBuildInfo();
attachBuildInfoToWindow();

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
    </StrictMode>
  );
}
