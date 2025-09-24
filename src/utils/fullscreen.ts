import { requestFullscreen as sdkRequestFullscreen, exitFullscreen, isFullscreen } from '@telegram-apps/sdk-react';

/**
 * Requests fullscreen mode in Telegram Mini App
 * This provides an immersive experience by hiding the browser UI
 */
export const requestFullscreen = () => {
  try {
    if (sdkRequestFullscreen && sdkRequestFullscreen.isAvailable()) {
      sdkRequestFullscreen();
      console.log('Fullscreen mode requested');
      return true;
    } else {
      console.warn('Fullscreen API not available');
      return false;
    }
  } catch (error) {
    console.error('Failed to request fullscreen:', error);
    return false;
  }
};

/**
 * Exits fullscreen mode in Telegram Mini App
 */
export const exitFullscreenMode = () => {
  try {
    if (exitFullscreen && exitFullscreen.isAvailable()) {
      exitFullscreen();
      console.log('Fullscreen mode exited');
      return true;
    } else {
      console.warn('Exit fullscreen API not available');
      return false;
    }
  } catch (error) {
    console.error('Failed to exit fullscreen:', error);
    return false;
  }
};

/**
 * Checks if the app is currently in fullscreen mode
 */
export const checkIsFullscreen = (): boolean => {
  try {
    if (isFullscreen) {
      return isFullscreen();
    }
    return false;
  } catch (error) {
    console.error('Failed to check fullscreen status:', error);
    return false;
  }
};