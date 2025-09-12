import { createFileRoute } from '@tanstack/react-router';
import { Button, Divider } from '@telegram-apps/telegram-ui';
import { useNavigate } from '@tanstack/react-router';
export const Route = createFileRoute('/stickers/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-row justify-around gap-2">
        <h1>Stickers</h1>
        <Button
          mode="filled"
          size="l"
          onClick={() => navigate({ to: '/profile/my-stickers' })}
        >
          +
        </Button>
      </div>
      <Divider />
    </div>
  );
}
