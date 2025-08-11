import { createContext, useContext, type ReactNode } from 'react';
import { useTelegramTheme } from './useTelegram';

interface ThemeContextType {
  isDark: boolean;
  themeParams: any;
  isTelegram: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTelegramTheme();

  console.log('theme', theme);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
