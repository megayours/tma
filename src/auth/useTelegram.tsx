import { isTMA } from '@telegram-apps/bridge';
import { initDataRaw, useLaunchParams } from '@telegram-apps/sdk-react';
import { useEffect, useState, useCallback } from 'react';

export function useTelegramRawInitData():
  | {
      initData: string | undefined;
      isTMA: boolean;
      launchParams: any;
    }
  | undefined {
  if (isTMA()) {
    return {
      initData: initDataRaw(),
      launchParams: useLaunchParams(),
      isTMA: true,
    };
  } else {
    return undefined;
  }
}
export function useTelegramTheme() {
  const [isDark, setIsDark] = useState(false);
  const [themeParams, setThemeParams] = useState<any>(null);
  const rawInitData = useTelegramRawInitData();

  useEffect(() => {
    if (rawInitData?.isTMA && rawInitData.launchParams?.tgWebAppThemeParams) {
      const tgThemeParams = rawInitData.launchParams.tgWebAppThemeParams;

      setThemeParams(tgThemeParams);

      // Determine if theme is dark based on background color
      // Telegram dark themes typically have darker background colors
      const bgColor = tgThemeParams.bg_color;
      const isDarkTheme =
        bgColor && parseInt(bgColor.replace('#', ''), 16) < 0x808080;
      setIsDark(isDarkTheme);

      // Apply theme to document
      document.documentElement.classList.toggle('dark', isDarkTheme);

      // Apply all Telegram theme colors as CSS custom properties
      const themeProperties = [
        'bg_color',
        'text_color',
        'hint_color',
        'link_color',
        'button_color',
        'button_text_color',
        'secondary_bg_color',
        'accent_text_color',
        'destructive_text_color',
        'header_bg_color',
        'section_bg_color',
        'section_header_text_color',
        'section_separator_color',
        'subtitle_text_color',
        'bottom_bar_bg_color',
      ];

      themeProperties.forEach(prop => {
        if (tgThemeParams[prop]) {
          document.documentElement.style.setProperty(
            `--tg-${prop.replace(/_/g, '-')}`,
            tgThemeParams[prop]
          );
        }
      });
    } else {
      // When not in Telegram, check for system preference or localStorage
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;

      // Use saved theme, fallback to system preference, then default to light
      const shouldUseDark =
        savedTheme === 'dark' || (savedTheme === null && systemPrefersDark);
      setIsDark(shouldUseDark);

      // Apply theme to document
      document.documentElement.classList.toggle('dark', shouldUseDark);
    }
  }, [rawInitData]);

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    // Save to localStorage
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');

    // Apply to document
    document.documentElement.classList.toggle('dark', newIsDark);
  }, [isDark]);

  return {
    isDark,
    themeParams,
    isTelegram: isTMA(),
    toggleTheme,
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
      accentTextColor: '#2481cc',
      destructiveTextColor: '#ff453a',
      headerBgColor: '#ffffff',
      sectionBgColor: '#ffffff',
      sectionHeaderTextColor: '#000000',
      sectionSeparatorColor: '#e5e5e5',
      subtitleTextColor: '#666666',
      bottomBarBgColor: '#f8f8f8',
    };
  }

  return {
    bgColor: themeParams.bg_color || '#ffffff',
    textColor: themeParams.text_color || '#000000',
    hintColor: themeParams.hint_color || '#999999',
    linkColor: themeParams.link_color || '#2481cc',
    buttonColor: themeParams.button_color || '#2481cc',
    buttonTextColor: themeParams.button_text_color || '#ffffff',
    secondaryBgColor: themeParams.secondary_bg_color || '#f1f1f1',
    accentTextColor: themeParams.accent_text_color || '#2481cc',
    destructiveTextColor: themeParams.destructive_text_color || '#ff453a',
    headerBgColor: themeParams.header_bg_color || '#ffffff',
    sectionBgColor: themeParams.section_bg_color || '#ffffff',
    sectionHeaderTextColor: themeParams.section_header_text_color || '#000000',
    sectionSeparatorColor: themeParams.section_separator_color || '#e5e5e5',
    subtitleTextColor: themeParams.subtitle_text_color || '#666666',
    bottomBarBgColor: themeParams.bottom_bar_bg_color || '#f8f8f8',
  };
}
