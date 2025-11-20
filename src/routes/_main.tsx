import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { ContentMenu } from '@/components/ContentMenu';

export const Route = createFileRoute('/_main')({
  component: MainLayout,
});

function MainLayout() {
  const location = useLocation();
  // Define routes where ContentMenu should be displayed
  const contentMenuRoutes = ['/', '/community', '/profile', '/stickers'];
  const shouldShowContentMenu = contentMenuRoutes.includes(location.pathname);

  return (
    <div className="text-tg-text">
      <Outlet />
      {shouldShowContentMenu && <ContentMenu />}
    </div>
  );
}
