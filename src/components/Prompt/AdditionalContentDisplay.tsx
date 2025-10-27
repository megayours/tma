import { useGetPublicImage } from '@/hooks/useImages';

interface AdditionalContentItemProps {
  contentId: string;
  removeContent: (contentId: string) => void;
}

const AdditionalContentItem = ({
  contentId,
  removeContent,
}: AdditionalContentItemProps) => {
  console.log('contentId', contentId);
  const { imageData, isLoading } = useGetPublicImage(contentId);
  console.log('imageData', imageData);
  if (isLoading) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full">
        <div className="text-xs text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!imageData) {
    return null;
  }

  return (
    <div className="relative h-10 w-10 flex-shrink-0 rounded-full">
      <img
        src={imageData}
        alt={`Additional content ${contentId}`}
        className="h-full w-full rounded-full object-cover object-center"
      />
      <button
        onClick={() => removeContent(contentId)}
        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
      >
        <span className="text-xs font-bold">×</span>
      </button>
    </div>
  );
};

interface AdditionalContentDisplayProps {
  contentIds?: string[];
  removeContent: (contentId: string) => void;
}

export const AdditionalContentDisplay = ({
  contentIds,
  removeContent,
}: AdditionalContentDisplayProps) => {
  console.log('contentIds', contentIds);
  if (!contentIds || contentIds.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto px-2 py-2">
      {contentIds.map(contentId => (
        <AdditionalContentItem
          key={contentId}
          contentId={contentId}
          removeContent={removeContent}
        />
      ))}
    </div>
  );
};
