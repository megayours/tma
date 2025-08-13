import { createFileRoute } from '@tanstack/react-router';
import '@telegram-apps/telegram-ui/dist/styles.css';
import { Card } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/demo2/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Hello!</h1>
      <Card type="plain">
        <div style={{ position: 'relative' }}>
          <img
            src={
              'https://yours-fun-api.testnet.megayours.com/v1/gifs/public/7c84c8b91f2fd007eff3088e2f76bc5869ee47d8edb4122291910e998bbe7652.gif'
            }
            alt="Latest Image"
            // style={{
            //   display: 'block',
            //   height: 308,
            //   objectFit: 'cover',
            //   width: 254,
            // }}
          />
        </div>
        <Card.Chip readOnly>Hot place</Card.Chip>

        <Card.Cell readOnly subtitle="United states">
          Going hot
        </Card.Cell>
      </Card>
    </div>
  );
}
