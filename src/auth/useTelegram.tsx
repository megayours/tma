import { isTMA } from '@telegram-apps/bridge';
import { useRawInitData, initData } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

export function useTelegramRawInitData(): string | undefined {
  if (isTMA()) {
    return useRawInitData();
  } else {
    return undefined;
  }
}

// Utility function to convert Telegram color to hex
function telegramColorToHex(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export function useTelegramTheme() {
  const [isDark, setIsDark] = useState(false);
  const [themeParams, setThemeParams] = useState<any>(null);

  useEffect(() => {
    if (isTMA()) {
      // Access theme params from the global initData object
      const tgThemeParams = (window as any).Telegram?.WebApp?.themeParams;

      if (tgThemeParams) {
        setThemeParams(tgThemeParams);

        // Determine if theme is dark based on Telegram's theme params
        const isDarkTheme = tgThemeParams.color_scheme === 'dark';
        setIsDark(isDarkTheme);

        // Apply theme to document
        document.documentElement.classList.toggle('dark', isDarkTheme);

        // Apply Telegram theme colors as CSS custom properties
        if (tgThemeParams.bg_color) {
          document.documentElement.style.setProperty(
            '--tg-bg-color',
            telegramColorToHex(tgThemeParams.bg_color)
          );
        }
        if (tgThemeParams.text_color) {
          document.documentElement.style.setProperty(
            '--tg-text-color',
            telegramColorToHex(tgThemeParams.text_color)
          );
        }
        if (tgThemeParams.hint_color) {
          document.documentElement.style.setProperty(
            '--tg-hint-color',
            telegramColorToHex(tgThemeParams.hint_color)
          );
        }
        if (tgThemeParams.link_color) {
          document.documentElement.style.setProperty(
            '--tg-link-color',
            telegramColorToHex(tgThemeParams.link_color)
          );
        }
        if (tgThemeParams.button_color) {
          document.documentElement.style.setProperty(
            '--tg-button-color',
            telegramColorToHex(tgThemeParams.button_color)
          );
        }
        if (tgThemeParams.button_text_color) {
          document.documentElement.style.setProperty(
            '--tg-button-text-color',
            telegramColorToHex(tgThemeParams.button_text_color)
          );
        }
        if (tgThemeParams.secondary_bg_color) {
          document.documentElement.style.setProperty(
            '--tg-secondary-bg-color',
            telegramColorToHex(tgThemeParams.secondary_bg_color)
          );
        }
      }
    }
  }, []);

  return {
    isDark,
    themeParams,
    isTelegram: isTMA(),
  };
}

// Utility hook for getting Telegram theme colors
export function useTelegramColors() {
  const { themeParams, isTelegram } = useTelegramTheme();

  if (!isTelegram || !themeParams) {
    return {
      bgColor: '#ffffff',
      textColor: '#000000',
      hintColor: '#999999',
      linkColor: '#2481cc',
      buttonColor: '#2481cc',
      buttonTextColor: '#ffffff',
      secondaryBgColor: '#f1f1f1',
    };
  }

  return {
    bgColor: themeParams.bg_color
      ? telegramColorToHex(themeParams.bg_color)
      : '#ffffff',
    textColor: themeParams.text_color
      ? telegramColorToHex(themeParams.text_color)
      : '#000000',
    hintColor: themeParams.hint_color
      ? telegramColorToHex(themeParams.hint_color)
      : '#999999',
    linkColor: themeParams.link_color
      ? telegramColorToHex(themeParams.link_color)
      : '#2481cc',
    buttonColor: themeParams.button_color
      ? telegramColorToHex(themeParams.button_color)
      : '#2481cc',
    buttonTextColor: themeParams.button_text_color
      ? telegramColorToHex(themeParams.button_text_color)
      : '#ffffff',
    secondaryBgColor: themeParams.secondary_bg_color
      ? telegramColorToHex(themeParams.secondary_bg_color)
      : '#f1f1f1',
  };
}
