import { createFileRoute } from '@tanstack/react-router';
import { Landing } from '@/routes/landing';
import { useState, type ReactNode } from 'react';
import { Feed } from '@/routes/feed';
import { UserMenuComponent } from '@/components/lib/auth/FavoriteNFT';
import { ProfileLayout } from '@/routes/profile/index';
import { useSession } from '@/auth/SessionProvider';
import { ContentMenu } from '@/components/ContentMenu';
import { FaUser } from 'react-icons/fa';

export const Route = createFileRoute('/')({
  component: Index,
});

type ContentType = string | { id: string; content: ReactNode };

function Index() {
  const [selectedContentType, setSelectedContentType] = useState('Stickers');
  const { session } = useSession();

  const contentTypes: ContentType[] = [
    'Stickers',
    // 'Feed',
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
    <div className="bg-tg-bg text-tg-text">
      {selectedContentType == 'Stickers' && <Landing />}
      {selectedContentType == 'Feed' && <Feed />}
      {selectedContentType == 'UserMenu' && <ProfileLayout />}
      <ContentMenu
        contentTypes={contentTypes}
        selectedContentType={selectedContentType}
        setSelectedContentType={setSelectedContentType}
      />
    </div>
  );
}
