import { createFileRoute } from '@tanstack/react-router';
import { List, Section, Cell } from '@telegram-apps/telegram-ui';
import {
  TelegramThemeStatus,
  TelegramThemeDemo,
  TelegramUIComponentsDemo,
  ThemeDemo,
  ThemeUsageExamples,
} from '../components';
import { getBuildInfo } from '../utils/buildInfo';

export const Route = createFileRoute('/about')({
  component: Demo,
});

function Demo() {
  const buildInfo = getBuildInfo();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    console.log(`Copied ${label} to clipboard`);
  };

  const testSentry = () => {
    throw new Error('Sentry Test Error - This is intentional!');
  };

  const resetApp = () => {
    // Confirm with user
    const confirmed = window.confirm(
      'This will clear all app data and reload. Continue?'
    );

    if (!confirmed) return;

    try {
      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      });

      console.log('App data cleared successfully');

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error clearing app data:', error);
      alert('Error clearing app data. Check console for details.');
    }
  };

  return (
    <List className="p-2">
      <Section header="Troubleshooting">
        <div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-4 shadow-lg dark:border-orange-400 dark:bg-orange-900/20">
          <Cell
            subtitle="Having issues? Clear all app data and reload"
            onClick={resetApp}
            className="cursor-pointer transition-transform active:scale-95"
          >
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              🔄 Reset App
            </span>
          </Cell>
        </div>
      </Section>

      <Section header="Build Information">
        <Cell
          subtitle="App Version"
          onClick={() => copyToClipboard(buildInfo.version, 'version')}
        >
          {buildInfo.version}
        </Cell>
        <Cell
          subtitle="Git Commit (Short)"
          onClick={() =>
            copyToClipboard(buildInfo.commitHashShort, 'short hash')
          }
        >
          {buildInfo.commitHashShort}
        </Cell>
        <Cell
          subtitle="Git Commit (Full)"
          onClick={() => copyToClipboard(buildInfo.commitHash, 'full hash')}
          className="font-mono text-xs"
        >
          {buildInfo.commitHash}
        </Cell>
        <Cell
          subtitle="Branch"
          onClick={() => copyToClipboard(buildInfo.branch, 'branch')}
        >
          {buildInfo.branch}
        </Cell>
        <Cell
          subtitle="Build Date"
          onClick={() => copyToClipboard(buildInfo.buildDate, 'build date')}
        >
          {buildInfo.buildDate}
        </Cell>
        <Cell
          subtitle="Environment"
          onClick={() => copyToClipboard(buildInfo.environment, 'environment')}
        >
          <span
            className={`font-semibold ${
              buildInfo.environment === 'production'
                ? 'text-green-600'
                : buildInfo.environment === 'staging'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
            }`}
          >
            {buildInfo.environment}
          </span>
        </Cell>
      </Section>

      <Section header="Sentry Test">
        <Cell
          subtitle="Click to test Sentry error tracking"
          onClick={testSentry}
          className="cursor-pointer"
        >
          <span className="font-semibold text-red-600">Throw Test Error</span>
        </Cell>
      </Section>

      <Section>
        <h1 className="mb-4 text-2xl">Demo Page</h1>
      </Section>

      <TelegramThemeStatus />
      <TelegramThemeDemo />
      <TelegramUIComponentsDemo />
      <ThemeDemo />
      <ThemeUsageExamples />

      <Section>
        <h2 className="mb-3 text-xl font-semibold">Typography Examples</h2>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Hello World</h1>
          <h2 className="text-2xl font-semibold">Subtitle</h2>
          <h3 className="text-xl font-medium">Heading 3</h3>
          <p className="tg-text">This is a paragraph with tg-text class</p>
          <p className="tg-hint">This is a hint text with tg-hint class</p>
          <a href="#" className="tg-link underline">
            This is a link with tg-link class
          </a>
        </div>
      </Section>

      <Section>
        <h2 className="mb-3 text-xl font-semibold">Section Examples</h2>
        <div className="bg-tg-section-bg rounded-lg p-4">
          <h5 className="text-tg-section-header-text mb-2 font-medium">
            Section Header
          </h5>
          <p className="text-tg-text">Section content with tg-text</p>
          <p className="text-tg-subtitle-text text-sm">
            Subtitle with tg-subtitle-text
          </p>
          <div className="border-tg-section-separator my-2 border-t"></div>
          <p className="text-tg-hint text-sm">Separated content with tg-hint</p>
        </div>
      </Section>

      <Section>
        <h2 className="mb-3 text-xl font-semibold">Button Examples</h2>
        <div className="space-y-2">
          <button className="bg-tg-button text-tg-button-text rounded px-4 py-2">
            Action
          </button>
          <button className="bg-tg-destructive-text text-tg-destructive-text-text rounded border border-current px-4 py-2">
            Delete
          </button>
        </div>
      </Section>

      <Section>
        <h2 className="mb-3 text-xl font-semibold">Bottom Bar Example</h2>
        <div className="bg-tg-bottom-bar-bg rounded-lg p-4">
          <p className="text-tg-text">Bottom bar content</p>
          <div className="mt-2 flex gap-2">
            <button className="bg-tg- text-tg-button-text rounded px-3 py-1 text-sm">
              Action 1
            </button>
            <button className="bg-tg-button text-tg-button-text rounded px-3 py-1 text-sm">
              Action 2
            </button>
          </div>
        </div>
      </Section>
    </List>
  );
}
