import type { BuildInfo } from '../types/build-info';

/**
 * Get build information injected at compile time
 */
export function getBuildInfo(): BuildInfo {
  // In development, use fallback values
  if (import.meta.env.DEV) {
    return {
      version: import.meta.env.VITE_APP_VERSION || '0.0.0-dev',
      commitHash: 'dev',
      commitHashShort: 'dev',
      branch: 'local',
      buildTimestamp: new Date().toISOString(),
      buildDate: new Date().toLocaleString(),
      environment: 'development',
    };
  }

  // In production, use injected values
  return {
    version: __BUILD_INFO__.version || '0.0.0',
    commitHash: __BUILD_INFO__.commitHash || 'unknown',
    commitHashShort: __BUILD_INFO__.commitHashShort || 'unknown',
    branch: __BUILD_INFO__.branch || 'unknown',
    buildTimestamp: __BUILD_INFO__.buildTimestamp || new Date().toISOString(),
    buildDate: __BUILD_INFO__.buildDate || new Date().toLocaleString(),
    environment: __BUILD_INFO__.environment || 'production',
  };
}

/**
 * Log build information to console
 * Styled for better visibility
 */
export function logBuildInfo(): void {
  const info = getBuildInfo();

  console.group(
    '%c🚀 Build Information',
    'color: #00d4ff; font-weight: bold; font-size: 14px;'
  );
  console.log('%cVersion:', 'font-weight: bold;', info.version);
  console.log(
    '%cCommit:',
    'font-weight: bold;',
    `${info.commitHashShort} (${info.commitHash})`
  );
  console.log('%cBranch:', 'font-weight: bold;', info.branch);
  console.log('%cBuild Date:', 'font-weight: bold;', info.buildDate);
  console.log('%cEnvironment:', 'font-weight: bold;', info.environment);
  console.groupEnd();
}

/**
 * Attach build info to window object for debugging
 */
export function attachBuildInfoToWindow(): void {
  if (typeof window !== 'undefined') {
    window.__BUILD_INFO__ = getBuildInfo();
  }
}
