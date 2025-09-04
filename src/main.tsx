import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { ThemeProvider } from './auth/ThemeProvider';
import { AuthProvider } from './auth/AuthProvider';
import './style.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Environment variables check - for debugging deployment
console.log('🔍 Environment Variables Check - v2:');
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('BASE_URL:', import.meta.env.BASE_URL);
console.log('VITE_PUBLIC_API_URL:', import.meta.env.VITE_PUBLIC_API_URL);
console.log('All import.meta.env:', import.meta.env);

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
      <ThemeProvider>
        <AuthProvider>
          <AppRoot>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </AppRoot>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
