import React from 'react';
import { cn } from '@/utils/cn';

export interface TgSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: string;
  footer?: string | React.ReactNode;
  children: React.ReactNode;
}

/**
 * TgSection component - A custom section component that works like Telegram UI's Section
 * but with styles that properly adapt to dark/light mode.
 *
 * This component replaces the @telegram-apps/telegram-ui Section component
 * with custom styling that uses CSS variables for proper theme adaptation.
 */
export function TgSection({
  header,
  footer,
  className,
  children,
  ...props
}: TgSectionProps) {
  return (
    <div className={cn('', className)} {...props}>
      {header && (
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-tg-section-header-text-color">
          {header}
        </h2>
      )}
      {children}
      {footer && (
        <p className="mt-2 text-sm text-tg-hint">
          {footer}
        </p>
      )}
    </div>
  );
}
