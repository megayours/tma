import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { ContentMenu } from '@/components/ContentMenu';
import { UserMenuComponent } from '@/components/lib/auth/FavoriteNFT';
import { useSession } from '@/auth/SessionProvider';
import { FaUser } from 'react-icons/fa';

export const Route = createFileRoute('/_main')({
  component: MainLayout,
});

function MainLayout() {
  const { session } = useSession();
  const location = useLocation();

  const contentTypes = [
    'Stickers',
    'Feed',
    {
      id: 'UserMenu',
      content: (
        <div className="flex w-full items-center justify-center">
          {session ? <UserMenuComponent size={35} /> : <FaUser />}
        </div>
      ),
    },
  ];

  // Define routes where ContentMenu should be displayed
  const contentMenuRoutes = ['/', '/feed', '/profile', '/stickers'];
  const shouldShowContentMenu = contentMenuRoutes.includes(location.pathname);

  return (
    <div className="text-tg-text">
      <Outlet />
      {shouldShowContentMenu && <ContentMenu contentTypes={contentTypes} />}
    </div>
  );
}
