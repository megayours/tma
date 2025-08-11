import { useTheme } from '../auth/ThemeProvider';
import { useTelegramColors } from '../auth/useTelegram';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from './ui';

export function TelegramThemeDemo() {
  const { isDark, themeParams, isTelegram } = useTheme();
  const colors = useTelegramColors();

  const colorSwatches = [
    { name: 'Background', color: colors.bgColor, class: 'tg-bg' },
    { name: 'Text', color: colors.textColor, class: 'tg-text' },
    { name: 'Hint', color: colors.hintColor, class: 'tg-hint' },
    { name: 'Link', color: colors.linkColor, class: 'tg-link' },
    { name: 'Button', color: colors.buttonColor, class: 'tg-button' },
    { name: 'Button Text', color: colors.buttonTextColor },
    {
      name: 'Secondary BG',
      color: colors.secondaryBgColor,
      class: 'tg-secondary-bg',
    },
    {
      name: 'Accent Text',
      color: colors.accentTextColor,
      class: 'tg-accent-text',
    },
    {
      name: 'Destructive Text',
      color: colors.destructiveTextColor,
      class: 'tg-destructive-text',
    },
    { name: 'Header BG', color: colors.headerBgColor, class: 'tg-header-bg' },
    {
      name: 'Section BG',
      color: colors.sectionBgColor,
      class: 'tg-section-bg',
    },
    {
      name: 'Section Header Text',
      color: colors.sectionHeaderTextColor,
      class: 'tg-section-header-text',
    },
    {
      name: 'Section Separator',
      color: colors.sectionSeparatorColor,
      class: 'tg-section-separator',
    },
    {
      name: 'Subtitle Text',
      color: colors.subtitleTextColor,
      class: 'tg-subtitle-text',
    },
    {
      name: 'Bottom Bar BG',
      color: colors.bottomBarBgColor,
      class: 'tg-bottom-bar-bg',
    },
  ];

  return (
    <div className="tg-bg tg-text space-y-6 p-4">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Telegram Theme Demo</h2>

        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
            <CardDescription>
              Current app environment and theme status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="tg-hint">Environment:</span>
              <Badge variant={isTelegram ? 'success' : 'secondary'}>
                {isTelegram ? 'Telegram Mini App' : 'Browser'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="tg-hint">Theme Mode:</span>
              <Badge variant={isDark ? 'secondary' : 'outline'}>
                {isDark ? 'Dark' : 'Light'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="tg-hint">Theme Source:</span>
              <span className="font-medium">
                launchParams.tgWebAppThemeParams
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Color Swatches */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>
              All available Telegram theme colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {colorSwatches.map(swatch => (
                <div key={swatch.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded border border-gray-300"
                      style={{ backgroundColor: swatch.color }}
                    />
                    <span className="font-medium">{swatch.name}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs">{swatch.color}</p>
                    {swatch.class && (
                      <p className="tg-hint text-xs">Class: {swatch.class}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              Examples of how to use Telegram theme classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Styling */}
            <div className="space-y-4">
              <h4 className="font-semibold">Basic Styling</h4>
              <Card className="tg-secondary-bg">
                <CardContent className="pt-6">
                  <p className="tg-text">This text uses tg-text class</p>
                  <p className="tg-hint">This text uses tg-hint class</p>
                  <a href="#" className="tg-link underline">
                    This is a link with tg-link class
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Button Examples */}
            <div className="space-y-4">
              <h4 className="font-semibold">Button Examples</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Destructive Button</Button>
              </div>
            </div>

            {/* Section Examples */}
            <div className="space-y-4">
              <h4 className="font-semibold">Section Examples</h4>
              <Card className="bg-tg-section-bg">
                <CardHeader>
                  <CardTitle className="text-tg-section-header-text">
                    Section Header
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-tg-text">Section content with tg-text</p>
                  <p className="text-tg-subtitle-text text-sm">
                    Subtitle with tg-subtitle-text
                  </p>
                  <div className="border-tg-section-separator my-2 border-t"></div>
                  <p className="text-tg-hint text-sm">
                    Separated content with tg-hint
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Header Example */}
            <div className="space-y-4">
              <h4 className="font-semibold">Header Example</h4>
              <Card className="bg-tg-header-bg">
                <CardHeader>
                  <CardTitle className="text-tg-text">
                    Header Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-tg-hint">Content in header area</p>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Bar Example */}
            <div className="space-y-4">
              <h4 className="font-semibold">Bottom Bar Example</h4>
              <Card className="bg-tg-bottom-bar-bg">
                <CardContent className="pt-6">
                  <p className="text-tg-text">Bottom bar content</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm">Action 1</Button>
                    <Button size="sm">Action 2</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Theme Parameters */}
        {themeParams && (
          <Card>
            <CardHeader>
              <CardTitle>Raw Theme Parameters</CardTitle>
              <CardDescription>
                Theme parameters from launchParams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-opacity-10 overflow-auto rounded p-4 text-xs">
                {JSON.stringify(themeParams, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
