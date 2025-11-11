import React from 'react';
import { cn } from '@/utils/cn';

export interface TgSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  header?: string;
  error?: string;
}

/**
 * TgSelect component - A custom select component that works like Telegram UI's Select
 * but with styles that properly adapt to dark/light mode.
 *
 * This component replaces the @telegram-apps/telegram-ui Select component
 * with custom styling that uses Tailwind classes for proper theme adaptation.
 */
export function TgSelect({
  className,
  header,
  error,
  children,
  ...props
}: TgSelectProps) {
  return (
    <div className="mb-4">
      <div className="relative">
        {header && (
          <label className="absolute -top-2 left-3 bg-tg-bg px-1 text-xs font-medium text-tg-hint">
            {header}
          </label>
        )}
        <select
          className={cn(
            'w-full appearance-none rounded-lg border border-tg-section-separator bg-tg-bg px-4 py-3 pr-10 text-base text-tg-text',
            'focus:border-tg-link focus:outline-none focus:ring-1 focus:ring-tg-link',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-tg-hint">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
