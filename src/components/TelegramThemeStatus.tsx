import { useTheme } from '../auth/ThemeProvider';
import { useTelegramColors } from '../auth/useTelegram';
import { useTelegramRawInitData } from '../auth/useTelegram';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from './ui';

export function TelegramThemeStatus() {
  const { isDark, themeParams, isTelegram } = useTheme();
  const colors = useTelegramColors();
  const rawInitData = useTelegramRawInitData();

  if (!isTelegram) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Not Running in Telegram</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This app is designed to inherit themes from Telegram. Open it in
              Telegram to see the theme inheritance in action.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Telegram Theme Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="tg-hint">Environment:</span>
            <Badge variant="success">Telegram Mini App</Badge>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Theme Mode:</span>
            <Badge variant={isDark ? 'secondary' : 'outline'}>
              {isDark ? 'Dark' : 'Light'}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Background:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: colors.bgColor }}
              />
              <span className="font-mono text-xs">{colors.bgColor}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Text Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: colors.textColor }}
              />
              <span className="font-mono text-xs">{colors.textColor}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Button Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: colors.buttonColor }}
              />
              <span className="font-mono text-xs">{colors.buttonColor}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Link Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: colors.linkColor }}
              />
              <span className="font-mono text-xs">{colors.linkColor}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Hint Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: colors.hintColor }}
              />
              <span className="font-mono text-xs">{colors.hintColor}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="tg-hint">Secondary BG:</span>
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border border-gray-300"
                style={{ backgroundColor: colors.secondaryBgColor }}
              />
              <span className="font-mono text-xs">
                {colors.secondaryBgColor}
              </span>
            </div>
          </div>
        </div>

        {rawInitData?.launchParams?.tgWebAppThemeParams && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                All Theme Parameters from launchParams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-opacity-10 overflow-auto rounded p-2 text-xs">
                {JSON.stringify(
                  rawInitData.launchParams.tgWebAppThemeParams,
                  null,
                  2
                )}
              </pre>
            </CardContent>
          </Card>
        )}

        {themeParams && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Processed Theme Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-opacity-10 overflow-auto rounded p-2 text-xs">
                {JSON.stringify(themeParams, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {rawInitData?.launchParams && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Full launchParams Object
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-opacity-10 overflow-auto rounded p-2 text-xs">
                {JSON.stringify(rawInitData.launchParams, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
