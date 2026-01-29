import { downloadFile } from '@telegram-apps/sdk-react';

/**
 * Downloads a file using Telegram's native download functionality
 * @param url - The URL of the file to download
 * @param fileName - The suggested filename for the download
 * @returns Promise that resolves when download starts or rejects on error
 */
export const downloadTelegramFile = async (
  url: string,
  fileName: string
): Promise<boolean> => {
  console.log('[TelegramDownload] Starting download process');
  console.log('[TelegramDownload] URL:', url);
  console.log('[TelegramDownload] File name:', fileName);
  console.log(
    '[TelegramDownload] downloadFile.isAvailable():',
    downloadFile.isAvailable()
  );

  if (!downloadFile.isAvailable()) {
    console.warn(
      '[TelegramDownload] downloadFile is not available in this environment'
    );
    return false;
  }

  try {
    console.log('[TelegramDownload] Calling downloadFile...');
    await downloadFile(url, fileName);
    console.log('[TelegramDownload] downloadFile completed successfully');
    return true;
  } catch (error) {
    console.error('[TelegramDownload] Error calling downloadFile:', error);
    throw error;
  }
};

/**
 * Utility to check if Telegram download functionality is available
 * @returns boolean indicating if downloading is supported
 */
export const canDownloadFile = (): boolean => {
  return downloadFile.isAvailable();
};
