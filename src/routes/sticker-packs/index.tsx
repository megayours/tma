import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/sticker-packs/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-row gap-2">
        <h1>Sticker Packs</h1>
        <Button
          mode="filled"
          size="l"
          onClick={() => {
            navigate({ to: '/profile/my-sticker-packs/new' });
          }}
          className="text-tg-text"
        >
          +
        </Button>
      </div>
    </div>
  );
}
