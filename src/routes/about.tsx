import { createFileRoute } from '@tanstack/react-router';
import { List, Section } from '@telegram-apps/telegram-ui';
import {
  TelegramThemeStatus,
  TelegramThemeDemo,
  TelegramUIComponentsDemo,
  ExampleApp,
  ThemeDemo,
  ThemeUsageExamples,
} from '../components';

export const Route = createFileRoute('/about')({
  component: Demo,
});

function Demo() {
  return (
    <List className="p-2">
      <Section>
        <h1 className="mb-4 text-2xl">Demo Page</h1>
      </Section>

      <TelegramThemeStatus />
      <TelegramThemeDemo />
      <TelegramUIComponentsDemo />
      <ExampleApp />
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
