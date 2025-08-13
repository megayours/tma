import { DisplayImage } from '../DisplayImage';
import { useGetLatestImages } from '@/hooks/useImages';

export function LatestImage({ prompt }: { prompt: any }) {
  const { images, isLoading } = useGetLatestImages({
    promptId: prompt.id,
    pagination: {
      page: 1,
      size: 6,
    },
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  });

  console.log('images', images);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    images && (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {images.images.map(image => (
          <div key={image.id} className="flex-shrink-0">
            <DisplayImage imageStatus={image} />
          </div>
        ))}
      </div>
    )
  );
}
