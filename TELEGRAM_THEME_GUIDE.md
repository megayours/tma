# Telegram Theme Integration Guide

This guide explains how to use Telegram themes in your TanStack Router application.

## Overview

The Telegram theme system automatically detects and applies the user's Telegram theme (light/dark mode) and provides access to Telegram's theme colors throughout your application.

## How It Works

1. **Theme Detection**: The `useTelegramTheme` hook detects if the app is running in Telegram and retrieves theme parameters
2. **CSS Variables**: Theme colors are applied as CSS custom properties (variables) to the document root
3. **Dark Mode**: The `dark` class is automatically applied to the document when Telegram is in dark mode
4. **Fallbacks**: Default colors are provided when not running in Telegram

## Available Hooks

### `useTelegramTheme()`

Returns theme state information:

```typescript
{
  isDark: boolean; // Whether Telegram is in dark mode
  themeParams: any; // Raw Telegram theme parameters
  isTelegram: boolean; // Whether running in Telegram
}
```

### `useTelegramColors()`

Returns theme colors as hex strings:

```typescript
{
  bgColor: string; // Background color
  textColor: string; // Text color
  hintColor: string; // Hint/secondary text color
  linkColor: string; // Link color
  buttonColor: string; // Button background color
  buttonTextColor: string; // Button text color
  secondaryBgColor: string; // Secondary background color
}
```

## CSS Classes

The following CSS classes are available for easy styling:

- `.tg-bg` - Background color
- `.tg-secondary-bg` - Secondary background color
- `.tg-text` - Text color
- `.tg-hint` - Hint/secondary text color
- `.tg-link` - Link color
- `.tg-button` - Button styling (background + text color)

## Usage Examples

### Method 1: CSS Classes (Recommended)

```tsx
<div className="tg-bg tg-text rounded p-4">
  <h2>Title</h2>
  <p>Content with Telegram styling</p>
  <button className="tg-button rounded px-4 py-2">Telegram Button</button>
  <a href="#" className="tg-link underline">
    Telegram Link
  </a>
</div>
```

### Method 2: Inline Styles with Hook

```tsx
import { useTelegramColors } from './auth/useTelegram';

function MyComponent() {
  const colors = useTelegramColors();

  return (
    <div
      style={{
        backgroundColor: colors.bgColor,
        color: colors.textColor,
      }}
    >
      <button
        style={{
          backgroundColor: colors.buttonColor,
          color: colors.buttonTextColor,
        }}
      >
        Custom Button
      </button>
    </div>
  );
}
```

### Method 3: Conditional Styling

```tsx
import { useTheme } from './auth/ThemeProvider';

function MyComponent() {
  const { isDark, isTelegram } = useTheme();

  return (
    <div
      className={`p-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
    >
      <p>Conditional styling based on theme</p>
      {isTelegram && <p>Telegram-specific content</p>}
    </div>
  );
}
```

### Method 4: Combining with Tailwind

```tsx
<div className="tg-bg rounded border border-gray-200 p-4 dark:border-gray-700">
  <h2 className="tg-text text-xl font-semibold">Title</h2>
  <button className="tg-button rounded px-4 py-2 transition-opacity hover:opacity-90">
    Button with hover effects
  </button>
</div>
```

## Theme Provider Setup

The `ThemeProvider` is automatically set up in `main.tsx`:

```tsx
import { ThemeProvider } from './auth/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <AppRoot>
        <RouterProvider router={router} />
      </AppRoot>
    </ThemeProvider>
  );
}
```

## CSS Variables

The following CSS custom properties are automatically set:

```css
:root {
  --tg-bg-color: #ffffff;
  --tg-text-color: #000000;
  --tg-hint-color: #999999;
  --tg-link-color: #2481cc;
  --tg-button-color: #2481cc;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #f1f1f1;
}

.dark {
  --tg-bg-color: #212d3b;
  --tg-text-color: #ffffff;
  --tg-hint-color: #aaaaaa;
  --tg-link-color: #64baf0;
  --tg-button-color: #8774e1;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #2a3441;
}
```

## Best Practices

1. **Use CSS classes when possible** - They're more performant and easier to maintain
2. **Combine with Tailwind** - Use Telegram classes with Tailwind utilities for complex layouts
3. **Provide fallbacks** - Always have default styling for non-Telegram environments
4. **Test both themes** - Ensure your app looks good in both light and dark modes
5. **Use semantic colors** - Use `.tg-text` for text, `.tg-hint` for secondary text, etc.

## Troubleshooting

### Theme not updating

- Ensure the app is running in Telegram
- Check that `ThemeProvider` is wrapping your app
- Verify that `useTelegramTheme` is being called

### Colors not applying

- Check that CSS classes are being used correctly
- Verify that CSS variables are set in the document root
- Ensure no conflicting styles are overriding the theme

### Dark mode not working

- Check that the `dark` class is being applied to `document.documentElement`
- Verify that your CSS includes dark mode variants
- Ensure Tailwind dark mode is configured correctly

## Example Components

See `src/components/ThemeDemo.tsx` and `src/components/ThemeUsageExamples.tsx` for comprehensive examples of all usage methods.
