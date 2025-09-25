import { useEffect, useRef } from 'react';
import { mainButton } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';

interface TelegramMainButtonProps {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
  hasShineEffect?: boolean;
}

export const TelegramMainButton: React.FC<TelegramMainButtonProps> = ({
  text,
  disabled = false,
  loading = false,
  visible = true,
  onClick,
  backgroundColor,
  textColor,
  hasShineEffect = false,
}) => {
  const { isTelegram } = useTelegramTheme();
  const clickHandlerRef = useRef<(() => void) | null>(null);

  // Only render in Telegram environment
  if (!isTelegram) {
    return null;
  }

  // Mount main button and set up click handler
  useEffect(() => {
    if (!isTelegram) return;

    // Mount the main button
    if (mainButton.mount.isAvailable()) {
      try {
        mainButton.mount();
        console.log('TelegramMainButton: Main button mounted');
      } catch (error) {
        console.error('TelegramMainButton: Error mounting main button:', error);
        return;
      }
    }

    // Set up click handler
    if (mainButton.onClick.isAvailable()) {
      clickHandlerRef.current = onClick;
      const offClick = mainButton.onClick(() => {
        if (clickHandlerRef.current && !disabled && !loading) {
          clickHandlerRef.current();
        }
      });

      // Cleanup function
      return () => {
        offClick();
        if (mainButton.unmount) {
          try {
            mainButton.unmount();
            console.log('TelegramMainButton: Main button unmounted');
          } catch (error) {
            console.error('TelegramMainButton: Error unmounting main button:', error);
          }
        }
      };
    }
  }, [isTelegram]);

  // Update click handler reference when onClick changes
  useEffect(() => {
    clickHandlerRef.current = onClick;
  }, [onClick]);

  // Update main button parameters when props change
  useEffect(() => {
    if (!isTelegram || !mainButton.setParams.isAvailable()) return;

    try {
      const params: any = {
        text: loading ? 'Processing...' : text,
        isEnabled: !disabled && !loading,
        isVisible: visible,
        isLoaderVisible: loading,
        hasShineEffect,
      };

      if (backgroundColor) {
        params.backgroundColor = backgroundColor;
      }

      if (textColor) {
        params.textColor = textColor;
      }

      mainButton.setParams(params);
      console.log('TelegramMainButton: Updated params:', params);
    } catch (error) {
      console.error('TelegramMainButton: Error updating params:', error);
    }
  }, [isTelegram, text, disabled, loading, visible, backgroundColor, textColor, hasShineEffect]);

  // Component renders nothing (main button is handled by Telegram)
  return null;
};