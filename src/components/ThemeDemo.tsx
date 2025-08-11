import { useTheme } from '../auth/ThemeProvider';

export function ThemeDemo() {
  const { isDark, themeParams, isTelegram } = useTheme();

  return (
    <div className="space-y-4 p-4">
      <div className="tg-bg tg-text rounded-lg p-4">
        <h2 className="mb-2 text-xl font-semibold">Telegram Theme Demo</h2>

        <div className="space-y-2">
          <p>
            <strong>Is Telegram:</strong> {isTelegram ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Is Dark Mode:</strong> {isDark ? 'Yes' : 'No'}
          </p>

          {themeParams && (
            <div className="tg-secondary-bg rounded p-3">
              <h3 className="mb-2 font-medium">Theme Parameters:</h3>
              <pre className="overflow-auto text-sm">
                {JSON.stringify(themeParams, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <button className="tg-button rounded px-4 py-2">
            Telegram Button Style
          </button>

          <a href="#" className="tg-link underline">
            Telegram Link Style
          </a>

          <p className="tg-hint">
            This is hint text using Telegram's hint color
          </p>
        </div>
      </div>
    </div>
  );
}
