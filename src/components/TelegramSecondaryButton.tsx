import { useEffect, useRef } from 'react';
import { secondaryButton } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';

interface TelegramSecondaryButtonProps {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
  hasShineEffect?: boolean;
  position?: 'left' | 'top';
}

export const TelegramSecondaryButton: React.FC<TelegramSecondaryButtonProps> = ({
  text,
  disabled = false,
  loading = false,
  visible = true,
  onClick,
  backgroundColor,
  textColor,
  hasShineEffect = false,
  position = 'left',
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
      <div className="fixed bottom-20 left-0 right-0 z-50 p-4">
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

  // Mount secondary button and set up click handler
  useEffect(() => {
    if (!isTelegram) return;

    // Check if secondary button is supported
    if (!secondaryButton.isSupported()) {
      console.warn('TelegramSecondaryButton: Secondary button is not supported');
      return;
    }

    // Mount the secondary button
    if (secondaryButton.mount.isAvailable()) {
      try {
        secondaryButton.mount();
      } catch (error) {
        console.error('TelegramSecondaryButton: Error mounting secondary button:', error);
        return;
      }
    }

    // Set up click handler
    if (secondaryButton.onClick.isAvailable()) {
      clickHandlerRef.current = onClick;
      const offClick = secondaryButton.onClick(() => {
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
        if (secondaryButton.setParams && secondaryButton.setParams.isAvailable()) {
          try {
            secondaryButton.setParams({ isVisible: false });
          } catch (error) {
            console.error(
              'TelegramSecondaryButton: Error hiding secondary button:',
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

  // Update secondary button parameters when props change
  useEffect(() => {
    if (!isTelegram || !secondaryButton.setParams.isAvailable()) return;

    try {
      const params: any = {
        text: loading ? 'Processing...' : text,
        isEnabled: !disabled && !loading,
        isLoaderVisible: loading,
        isVisible: visible && !disabled,
        hasShineEffect,
        position,
      };

      if (backgroundColor) {
        params.backgroundColor = backgroundColor;
      }

      if (textColor) {
        params.textColor = textColor;
      }

      secondaryButton.setParams(params);
    } catch (error) {
      console.error('TelegramSecondaryButton: Error updating params:', error);
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
    position,
  ]);

  // Dedicated cleanup useEffect to ensure button is hidden on component unmount
  useEffect(() => {
    return () => {
      // Always try to hide the button when component unmounts
      if (
        isTelegram &&
        secondaryButton.setParams &&
        secondaryButton.setParams.isAvailable()
      ) {
        try {
          secondaryButton.setParams({ isVisible: false });
        } catch (error) {
          console.error('TelegramSecondaryButton: Error during cleanup:', error);
        }
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Component renders nothing (secondary button is handled by Telegram)
  return null;
};
