// Build information injected at compile time
export interface BuildInfo {
  version: string;
  commitHash: string;
  commitHashShort: string;
  branch: string;
  buildTimestamp: string;
  buildDate: string;
  environment: string;
}

declare global {
  interface Window {
    __BUILD_INFO__: BuildInfo;
  }

  const __BUILD_INFO__: BuildInfo;
}

export {};
