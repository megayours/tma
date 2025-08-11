import { useTheme } from '../auth/ThemeProvider';
import { useTelegramColors } from '../auth/useTelegram';

export function ThemeUsageExamples() {
  const { isDark, isTelegram } = useTheme();
  const colors = useTelegramColors();

  return (
    <div className="space-y-6 p-4">
      <div className="tg-bg tg-text rounded-lg p-4">
        <h2 className="mb-4 text-xl font-semibold">Theme Usage Examples</h2>

        {/* Method 1: Using CSS Classes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Method 1: CSS Classes</h3>
          <div className="space-y-2">
            <div className="tg-bg rounded p-3">
              <p className="tg-text">Background and text using CSS classes</p>
            </div>
            <div className="tg-secondary-bg rounded p-3">
              <p className="tg-text">Secondary background</p>
            </div>
            <button className="tg-button rounded px-4 py-2">
              Button with Telegram styling
            </button>
            <a href="#" className="tg-link underline">
              Link with Telegram styling
            </a>
            <p className="tg-hint">Hint text with Telegram styling</p>
          </div>
        </div>

        {/* Method 2: Using Inline Styles with Hook */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Method 2: Inline Styles</h3>
          <div className="space-y-2">
            <div
              className="rounded p-3"
              style={{
                backgroundColor: colors.bgColor,
                color: colors.textColor,
              }}
            >
              <p>Background and text using inline styles</p>
            </div>
            <div
              className="rounded p-3"
              style={{
                backgroundColor: colors.secondaryBgColor,
                color: colors.textColor,
              }}
            >
              <p>Secondary background using inline styles</p>
            </div>
            <button
              className="rounded px-4 py-2"
              style={{
                backgroundColor: colors.buttonColor,
                color: colors.buttonTextColor,
              }}
            >
              Button with inline styles
            </button>
            <a
              href="#"
              className="underline"
              style={{ color: colors.linkColor }}
            >
              Link with inline styles
            </a>
            <p style={{ color: colors.hintColor }}>
              Hint text with inline styles
            </p>
          </div>
        </div>

        {/* Method 3: Conditional Styling */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Method 3: Conditional Styling</h3>
          <div className="space-y-2">
            <div
              className={`rounded p-3 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
            >
              <p>Conditional styling based on dark mode</p>
            </div>
            <div
              className={`rounded p-3 ${isTelegram ? 'tg-secondary-bg' : 'bg-gray-100'}`}
            >
              <p>Conditional styling based on Telegram environment</p>
            </div>
          </div>
        </div>

        {/* Method 4: Tailwind with Telegram Classes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Method 4: Tailwind + Telegram Classes
          </h3>
          <div className="space-y-2">
            <div className="tg-bg rounded border border-gray-200 p-3 dark:border-gray-700">
              <p className="tg-text">Combining Tailwind and Telegram classes</p>
            </div>
            <button className="tg-button rounded px-4 py-2 transition-opacity hover:opacity-90">
              Button with hover effects
            </button>
          </div>
        </div>

        {/* Theme Information */}
        <div className="tg-secondary-bg mt-6 rounded p-4">
          <h3 className="mb-2 text-lg font-medium">Current Theme Info</h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Is Telegram:</strong> {isTelegram ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Is Dark Mode:</strong> {isDark ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Background Color:</strong> {colors.bgColor}
            </p>
            <p>
              <strong>Text Color:</strong> {colors.textColor}
            </p>
            <p>
              <strong>Link Color:</strong> {colors.linkColor}
            </p>
            <p>
              <strong>Button Color:</strong> {colors.buttonColor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
