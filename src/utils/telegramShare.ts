import { shareURL } from '@telegram-apps/sdk-react';

/**
 * Shares a URL with an optional message using Telegram's share functionality
 * @param url - The URL to share
 * @param text - Optional text message to include with the share
 */
export const shareTelegramMessage = (url: string, text?: string): void => {
  console.log('📤 SHARE: Starting Telegram share process');
  console.log('📤 SHARE: URL:', url);
  console.log('📤 SHARE: Text:', text || 'No text provided');

  console.log('📤 SHARE: Checking if shareURL is available...');
  console.log('📤 SHARE: shareURL.isAvailable():', shareURL.isAvailable());

  if (!shareURL.isAvailable()) {
    console.warn('⚠️ SHARE: shareURL is not available in this environment');
    throw new Error('Share functionality is not available');
  }

  try {
    console.log('✅ SHARE: Calling shareURL...');
    shareURL(url, text);
    console.log('✅ SHARE: shareURL called successfully');
  } catch (error) {
    console.error('❌ SHARE: Error calling shareURL:', error);
    throw error;
  }
};

/**
 * Utility to check if share functionality is available
 * @returns boolean indicating if sharing is supported
 */
export const canShareMessage = (): boolean => {
  return shareURL.isAvailable();
};
