# Toast System

A comprehensive toast notification system for the Telegram Mini App, built with React and TypeScript.

## Features

- 🎨 **Telegram-themed styling** - Matches your app's design system
- 🚀 **Smooth animations** - Entrance and exit animations
- ⏰ **Auto-dismiss** - Configurable duration with manual override
- 🎯 **Action buttons** - Optional action buttons for interactive toasts
- 📱 **Mobile-optimized** - Perfect for Telegram Mini Apps
- 🔧 **TypeScript support** - Full type safety
- 🎭 **Multiple types** - Success, error, warning, and info toasts

## Usage

### Basic Usage

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast({
      type: 'success',
      title: 'Success!',
      message: 'Your action was completed successfully.',
    });
  };

  return <button onClick={handleSuccess}>Show Success Toast</button>;
}
```

### Toast Types

```tsx
// Success toast
addToast({
  type: 'success',
  title: 'Success!',
  message: 'Operation completed successfully.',
});

// Error toast
addToast({
  type: 'error',
  title: 'Error!',
  message: 'Something went wrong.',
});

// Warning toast
addToast({
  type: 'warning',
  title: 'Warning!',
  message: 'Please check your input.',
});

// Info toast
addToast({
  type: 'info',
  title: 'Information',
  message: 'Here is some useful information.',
});
```

### Advanced Usage

```tsx
// Toast with custom duration
addToast({
  type: 'info',
  title: 'Custom Duration',
  message: 'This toast will disappear in 10 seconds.',
  duration: 10000, // 10 seconds
});

// Toast with action button
addToast({
  type: 'info',
  title: 'Action Required',
  message: 'Would you like to perform an action?',
  duration: 0, // Don't auto-dismiss
  action: {
    label: 'Perform Action',
    onClick: () => {
      console.log('Action performed!');
    },
  },
});

// Toast without title
addToast({
  type: 'success',
  message: 'Simple success message without title.',
});
```

### Toast Management

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { addToast, removeToast, clearAllToasts, toasts } = useToast();

  const handleRemoveSpecificToast = (toastId: string) => {
    removeToast(toastId);
  };

  const handleClearAll = () => {
    clearAllToasts();
  };

  return (
    <div>
      <p>Active toasts: {toasts.length}</p>
      <button onClick={handleClearAll}>Clear All Toasts</button>
    </div>
  );
}
```

## API Reference

### `useToast()` Hook

Returns an object with the following properties:

- `addToast(toast: Omit<Toast, 'id'>): string` - Adds a new toast and returns its ID
- `removeToast(id: string): void` - Removes a toast by ID
- `clearAllToasts(): void` - Removes all toasts
- `toasts: Toast[]` - Array of current toasts

### Toast Object

```tsx
interface Toast {
  id: string; // Auto-generated unique ID
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string; // Optional title
  message: string; // Required message
  duration?: number; // Auto-dismiss duration in ms (default: 5000)
  action?: {
    // Optional action button
    label: string;
    onClick: () => void;
  };
}
```

## Styling

The toast system uses Telegram-themed CSS classes:

- `bg-tg-bg` - Background color
- `text-tg-text` - Text color
- `text-tg-hint` - Secondary text color
- `border-tg-hint` - Border color

Toasts are positioned in the top-right corner with a fixed z-index of 50.

## Integration

The toast system is already integrated into your app's root route (`__root.tsx`) via the `ToastProvider`. You can use the `useToast` hook anywhere in your component tree.

## Examples

See `ToastExample.tsx` for comprehensive usage examples.
