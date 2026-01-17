import { useEffect, useRef, useState } from 'react';
import { mainButton, secondaryButton } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';

interface ButtonConfig {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
  onClick: () => void;
  backgroundColor?: string;
  textColor?: string;
  hasShineEffect?: boolean;
}

interface TelegramDualButtonsProps {
  mainButton: ButtonConfig;
  secondaryButton?: ButtonConfig & { position?: 'left' | 'top' };
}

export const TelegramDualButtons: React.FC<TelegramDualButtonsProps> = ({
  mainButton: mainConfig,
  secondaryButton: secondaryConfig,
}) => {
  const { isTelegram } = useTelegramTheme();
  const [visibilityTick, setVisibilityTick] = useState(0);
  const mainClickHandlerRef = useRef<(() => void) | null>(null);
  const secondaryClickHandlerRef = useRef<(() => void) | null>(null);
  const mainDisabledRef = useRef(mainConfig.disabled);
  const mainLoadingRef = useRef(mainConfig.loading);
  const secondaryDisabledRef = useRef(secondaryConfig?.disabled);
  const secondaryLoadingRef = useRef(secondaryConfig?.loading);
  const retryTimersRef = useRef<number[]>([]);
  const log = (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log('[TelegramDualButtons]', ...args);
    }
  };

  // Update refs when props change
  // Telegram may drop secondary button handlers when app is backgrounded.
  // Re-trigger wiring on focus/visibility so the click handler is restored.
  useEffect(() => {
    mainDisabledRef.current = mainConfig.disabled;
    mainLoadingRef.current = mainConfig.loading;
    secondaryDisabledRef.current = secondaryConfig?.disabled;
    secondaryLoadingRef.current = secondaryConfig?.loading;
  }, [
    mainConfig.disabled,
    mainConfig.loading,
    secondaryConfig?.disabled,
    secondaryConfig?.loading,
  ]);

  useEffect(() => {
    const bump = () => setVisibilityTick(tick => tick + 1);
    document.addEventListener('visibilitychange', bump);
    window.addEventListener('focus', bump);
    return () => {
      document.removeEventListener('visibilitychange', bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  // Render normal buttons when not in Telegram
  if (!isTelegram) {
    return (
      <div className="bg-tg-secondary-bg fixed right-0 bottom-0 left-0 z-50">
        {secondaryConfig && secondaryConfig.visible && (
          <div className="px-4 pt-2">
            <button
              onClick={secondaryConfig.onClick}
              disabled={secondaryConfig.disabled || secondaryConfig.loading}
              className="text-tg-link w-full rounded-lg px-6 py-3 text-center font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                {secondaryConfig.loading && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
                )}
                {secondaryConfig.loading
                  ? 'Processing...'
                  : secondaryConfig.text}
              </span>
            </button>
          </div>
        )}
        {mainConfig.visible && (
          <div className="px-4 py-2">
            <button
              onClick={mainConfig.onClick}
              disabled={mainConfig.disabled || mainConfig.loading}
              className="bg-tg-button text-tg-button-text w-full rounded-lg px-6 py-3 text-center font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                {mainConfig.loading && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                )}
                {mainConfig.loading ? 'Processing...' : mainConfig.text}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Mount both buttons and set up click handlers
  useEffect(() => {
    if (!isTelegram) return;
    log('Mounting or reattaching buttons', {
      mainVisible: mainConfig.visible,
      secondaryVisible: secondaryConfig?.visible,
      visibilityTick,
    });

    const clearRetries = () => {
      retryTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
      retryTimersRef.current = [];
    };

    clearRetries();

    // Mount main button
    if (mainButton.mount.isAvailable()) {
      try {
        mainButton.mount();
        log('Mounted main button');
      } catch (error) {
        console.error(
          'TelegramDualButtons: Error mounting main button:',
          error
        );
      }
    }

    // Mount secondary button (only if provided)
    if (
      secondaryConfig &&
      secondaryButton.isSupported() &&
      secondaryButton.mount.isAvailable()
    ) {
      try {
        secondaryButton.mount();
        log('Mounted secondary button');
      } catch (error) {
        console.error(
          'TelegramDualButtons: Error mounting secondary button:',
          error
        );
      }
    }

    // Set up main button click handler
    let offMainClick: (() => void) | undefined;
    const attachMainClick = (attempt = 0) => {
      if (!mainButton.onClick.isAvailable()) {
        if (attempt < 3) {
          log('Main button onClick unavailable, retrying', { attempt });
          const timerId = window.setTimeout(
            () => attachMainClick(attempt + 1),
            50
          );
          retryTimersRef.current.push(timerId);
        }
        return;
      }

      mainClickHandlerRef.current = mainConfig.onClick;
      offMainClick = mainButton.onClick(() => {
        if (
          mainClickHandlerRef.current &&
          !mainDisabledRef.current &&
          !mainLoadingRef.current
        ) {
          log('Main button click');
          mainClickHandlerRef.current();
        }
      });
    };

    attachMainClick();

    // Set up secondary button click handler (only if provided)
    let offSecondaryClick: (() => void) | undefined;
    const attachSecondaryClick = (attempt = 0) => {
      if (!secondaryConfig) return;

      if (!secondaryButton.onClick.isAvailable()) {
        if (attempt < 3) {
          log('Secondary button onClick unavailable, retrying', { attempt });
          const timerId = window.setTimeout(
            () => attachSecondaryClick(attempt + 1),
            50
          );
          retryTimersRef.current.push(timerId);
        }
        return;
      }

      secondaryClickHandlerRef.current = secondaryConfig.onClick;
      offSecondaryClick = secondaryButton.onClick(() => {
        if (
          secondaryClickHandlerRef.current &&
          !secondaryDisabledRef.current &&
          !secondaryLoadingRef.current
        ) {
          log('Secondary button click');
          secondaryClickHandlerRef.current();
        }
      });
    };

    attachSecondaryClick();

    // Cleanup function - only remove click handlers
    return () => {
      log('Detaching button click handlers');
      clearRetries();
      offMainClick?.();
      offSecondaryClick?.();
    };
  }, [
    isTelegram,
    mainConfig.visible,
    secondaryConfig?.visible,
    visibilityTick,
  ]);

  // Update click handler references when onClick changes
  useEffect(() => {
    mainClickHandlerRef.current = mainConfig.onClick;
    secondaryClickHandlerRef.current = secondaryConfig?.onClick ?? null;
  }, [mainConfig.onClick, secondaryConfig?.onClick]);

  // Update main button parameters when props change
  useEffect(() => {
    if (!isTelegram || !mainButton.setParams.isAvailable()) return;

    try {
      const params: any = {
        text: mainConfig.loading ? 'Processing...' : mainConfig.text,
        isEnabled: !mainConfig.disabled && !mainConfig.loading,
        isLoaderVisible: mainConfig.loading,
        isVisible: mainConfig.visible,
        hasShineEffect: mainConfig.hasShineEffect || false,
      };

      if (mainConfig.backgroundColor) {
        params.backgroundColor = mainConfig.backgroundColor;
      }

      if (mainConfig.textColor) {
        params.textColor = mainConfig.textColor;
      }

      mainButton.setParams(params);
    } catch (error) {
      console.error(
        'TelegramDualButtons: Error updating main button params:',
        error
      );
    }
  }, [
    isTelegram,
    mainConfig.text,
    mainConfig.disabled,
    mainConfig.loading,
    mainConfig.visible,
    mainConfig.backgroundColor,
    mainConfig.textColor,
    mainConfig.hasShineEffect,
  ]);

  // Update secondary button parameters when props change (only if provided)
  useEffect(() => {
    if (!isTelegram || !secondaryButton.setParams.isAvailable()) return;

    if (!secondaryConfig) {
      try {
        secondaryButton.setParams({ isVisible: false });
      } catch (error) {
        console.error(
          'TelegramDualButtons: Error hiding secondary button:',
          error
        );
      }
      return;
    }

    try {
      const params: any = {
        text: secondaryConfig.loading ? 'Processing...' : secondaryConfig.text,
        isEnabled: !secondaryConfig.disabled && !secondaryConfig.loading,
        isLoaderVisible: secondaryConfig.loading,
        isVisible: secondaryConfig.visible,
        hasShineEffect: secondaryConfig.hasShineEffect || false,
        position: secondaryConfig.position || 'left',
      };

      if (secondaryConfig.backgroundColor) {
        params.backgroundColor = secondaryConfig.backgroundColor;
      }

      if (secondaryConfig.textColor) {
        params.textColor = secondaryConfig.textColor;
      }

      secondaryButton.setParams(params);
    } catch (error) {
      console.error(
        'TelegramDualButtons: Error updating secondary button params:',
        error
      );
    }
  }, [
    isTelegram,
    secondaryConfig,
    secondaryConfig?.text,
    secondaryConfig?.disabled,
    secondaryConfig?.loading,
    secondaryConfig?.visible,
    secondaryConfig?.backgroundColor,
    secondaryConfig?.textColor,
    secondaryConfig?.hasShineEffect,
    secondaryConfig?.position,
  ]);

  // Dedicated cleanup effect - only runs on component unmount
  useEffect(() => {
    return () => {
      // Always try to hide both buttons when component unmounts
      if (!isTelegram) return;

      // Hide both buttons immediately as a unit
      try {
        if (mainButton.setParams?.isAvailable()) {
          mainButton.setParams({ isVisible: false });
        }
      } catch (error) {
        console.error(
          'TelegramDualButtons: Error hiding main button during cleanup:',
          error
        );
      }

      try {
        if (secondaryButton.setParams?.isAvailable()) {
          secondaryButton.setParams({ isVisible: false });
        }
      } catch (error) {
        console.error(
          'TelegramDualButtons: Error hiding secondary button during cleanup:',
          error
        );
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Component renders nothing (buttons are handled by Telegram)
  return null;
};
