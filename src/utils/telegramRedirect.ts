import { openTelegramLink } from '@telegram-apps/sdk-react';

/**
 * Redirects to the Telegram bot
 * Uses the VITE_PUBLIC_BOT_URL environment variable
 * The app will automatically close when the link is opened
 */
export const redirectToTelegramBot = (): void => {
  console.log('🔗 REDIRECT: Starting Telegram bot redirect process');

  const botUrl = import.meta.env.VITE_PUBLIC_BOT_URL;
  console.log('🔗 REDIRECT: Bot URL from env:', botUrl ? `${botUrl.substring(0, 20)}...` : 'NOT SET');

  if (!botUrl) {
    console.error('❌ REDIRECT: VITE_PUBLIC_BOT_URL environment variable is not set');
    return;
  }

  console.log('🔗 REDIRECT: Checking if openTelegramLink is available...');
  console.log('🔗 REDIRECT: openTelegramLink.isAvailable():', openTelegramLink.isAvailable());

  try {
    if (openTelegramLink.isAvailable()) {
      console.log('✅ REDIRECT: openTelegramLink is available, calling with URL:', botUrl);
      openTelegramLink(botUrl);
      console.log('✅ REDIRECT: openTelegramLink called successfully - app should close automatically');
    } else {
      console.warn('⚠️ REDIRECT: openTelegramLink is not available in this environment');
    }
  } catch (error) {
    console.error('❌ REDIRECT: Error calling openTelegramLink:', error);
  }
};

/**
 * Utility to check if redirect functionality is available
 */
export const canRedirectToTelegram = (): boolean => {
  return openTelegramLink.isAvailable() && !!import.meta.env.VITE_PUBLIC_BOT_URL;
};