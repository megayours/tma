import { createFileRoute } from '@tanstack/react-router';
import { Landing } from '@/routes/landing';
import { SegmentedControl } from '@telegram-apps/telegram-ui';
import { useState, type ReactNode } from 'react';
import { Feed } from '@/routes/feed';
import { UserMenuComponent } from '@/components/lib/auth/FavoriteNFT';
import { ProfileLayout } from '@/routes/profile/index';
import { useSession } from '@/auth/SessionProvider';

export const Route = createFileRoute('/')({
  component: Index,
});

type ContentType = string | { id: string; content: ReactNode };

interface ContentMenuProps {
  contentTypes: ContentType[];
  selectedContentTye: string;
  setSelectedContentType: (contentType: string) => void;
}

function ContentMenu(props: ContentMenuProps) {
  return (
    <div className="fixed bottom-4 w-full px-4 text-xs">
      <SegmentedControl>
        {props.contentTypes.map(contentType => {
          const id =
            typeof contentType === 'string' ? contentType : contentType.id;
          const content =
            typeof contentType === 'string' ? contentType : contentType.content;

          return (
            <SegmentedControl.Item
              key={id}
              onClick={() => props.setSelectedContentType(id)}
              selected={props.selectedContentTye === id}
            >
              {content}
            </SegmentedControl.Item>
          );
        })}
      </SegmentedControl>
    </div>
  );
}

function Index() {
  const [selectedContentType, setSelectedContentType] = useState('Stickers');
  const { session } = useSession();

  const contentTypes: ContentType[] = [
    'Stickers',
    'Feed',
    ...(session
      ? [
          {
            id: 'UserMenu',
            content: (
              <div className="flex w-full items-center justify-center">
                <UserMenuComponent size={35} />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="bg-tg-bg text-tg-text">
      {selectedContentType == 'Stickers' && <Landing />}
      {selectedContentType == 'Feed' && <Feed />}
      {selectedContentType == 'UserMenu' && <ProfileLayout />}
      <ContentMenu
        contentTypes={contentTypes}
        selectedContentTye={selectedContentType}
        setSelectedContentType={setSelectedContentType}
      />
    </div>
  );
}
