import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/memes/$templateId')({
  component: MemeLayout,
});

function MemeLayout() {
  return (
    <div className="bg-tg-bg text-tg-text h-screen">
      <Outlet />
    </div>
  );
}
