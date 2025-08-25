import {
  Button as TelegramButton,
  type ButtonProps,
} from '@telegram-apps/telegram-ui';
import { forwardRef } from 'react';

interface CustomButtonProps extends ButtonProps {
  variant?: 'filled-white' | 'default';
}

export const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = 'default', mode, ...props }, ref) => {
    const getButtonClasses = () => {
      if (variant === 'filled-white' && mode === 'filled') {
        return `${className || ''} !text-white`;
      }
      return className || '';
    };

    return (
      <TelegramButton
        ref={ref}
        className={getButtonClasses()}
        mode={mode}
        {...props}
      />
    );
  }
);

CustomButton.displayName = 'CustomButton';
