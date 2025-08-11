# Telegram Mini App with UI Component Library

A comprehensive Telegram Mini App built with TanStack Router, featuring a complete UI component library that automatically inherits Telegram's theme and styling.

## Features

- 🎨 **Telegram Theme Inheritance** - Automatically adapts to Telegram's light/dark themes
- 🧩 **UI Component Library** - 15+ reusable components with TypeScript support
- 🚀 **Modern Stack** - Built with TanStack Router, React 19, and TypeScript
- 📱 **Mobile-First** - Optimized for Telegram Mini App environment
- 🎯 **Accessible** - All components include proper ARIA attributes

## UI Component Library

The project includes a comprehensive set of Telegram-themed UI components:

### Core Components

- **Button** - Multiple variants (primary, secondary, destructive, ghost, link)
- **Card** - Content containers with header, content, and footer sections
- **Input** - Form inputs with validation states and labels
- **Badge** - Status indicators and labels
- **Alert** - Notification messages (default, success, warning, error)
- **List** - Interactive lists with actions and subtitles
- **Modal** - Dialog overlays with backdrop

### Theme Integration

All components automatically inherit Telegram's theme colors through CSS variables:

- Background colors
- Text colors
- Button styles
- Section backgrounds
- Separators and borders

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open in Telegram:**
   - Use the development URL in your Telegram Mini App
   - Or open in browser for testing

## Using the UI Components

```typescript
import { Button, Card, Input, Badge } from '@/components/ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button size="lg" loading>Loading...</Button>

// Cards
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>

// Form inputs
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
/>
```

## Theme System

The app automatically detects and applies Telegram's theme:

- **Light/Dark Mode** - Automatically switches based on Telegram's theme
- **Color Inheritance** - Uses Telegram's native color palette
- **CSS Variables** - All theme colors available as CSS custom properties
- **Utility Classes** - Pre-built classes for common styling needs

### Available Theme Classes

- `tg-bg` - Background color
- `tg-text` - Text color
- `tg-hint` - Secondary text
- `tg-link` - Link styling
- `tg-button` - Button styling
- `tg-secondary-bg` - Secondary background
- And many more...

## Project Structure

```
src/
├── components/
│   ├── ui/                    # UI Component Library
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Alert.tsx
│   │   ├── List.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── TelegramThemeDemo.tsx  # Theme demonstration
│   ├── TelegramUIComponentsDemo.tsx  # Component showcase
│   └── ExampleApp.tsx         # Real-world example
├── auth/
│   ├── ThemeProvider.tsx      # Theme context
│   └── useTelegram.tsx        # Telegram theme hooks
├── routes/                    # TanStack Router routes
└── style.css                  # Global styles and theme variables
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Adding New Components

1. Create component in `src/components/ui/`
2. Add TypeScript interfaces
3. Use Telegram theme classes
4. Export from `src/components/ui/index.ts`
5. Add to documentation

## Documentation

- [Telegram Theme Implementation](./TELEGRAM_THEME_IMPLEMENTATION.md) - Detailed theme system documentation
- [UI Component Library](./TELEGRAM_UI_COMPONENTS.md) - Complete component reference

## Examples

The app includes several demonstration components:

- **TelegramThemeStatus** - Shows current theme information
- **TelegramThemeDemo** - Displays all available theme colors
- **TelegramUIComponentsDemo** - Showcases all UI components
- **ExampleApp** - Real-world user management example

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Include proper TypeScript definitions
4. Test with both light and dark themes
5. Ensure accessibility compliance

## License

MIT License - see LICENSE file for details
