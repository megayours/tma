# Telegram Theme Inheritance Implementation

This document explains how Telegram theme inheritance has been implemented in your TanStack Router application using `launchParams` from the Telegram SDK.

## Overview

Your application now automatically inherits and applies Telegram's theme (light/dark mode) and colors when running as a Telegram Mini App. The theme system uses `launchParams.tgWebAppThemeParams` from the Telegram SDK to provide seamless integration with Telegram's native theming while maintaining fallback styles for non-Telegram environments.

## Key Components

### 1. Theme Provider (`src/auth/ThemeProvider.tsx`)

- Provides theme context throughout the application
- Wraps the entire app to ensure theme availability

### 2. Telegram Theme Hook (`src/auth/useTelegram.tsx`)

- Detects if running in Telegram environment
- Extracts theme parameters from `launchParams.tgWebAppThemeParams`
- Applies CSS custom properties to document root
- Uses `useTelegramRawInitData()` to access `launchParams`

### 3. CSS Variables (`src/style.css`)

- Defines Telegram theme colors as CSS custom properties
- Provides both light and dark mode variants
- Enables easy styling with CSS classes

## Available CSS Classes

| Class                    | Purpose                | Example Usage                                     |
| ------------------------ | ---------------------- | ------------------------------------------------- |
| `tg-bg`                  | Background color       | `<div className="tg-bg">`                         |
| `tg-text`                | Text color             | `<p className="tg-text">`                         |
| `tg-hint`                | Secondary/hint text    | `<span className="tg-hint">`                      |
| `tg-link`                | Link styling           | `<a className="tg-link">`                         |
| `tg-button`              | Button styling         | `<button className="tg-button">`                  |
| `tg-secondary-bg`        | Secondary background   | `<div className="tg-secondary-bg">`               |
| `tg-accent-text`         | Accent text color      | `<span className="tg-accent-text">`               |
| `tg-destructive-text`    | Destructive text color | `<span className="tg-destructive-text">`          |
| `tg-header-bg`           | Header background      | `<div className="tg-header-bg">`                  |
| `tg-section-bg`          | Section background     | `<div className="tg-section-bg">`                 |
| `tg-section-header-text` | Section header text    | `<h3 className="tg-section-header-text">`         |
| `tg-section-separator`   | Section separator      | `<div className="tg-section-separator border-t">` |
| `tg-subtitle-text`       | Subtitle text color    | `<p className="tg-subtitle-text">`                |
| `tg-bottom-bar-bg`       | Bottom bar background  | `<div className="tg-bottom-bar-bg">`              |

## Implementation Details

### Root Route (`src/routes/__root.tsx`)

- `TelegramAppHandler` now includes theme detection
- Applies Telegram theme classes to main layout
- Logs theme information for debugging

### Navigation (`src/NavBar.tsx`)

- Uses `tg-bg`, `tg-text`, and `tg-link` classes
- Applies Telegram styling to navigation links
- Includes hover effects and transitions

### Routes

- All routes now use Telegram theme classes
- Consistent theming across the application
- Fallback styles for non-Telegram environments

## Theme Detection

The system automatically detects:

- Whether the app is running in Telegram
- Current theme mode (light/dark) based on background color
- Telegram's theme colors from `launchParams.tgWebAppThemeParams`
- Applies appropriate CSS classes and variables

## Data Source

The theme system now uses `launchParams.tgWebAppThemeParams` from the Telegram SDK, which includes:

```typescript
{
  accent_text_color: "#007aff",
  bg_color: "#282828",
  bottom_bar_bg_color: "#3e464c",
  button_color: "#007aff",
  button_text_color: "#ffffff",
  destructive_text_color: "#ff453a",
  header_bg_color: "#1c1c1c",
  hint_color: "#ffffff",
  link_color: "#007aff",
  secondary_bg_color: "#1c1c1c",
  section_bg_color: "#282828",
  section_header_text_color: "#e5e5e5",
  section_separator_color: "#3d3d3d",
  subtitle_text_color: "#ffffff",
  text_color: "#ffffff"
}
```

## Usage Examples

### Basic Styling

```tsx
<div className="tg-bg tg-text rounded p-4">
  <h1>Title</h1>
  <p className="tg-hint">Secondary text</p>
  <button className="tg-button rounded px-4 py-2">Telegram Button</button>
</div>
```

### Conditional Styling

```tsx
import { useTheme } from '@/auth/ThemeProvider';

function MyComponent() {
  const { isTelegram, isDark } = useTheme();

  return (
    <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {isTelegram ? 'Telegram Theme Active' : 'Default Theme'}
    </div>
  );
}
```

### Inline Styles with Colors

