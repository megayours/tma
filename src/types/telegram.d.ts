declare global {
  interface TelegramLoginResult {
    id_token?: string;
    user?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      [key: string]: unknown;
    };
    error?: string;
  }

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
