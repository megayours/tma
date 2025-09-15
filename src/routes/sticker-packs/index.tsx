import { createFileRoute } from '@tanstack/react-router';
import { Button, Tooltip } from '@telegram-apps/telegram-ui';
import { useRef, useState } from 'react';

export const Route = createFileRoute('/sticker-packs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const buttonRef = useRef<HTMLElement>(null!);
  const [showTooltip, setShowTooltip] = useState(false);

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
    </div>
  );
}
