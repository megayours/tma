import * as Sentry from '@sentry/react';
import { getBuildInfo } from './buildInfo';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development';
  const buildInfo = getBuildInfo();

  // Always log initialization attempt (even in production) to debug issues
  // Using console.warn to ensure it shows up in production (console.log is stripped)
  console.warn('[Sentry] Initialization attempt:', {
    hasDSN: !!dsn,
    dsnPreview: dsn ? `${dsn.substring(0, 30)}...${dsn.slice(-10)}` : 'none',
    environment,
    buildInfo: {
      version: buildInfo.version,
      branch: buildInfo.branch,
      commit: buildInfo.commitHashShort,
    },
  });

  // Only initialize if DSN is provided
  if (!dsn) {
    console.warn('[Sentry] DSN not provided, skipping initialization');
    return;
  }

  try {
    Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    // Release tracking - use full version with commit hash
    release: `${buildInfo.version}@${buildInfo.commitHashShort}`,
    // Additional context
    initialScope: {
      tags: {
        'git.commit': buildInfo.commitHash,
        'git.branch': buildInfo.branch,
        'build.timestamp': buildInfo.buildTimestamp,
      },
    },
    beforeSend(event) {
      // Filter out development errors if needed
      if (environment === 'development' && !dsn) {
        return null;
      }
      return event;
    },
  });
    console.warn('✅ [Sentry] Initialized successfully');
  } catch (error) {
    console.error('❌ [Sentry] Initialization failed:', error);
  }
}
