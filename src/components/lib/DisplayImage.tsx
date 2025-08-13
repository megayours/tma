import '@telegram-apps/telegram-ui/dist/styles.css';
import { Card } from '@telegram-apps/telegram-ui';
import type { ImageStatus } from '@/types/image';
import { useGetImage } from '@/hooks/useImages';

export function DisplayImage({ imageStatus }: { imageStatus: ImageStatus }) {
  console.log('imageStatus.id', imageStatus.id);
  const { image, isLoading } = useGetImage(imageStatus.id);
  console.log('useGetImage result:', { image, isLoading });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log('image', image, image?.image);

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
