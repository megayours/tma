import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export interface SpinnerProps {
  /**
   * Variant of the spinner
   * - 'spinner': Rotating circular spinner icon
   * - 'dots': Three bouncing dots animation
   */
  variant?: 'spinner' | 'dots';

  /**
   * Size of the spinner
   * - 'sm': Small (16px icon / 1.5px dots)
   * - 'md': Medium (24px icon / 2px dots)
   * - 'lg': Large (32px icon / 3px dots)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Optional text to display next to the spinner
   */
  text?: string;

  /**
   * Whether to center the spinner in its container
   */
  centered?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A reusable loading spinner component for Telegram Web Apps
 *
 * Follows Telegram UI design best practices:
 * - Uses theme-aware colors (tg-hint, tg-text)
 * - Smooth animations
 * - Multiple variants and sizes
 *
 * @example
 * ```tsx
 * // Simple spinner
 * <Spinner />
 *
 * // With text
 * <Spinner text="Loading..." />
 *
 * // Dots variant
 * <Spinner variant="dots" text="Processing..." />
 *
 * // Large centered spinner
 * <Spinner size="lg" centered />
 * ```
 */
export function Spinner({
  variant = 'spinner',
  size = 'md',
  text,
  centered = false,
  className = '',
}: SpinnerProps) {
  const sizeClasses = {
    spinner: {
      sm: 'text-base', // 16px
      md: 'text-2xl',  // 24px
      lg: 'text-[2rem]', // 32px
    },
    dots: {
      sm: 'h-1.5 w-1.5', // 6px
      md: 'h-2 w-2',     // 8px
      lg: 'h-3 w-3',     // 12px
    },
    text: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  };

  const containerClasses = [
    'inline-flex items-center gap-2',
    centered && 'justify-center',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {variant === 'spinner' ? (
        <AiOutlineLoading3Quarters
          className={`text-tg-hint animate-spin ${sizeClasses.spinner[size]}`}
          aria-label="Loading"
        />
      ) : (
        <div className="flex items-center justify-center space-x-1" aria-label="Loading">
          <div
            className={`bg-tg-hint animate-bounce rounded-full ${sizeClasses.dots[size]} [animation-delay:-0.3s]`}
          />
          <div
            className={`bg-tg-hint animate-bounce rounded-full ${sizeClasses.dots[size]} [animation-delay:-0.15s]`}
          />
          <div
            className={`bg-tg-hint animate-bounce rounded-full ${sizeClasses.dots[size]}`}
          />
        </div>
      )}

      {text && (
        <span className={`text-tg-hint ${sizeClasses.text[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}

/**
 * A centered full-page loading spinner
 * Useful for page-level loading states
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <SpinnerFullPage text="Loading data..." />;
 * }
 * ```
 */
export function SpinnerFullPage({
  variant = 'spinner',
  size = 'lg',
  text,
}: Omit<SpinnerProps, 'centered' | 'className'>) {
  return (
    <div className="flex min-h-[200px] items-center justify-center p-8">
      <Spinner variant={variant} size={size} text={text} />
    </div>
  );
}
