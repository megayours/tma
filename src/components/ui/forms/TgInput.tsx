import React from 'react';
import { cn } from '@/utils/cn';

export interface TgInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  header?: string;
  error?: string;
}

/**
 * TgInput component - A custom input component that works like Telegram UI's Input
 * but with styles that properly adapt to dark/light mode.
 *
 * This component replaces the @telegram-apps/telegram-ui Input component
 * with custom styling that uses Tailwind classes for proper theme adaptation.
 */
export const TgInput = React.forwardRef<HTMLInputElement, TgInputProps>(
  ({ className, type = 'text', header, error, ...props }, ref) => {
    return (
      <div className="mb-4">
        <div className="relative">
          {header && (
            <label className="absolute -top-2 left-3 bg-tg-bg px-1 text-xs font-medium text-tg-hint">
              {header}
            </label>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full rounded-lg border border-tg-section-separator bg-tg-bg px-4 py-3 text-base text-tg-text placeholder:text-tg-hint',
              'focus:border-tg-link focus:outline-none focus:ring-1 focus:ring-tg-link',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

TgInput.displayName = 'TgInput';
