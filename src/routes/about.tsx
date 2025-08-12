import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: About,
});

function About() {
  return (
    <div className="tg-bg tg-text p-4">
      <h1 className="mb-4 text-2xl font-bold">About</h1>
      <p className="tg-hint leading-relaxed">
        This page demonstrates Telegram theme inheritance. The background, text,
        and styling automatically adapt to match your Telegram theme.
      </p>
      <div className="mt-4">
        <button className="tg-button rounded px-4 py-2 transition-opacity hover:opacity-90">
          Telegram Styled Button
        </button>
      </div>
    </div>
  );
}
