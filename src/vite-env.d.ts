/// <reference types="vite/client" />

// Visual Viewport API types for better mobile keyboard handling
interface VisualViewport extends EventTarget {
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly pageLeft: number;
  readonly pageTop: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  onresize: ((this: VisualViewport, ev: Event) => any) | null;
  onscroll: ((this: VisualViewport, ev: Event) => any) | null;
}

interface Window {
  visualViewport?: VisualViewport;
}

// Vite environment variables
interface ImportMetaEnv {
  // Build metadata
  readonly VITE_APP_VERSION?: string;
  readonly VITE_GIT_COMMIT_HASH?: string;
  readonly VITE_GIT_BRANCH?: string;
  readonly VITE_BUILD_TIMESTAMP?: string;
  // App configuration
  readonly VITE_PUBLIC_API_URL?: string;
  readonly VITE_PUBLIC_BOT_URL?: string;
  readonly VITE_ALLOWED_HOSTS?: string;
  // Sentry
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
