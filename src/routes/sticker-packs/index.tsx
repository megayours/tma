import { createFileRoute } from '@tanstack/react-router';
import { Button, Section, Tooltip, Card } from '@telegram-apps/telegram-ui';
import { useRef, useState } from 'react';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useSession } from '@/auth/SessionProvider';

export const Route = createFileRoute('/sticker-packs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session } = useSession();
  const buttonRef = useRef<HTMLElement>(null!);
  const [showTooltip, setShowTooltip] = useState(false);
  const { data: stickerPacks } = useStickerPacks(
    {
      pagination: {
        page: 1,
        size: 10,
      },
    },
    session
  );
  console.log('STICKER PACKS', stickerPacks);
  return (
    <div>
      <div className="flex flex-row gap-2">
        <h1>Sticker Packs</h1>

        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Button
            ref={buttonRef}
            mode="filled"
            size="l"
            disabled
            className="text-tg-text"
          >
            +
          </Button>
        </div>
        {showTooltip && <Tooltip targetRef={buttonRef}>Soon</Tooltip>}
      </div>
      <div className="flex flex-col gap-2">
        {stickerPacks &&
          stickerPacks.data.length > 0 &&
          stickerPacks.data.map(stickerPack => (
            <Card key={stickerPack.id} type="plain">
              {stickerPack.name}
            </Card>
          ))}
      </div>
    </div>
  );
}
