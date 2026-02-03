declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        downloadFile?: (
          params: { url: string; file_name: string },
          callback?: (result: boolean) => void
        ) => void;
        [key: string]: unknown;
      };
    };
  }
}

export {};
