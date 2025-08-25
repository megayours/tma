import '@telegram-apps/telegram-ui/dist/styles.css';
import { Card } from '@telegram-apps/telegram-ui';
import type { ImageStatus } from '@/types/image';
import { useGetImage } from '@/hooks/useImages';

export function DisplayImage({ imageStatus }: { imageStatus: ImageStatus }) {
  const { image, isLoading } = useGetImage(imageStatus.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card type="plain">
      <div style={{ position: 'relative' }}>
        <img
          src={image?.image}
          alt="Latest Image"
          className="block"
          style={{
            display: 'block',
            height: 308,
            objectFit: 'cover',
            width: 254,
          }}
        />
      </div>
      <Card.Chip readOnly>Hot place</Card.Chip>

      <Card.Cell readOnly subtitle="United states">
        Going hot
      </Card.Cell>
    </Card>
  );
}
