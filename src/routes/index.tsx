import { createFileRoute, Link } from '@tanstack/react-router';
import { List, Section } from '@telegram-apps/telegram-ui';
import { ThemeDemo } from '../components/ThemeDemo';
import { ThemeUsageExamples } from '../components/ThemeUsageExamples';
import { TelegramThemeStatus } from '../components/TelegramThemeStatus';
import { TelegramThemeDemo } from '../components/TelegramThemeDemo';
import { TelegramUIComponentsDemo } from '../components/TelegramUIComponentsDemo';
import { ExampleApp } from '../components/ExampleApp';
import { Feed } from './feed';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="bg-tg-bg text-tg-text">
      <Feed />
    </div>
  );
}