```tsx
import { useTelegramColors } from '@/auth/useTelegram';

function MyComponent() {
  const colors = useTelegramColors();

  return (
    <div style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
      Custom styled content
    </div>
  );
}
```

### Advanced Theme Usage

```tsx
<div className="tg-section-bg rounded-lg p-4">
  <h3 className="tg-section-header-text font-semibold">Section Title</h3>
  <p className="tg-text">Main content</p>
  <p className="tg-subtitle-text text-sm">Subtitle content</p>
  <div className="tg-section-separator my-2 border-t"></div>
  <button className="tg-button rounded px-4 py-2">Action</button>
  <button className="tg-destructive-text rounded border border-current px-4 py-2">
    Delete
  </button>
</div>
```

## Testing

### In Telegram

1. Open the app in Telegram
2. Switch between light and dark themes in Telegram settings
3. Observe automatic theme changes
4. Check console for theme parameter logs from `launchParams`

### Outside Telegram

1. Open the app in a regular browser
2. Verify fallback styles are applied
3. Theme status component shows "Not Running in Telegram"

## Available Hooks

### `useTheme()`

Returns theme state information:

```typescript
{
  isDark: boolean;
  themeParams: any;
  isTelegram: boolean;
}
```

### `useTelegramColors()`

Returns theme colors as hex strings:

```typescript
{
  bgColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
  accentTextColor: string;
  destructiveTextColor: string;
  headerBgColor: string;
  sectionBgColor: string;
  sectionHeaderTextColor: string;
  sectionSeparatorColor: string;
  subtitleTextColor: string;
  bottomBarBgColor: string;
}
```

### `useTelegramRawInitData()`

Returns raw initialization data including `launchParams`:

```typescript
{
  initData: string | undefined;
  isTMA: boolean;
  launchParams: any; // Contains tgWebAppThemeParams
}
```

## CSS Custom Properties

The following CSS variables are automatically set from `launchParams.tgWebAppThemeParams`:

```css
:root {
  --tg-bg-color: #ffffff;
  --tg-text-color: #000000;
  --tg-hint-color: #999999;
  --tg-link-color: #2481cc;
  --tg-button-color: #2481cc;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #f1f1f1;
  --tg-accent-text-color: #2481cc;
  --tg-destructive-text-color: #ff453a;
  --tg-header-bg-color: #ffffff;
  --tg-section-bg-color: #ffffff;
  --tg-section-header-text-color: #000000;
  --tg-section-separator-color: #e5e5e5;
  --tg-subtitle-text-color: #666666;
  --tg-bottom-bar-bg-color: #f8f8f8;
}

.dark {
  --tg-bg-color: #212d3b;
  --tg-text-color: #ffffff;
  --tg-hint-color: #aaaaaa;
  --tg-link-color: #64baf0;
  --tg-button-color: #8774e1;
  --tg-button-text-color: #ffffff;
  --tg-secondary-bg-color: #2a3441;
  --tg-accent-text-color: #64baf0;
  --tg-destructive-text-color: #ff6b6b;
  --tg-header-bg-color: #1c1c1c;
  --tg-section-bg-color: #212d3b;
  --tg-section-header-text-color: #e5e5e5;
  --tg-section-separator-color: #3d3d3d;
  --tg-subtitle-text-color: #cccccc;
  --tg-bottom-bar-bg-color: #3e464c;
}
```

## Best Practices

1. **Use CSS classes when possible** - More performant and maintainable
2. **Combine with Tailwind** - Use Telegram classes with Tailwind utilities
3. **Provide fallbacks** - Always have default styling for non-Telegram environments
4. **Test both themes** - Ensure your app looks good in both light and dark modes
5. **Use semantic colors** - Use appropriate classes for their intended purpose
6. **Leverage launchParams** - Use the rich theme data available in `launchParams`

## Troubleshooting

### Theme not updating

- Check if app is running in Telegram
- Verify `ThemeProvider` is wrapping your app
- Check console for theme parameter logs from `launchParams`
- Ensure `useTelegramRawInitData()` is returning data

### Colors not applying

- Ensure CSS classes are used correctly
- Check that CSS variables are set in document root
- Verify no conflicting styles are overriding theme
- Check that `launchParams.tgWebAppThemeParams` contains theme data

### Dark mode not working

- Check that the `dark` class is applied to `document.documentElement`
- Verify that your CSS includes dark mode variants
- Ensure Tailwind dark mode is configured correctly
- Check that background color detection logic is working

## Demo Components

The application includes several demo components to showcase theme usage:

- `TelegramThemeStatus` - Shows current theme information and debugging data
- `TelegramThemeDemo` - Comprehensive demo of all available theme colors and usage examples
- `ThemeDemo` - Basic theme demonstration
- `ThemeUsageExamples` - Various usage patterns and examples
