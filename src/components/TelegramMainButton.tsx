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
  const disabledRef = useRef(disabled);
  const loadingRef = useRef(loading);

  // Update refs when props change
  useEffect(() => {
    disabledRef.current = disabled;
    loadingRef.current = loading;
  }, [disabled, loading]);

  // Render a normal button when not in Telegram
  if (!isTelegram) {
    return visible ? (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <button
          onClick={onClick}
          disabled={disabled || loading}
          className="bg-tg-button text-tg-button-text w-full rounded-lg px-6 py-3 text-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          <span className="flex items-center justify-center gap-2">
            {loading && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            )}
            {loading ? 'Processing...' : text}
          </span>
        </button>
      </div>
    ) : null;
  }

  // Mount main button and set up click handler
  useEffect(() => {
    if (!isTelegram) return;

    // Mount the main button
    if (mainButton.mount.isAvailable()) {
      try {
        mainButton.mount();
      } catch (error) {
        console.error('TelegramMainButton: Error mounting main button:', error);
        return;
      }
    }

    // Set up click handler
    if (mainButton.onClick.isAvailable()) {
      clickHandlerRef.current = onClick;
      const offClick = mainButton.onClick(() => {
        if (
          clickHandlerRef.current &&
          !disabledRef.current &&
          !loadingRef.current
        ) {
          clickHandlerRef.current();
        }
      });

      // Cleanup function
      return () => {
        offClick();
        if (mainButton.setParams && mainButton.setParams.isAvailable()) {
          try {
            mainButton.setParams({ isVisible: false });
          } catch (error) {
            console.error(
              'TelegramMainButton: Error hiding main button:',
              error
            );
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
        isLoaderVisible: loading,
        isProgressVisible: loading,
        isVisible: visible && !disabled,
        hasShineEffect,
      };

      if (backgroundColor) {
        params.backgroundColor = backgroundColor;
      }

      if (textColor) {
        params.textColor = textColor;
      }

      mainButton.setParams(params);
    } catch (error) {
      console.error('TelegramMainButton: Error updating params:', error);
    }
  }, [
    isTelegram,
    text,
    disabled,
    loading,
    visible,
    backgroundColor,
    textColor,
    hasShineEffect,
  ]);

  // Dedicated cleanup useEffect to ensure button is hidden on component unmount
  useEffect(() => {
    return () => {
      // Always try to hide the button when component unmounts
      if (
        isTelegram &&
        mainButton.setParams &&
        mainButton.setParams.isAvailable()
      ) {
        try {
          mainButton.setParams({ isVisible: false });
        } catch (error) {
          console.error('TelegramMainButton: Error during cleanup:', error);
        }
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Component renders nothing (main button is handled by Telegram)
  return null;
};
