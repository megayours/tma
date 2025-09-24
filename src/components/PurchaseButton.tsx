import { useEffect, useCallback } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { mainButton, hapticFeedback } from '@telegram-apps/sdk-react';
import { useTelegramTheme } from '@/auth/useTelegram';
import { requestFullscreen } from '@/utils/fullscreen';

interface PurchaseButtonProps {
  text: string;
  price?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
  mode?: 'filled' | 'outline' | 'plain';
  size?: 's' | 'm' | 'l';
}

export const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  text,
  price,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  mode = 'filled',
  size = 'l',
}) => {
  const { isTelegram } = useTelegramTheme();

  // Create the full button text
  const buttonText = loading
    ? 'Processing...'
    : `${text}${price ? ' ' + price : ''}`;

  // Handle click for Telegram main button
  const handleMainButtonClick = useCallback(() => {
    if (!disabled && !loading) {
      // Add haptic feedback on button press
      if (isTelegram) {
        try {
          if (hapticFeedback && hapticFeedback.impactOccurred) {
            hapticFeedback.impactOccurred('medium');
          }
        } catch (error) {
          console.warn('PurchaseButton: Haptic feedback not available:', error);
        }

        // Request fullscreen for immersive purchase experience
        requestFullscreen();
      }
      onClick();
    }
  }, [onClick, disabled, loading, isTelegram]);

  useEffect(() => {
    if (isTelegram) {
      console.log('PurchaseButton: Telegram environment detected');
      console.log('PurchaseButton: mainButton API:', mainButton);

      // TODO: Implement proper mainButton API once we understand the correct usage
      // For now, we'll fall back to regular buttons even in Telegram
      // The mainButton API seems to be different than expected

      try {
        // Check if main button is available
        if (mainButton && mainButton.mount && mainButton.mount.isAvailable()) {
          console.log('PurchaseButton: Main button is available, but API structure needs investigation');
          // We'll implement this once we have the correct API understanding
        }
      } catch (error) {
        console.error('PurchaseButton: Error checking main button availability:', error);
      }
    }
  }, [isTelegram, buttonText, disabled, loading, handleMainButtonClick]);

  // Update main button when props change (placeholder for now)
  useEffect(() => {
    if (isTelegram) {
      console.log('PurchaseButton: Would update main button with:', buttonText);
      // TODO: Implement main button updates once API is understood
    }
  }, [isTelegram, buttonText, disabled, loading]);

  // Handle click with haptic feedback and fullscreen
  const handleClick = useCallback(() => {
    if (!disabled && !loading) {
      // Add haptic feedback on button press (for both Telegram and non-Telegram)
      if (isTelegram) {
        try {
          if (hapticFeedback && hapticFeedback.impactOccurred) {
            hapticFeedback.impactOccurred('medium');
          }
        } catch (error) {
          console.warn('PurchaseButton: Haptic feedback not available:', error);
        }

        // Request fullscreen for immersive purchase experience
        requestFullscreen();
      }
      onClick();
    }
  }, [onClick, disabled, loading, isTelegram]);

  // For non-Telegram environments or as fallback, render regular button
  if (!isTelegram) {
    return (
      <Button
        mode={mode}
        size={size}
        onClick={handleClick}
        disabled={disabled || loading}
        className={className}
      >
        <div className="flex w-full items-center justify-between">
          <span className="mr-2">{text}</span>
          {!loading && price && (
            <span className="font-bold">{price}</span>
          )}
          {loading && <span>Processing...</span>}
        </div>
      </Button>
    );
  }

  // In Telegram, we would use the main button, but for now falling back to regular button
  // TODO: Implement proper mainButton API
  return (
    <div className="space-y-2">
      <Button
        mode={mode}
        size={size}
        onClick={handleClick}
        disabled={disabled || loading}
        className={className}
      >
        <div className="flex w-full items-center justify-between">
          <span className="mr-2">{text}</span>
          {!loading && price && (
            <span className="font-bold">{price}</span>
          )}
          {loading && <span>Processing...</span>}
        </div>
      </Button>
      <div className="text-center text-xs text-tg-hint">
        Note: Will use Telegram main button once API is properly implemented
      </div>
    </div>
  );
};