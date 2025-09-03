import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '../../utils/cn';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export type CriticalButtonState = 'normal' | 'loading' | 'success';

export type CriticalButtonContent = {
  text: string;
  emoji?: string;
  image?: string;
  gif?: string;
};

export interface CriticalButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  state: CriticalButtonState;
  normalContent: CriticalButtonContent;
  loadingContent: CriticalButtonContent;
  successContent?: CriticalButtonContent;

  redirectUrl?: string;
  redirectDelay?: number; // milliseconds to wait before redirect after success
  variant?: 'primary' | 'secondary' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
  onStateChange?: (state: CriticalButtonState) => void;
}

export function CriticalButton({
  state,
  normalContent,
  loadingContent,
  successContent,
  redirectUrl,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  onStateChange,
  onClick,
  ...props
}: CriticalButtonProps) {
  const navigate = useNavigate();

  // Call onStateChange when state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const getCurrentContent = (): CriticalButtonContent => {
    switch (state) {
      case 'loading':
        return loadingContent;
      case 'success':
        return successContent || normalContent;
      default:
        return normalContent;
    }
  };

  const baseClasses =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-500 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-tg-button text-tg-button-text hover:opacity-90',
    secondary:
      'bg-tg-secondary-bg text-tg-secondary-bg-text border border-current hover:bg-opacity-80',
    destructive:
      'bg-tg-destructive-text text-tg-button-text border border-current hover:bg-opacity-10',
    success: 'bg-green-500 text-white hover:bg-green-600',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1',
    md: 'h-10 px-4 py-2 gap-2',
    lg: 'h-12 px-8 text-lg gap-2',
  };

  const stateClasses = {
    normal: '',
    loading: 'cursor-wait opacity-80',
    success: 'shadow-lg',
  };

  const currentContent = getCurrentContent();
  const isDisabled = disabled || state === 'loading' || state === 'success';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (state === 'normal' && onClick) {
      onClick(e);
    }
  };

  const renderContent = () => {
    const { text, emoji, image, gif } = currentContent;

    return (
      <span className="flex items-center justify-center gap-2">
        {/* Render visual content */}
        {state === 'loading' && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}

        {emoji && state !== 'loading' && (
          <span
            className={cn('text-lg', state === 'success' && 'animate-bounce')}
          >
            {emoji}
          </span>
        )}

        {(image || gif) && state !== 'loading' && (
          <img
            src={image || gif}
            alt=""
            className={cn(
              'h-5 w-5 object-contain',
              state === 'success' && 'animate-pulse'
            )}
          />
        )}

        {/* Text content */}
        <span
          className={cn(
            'font-semibold',
            state === 'loading' && 'animate-pulse',
            state === 'success' && 'font-bold'
          )}
        >
          {text}
        </span>
      </span>
    );
  };

  // Determine variant based on state
  const effectiveVariant = state === 'success' ? 'success' : variant;

  return (
    <div className="relative">
      {state === 'success' && (
        <DotLottieReact
          className="pointer-events-none fixed bottom-0 left-1/2 z-50 h-2/3 w-[150vw] -translate-x-1/2"
          dotLottieRefCallback={dotLottie => {
            if (dotLottie) {
              dotLottie.addEventListener('complete', () => {
                console.log('Animation completed!');
                console.log('Redirect URL:', redirectUrl);
                // redirect to url using tanstack router
                if (redirectUrl) {
                  console.log('Navigating to:', redirectUrl);
                  navigate({ to: redirectUrl });
                }
              });
            }
          }}
          src="/lotties/confetti.lottie"
          loop={false}
          autoplay
        />
      )}

      <button
        className={cn(
          baseClasses,
          variants[effectiveVariant],
          sizes[size],
          stateClasses[state],
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {renderContent()}
      </button>
    </div>
  );
}

// Helper function to create content objects
export const createButtonContent = (
  text: string,
  options?: {
    emoji?: string;
    image?: string;
    gif?: string;
  }
): CriticalButtonContent => ({
  text,
  ...options,
});
