import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ContentMenu } from '@/components/ContentMenu';
import { UserMenuComponent } from '@/components/lib/auth/FavoriteNFT';
import { useSession } from '@/auth/SessionProvider';
import { FaUser } from 'react-icons/fa';

export const Route = createFileRoute('/_main')({
  component: MainLayout,
});

function MainLayout() {
  const { session } = useSession();

  const contentTypes = [
    'Stickers',
    ...(!import.meta.env.PROD ? ['Feed'] : []),
    {
      id: 'UserMenu',
      content: (
        <div className="flex w-full items-center justify-center">
          {session ? <UserMenuComponent size={35} /> : <FaUser />}
        </div>
      ),
    },
  ];

  return (
    <div className="text-tg-text">
      <Outlet />
      <ContentMenu contentTypes={contentTypes} />
    </div>
  );
}
