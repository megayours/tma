import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/content/$promptId')({
  component: ContentLayout,
});

function ContentLayout() {
  return (
    <div className="bg-tg-bg text-tg-text h-screen">
      <Outlet />
    </div>
  );
}
