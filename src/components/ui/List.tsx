import React from 'react';
import { cn } from '../../utils/cn';

export interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function List({ className, children, ...props }: ListProps) {
  return (
    <div
      className={cn('divide-y divide-current divide-opacity-10', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  clickable?: boolean;
}

export function ListItem({
  className,
  children,
  clickable = false,
  ...props
}: ListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        clickable &&
          'hover:tg-secondary-bg cursor-pointer transition-colors hover:bg-opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ListItemContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ListItemContent({
  className,
  children,
  ...props
}: ListItemContentProps) {
  return (
    <div className={cn('flex-1', className)} {...props}>
      {children}
    </div>
  );
}

export interface ListItemTitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function ListItemTitle({
  className,
  children,
  ...props
}: ListItemTitleProps) {
  return (
    <p className={cn('tg-text font-medium', className)} {...props}>
      {children}
    </p>
  );
}

export interface ListItemSubtitleProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function ListItemSubtitle({
  className,
  children,
  ...props
}: ListItemSubtitleProps) {
  return (
    <p className={cn('tg-subtitle-text text-sm', className)} {...props}>
      {children}
    </p>
  );
}

export interface ListItemActionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ListItemAction({
  className,
  children,
  ...props
}: ListItemActionProps) {
  return (
    <div className={cn('ml-4 flex items-center', className)} {...props}>
      {children}
    </div>
  );
}
