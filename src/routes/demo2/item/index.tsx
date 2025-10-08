import { createFileRoute } from '@tanstack/react-router';
import { Card } from '@telegram-apps/telegram-ui';

export const Route = createFileRoute('/demo2/item/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden overflow-y-auto"
      style={{ height: '100vh' }}
    >
      <Card
        type="ambient"
        className={`card h-80vh flex max-w-md cursor-pointer flex-col items-center justify-center`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '',
        }}
      >
        <div className="image-container relative flex h-full items-center justify-center">
          <img
            src={`${import.meta.env.VITE_API_URL}/gifs/public/7c84c8b91f2fd007eff3088e2f76bc5869ee47d8edb4122291910e998bbe7652.gif`}
            alt="test"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <Card.Chip readOnly>Hot place</Card.Chip>
        <Card.Cell
          readOnly
          subtitle="United states"
          className="hover:bg-transparent"
          style={
            {
              backgroundColor: 'transparent !important',
              '--hover-bg': 'transparent',
              '--hover-bg-opacity': '0',
            } as React.CSSProperties
          }
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Going hot
        </Card.Cell>
      </Card>
    </div>
  );
}
