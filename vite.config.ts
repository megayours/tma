import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { execSync } from 'child_process';

// Helper to safely execute git commands
function getGitInfo(command: string, fallback: string = 'unknown'): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch {
    return fallback;
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Parse allowed hosts from environment variable (comma-separated)
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map(host => host.trim())
    : ['localhost', '127.0.0.1', 'mini.megayours.fun', 'mini.yours.fun'];

  const isProd = mode === 'production' || mode === 'staging';

  // Get git information for build tracking
  const getCommitHash = () =>
    env.VITE_GIT_COMMIT_HASH || getGitInfo('git rev-parse HEAD');
  const getCommitHashShort = () =>
    env.VITE_GIT_COMMIT_HASH
      ? getGitInfo(`git rev-parse --short ${env.VITE_GIT_COMMIT_HASH}`)
      : getGitInfo('git rev-parse --short HEAD');
  const getBranch = () =>
    env.VITE_GIT_BRANCH || getGitInfo('git rev-parse --abbrev-ref HEAD');
  const getBuildTimestamp = () =>
    env.VITE_BUILD_TIMESTAMP || new Date().toISOString();
  const getBuildDate = () =>
    new Date(getBuildTimestamp()).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

  // Get version from environment or package.json
  const packageVersion = env.VITE_APP_VERSION || '0.0.0';

  // Determine environment
  const environment =
    mode === 'production' ? 'production' : mode === 'staging' ? 'staging' : 'development';

  // Build plugins array
  const plugins = [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false, // Disable service worker in dev to avoid caching issues
        },
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Yours Mini App',
          short_name: 'Yours',
          description: 'Create and manage your sticker packs',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              // Cache external API images - more flexible pattern
              urlPattern: ({ url, request }) =>
                url.hostname.includes('megayours.com') &&
                (request.destination === 'image' ||
                  url.pathname.match(/\.(png|jpg|jpeg|webp|gif|webm)(\?.*)?$/i) ||
                  url.pathname.includes('/content/') ||
                  url.pathname.includes('/preview/')),
              handler: 'NetworkFirst', // Changed to NetworkFirst to avoid serving stale/failed responses
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                networkTimeoutSeconds: 10, // Fallback to cache after 10s timeout
              },
            },
            {
              // Cache API calls with network-first strategy
              urlPattern: ({ url, request }) =>
                url.hostname.includes('megayours.com') &&
                request.destination !== 'image',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 5, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
  ];

  // Add Sentry plugin only if all required credentials are provided
  if (isProd && env.SENTRY_ORG && env.SENTRY_PROJECT && env.SENTRY_AUTH_TOKEN) {
    plugins.push(
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          assets: './dist/**',
        },
        telemetry: false,
      })
    );
  }

  return {
    base: '/',
    define: {
      __BUILD_INFO__: JSON.stringify({
        version: packageVersion,
        commitHash: getCommitHash(),
        commitHashShort: getCommitHashShort(),
        branch: getBranch(),
        buildTimestamp: getBuildTimestamp(),
        buildDate: getBuildDate(),
        environment: environment,
      }),
    },
    plugins,
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      // Generate source maps for error tracking
      sourcemap: isProd,
      // Enable rollup options for better chunking
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['@tanstack/react-router'],
            'query-vendor': ['@tanstack/react-query'],
          },
        },
      },
      // Increase chunk size warning limit (500 KB is reasonable for modern apps)
      chunkSizeWarningLimit: 500,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Optimize deps
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        usePolling: true,
      },
      allowedHosts: allowedHosts,
    },
  };
});
