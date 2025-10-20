import { useGetPublicImage } from '@/hooks/useImages';

interface AdditionalContentItemProps {
  contentId: string;
}

const AdditionalContentItem = ({ contentId }: AdditionalContentItemProps) => {
  const { imageData, isLoading } = useGetPublicImage(contentId);

  if (isLoading) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
        <div className="text-xs text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!imageData) {
    return null;
  }

  return (
    <div className="relative h-16 w-16 flex-shrink-0">
      <img
        src={imageData}
        alt={`Additional content ${contentId}`}
        className="h-full w-full rounded-lg object-cover"
      />
    </div>
  );
};

interface AdditionalContentDisplayProps {
  contentIds?: string[];
}

export const AdditionalContentDisplay = ({
  contentIds,
}: AdditionalContentDisplayProps) => {
  if (!contentIds || contentIds.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-2 py-2">
      {contentIds.map(contentId => (
        <AdditionalContentItem key={contentId} contentId={contentId} />
      ))}
    </div>
  );
};
