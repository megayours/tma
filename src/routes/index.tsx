import { createFileRoute } from '@tanstack/react-router';
import { Feed } from './feed';
// import { ThemeDemo } from '../components/ThemeDemo';
// import { ThemeUsageExamples } from '../components/ThemeUsageExamples';
// import { TelegramThemeStatus } from '../components/TelegramThemeStatus';
// import { TelegramThemeDemo } from '../components/TelegramThemeDemo';
// import { TelegramUIComponentsDemo } from '../components/TelegramUIComponentsDemo';
// import { ExampleApp } from '../components/ExampleApp';

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
