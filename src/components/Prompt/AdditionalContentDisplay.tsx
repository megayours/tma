import { useGetPublicImage } from '@/hooks/useImages';

interface AdditionalContentItemProps {
  contentId: string;
  removeContent: (contentId: string) => void;
  isMutating?: boolean;
  index: number;
}

const AdditionalContentItem = ({
  contentId,
  removeContent,
  isMutating = false,
  index,
}: AdditionalContentItemProps) => {
  console.log('contentId', contentId);
  const { imageData, isLoading } = useGetPublicImage(contentId);
  console.log('imageData', imageData);
  if (isLoading) {
    return (
      <div className="flex h-8 flex-row items-center gap-2 rounded-full bg-white/10 p-2 backdrop-blur-lg">
        <div className="text-tg-hint text-xs">Loading...</div>
      </div>
    );
  }

  if (!imageData) {
    return null;
  }

  return (
    <div className="flex flex-shrink-0 flex-row items-center gap-1 rounded-xl bg-white/10 px-2 py-1 backdrop-blur-lg">
      <div className="relative h-8 w-8 flex-shrink-0 rounded-md">
        <img
          src={imageData}
          alt={`Additional content ${contentId}`}
          className={`h-full w-full rounded-md object-contain object-center ${isMutating ? 'opacity-50' : ''}`}
        />
        {isMutating && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/20">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>
      <h1 className="text-tg-text text-sm font-bold whitespace-nowrap select-none">
        Image {index + 1}
      </h1>
      <button
        onClick={() => removeContent(contentId)}
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors hover:border-red-500 hover:text-red-500"
        disabled={isMutating}
      >
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

interface AdditionalContentDisplayProps {
  contentIds?: string[];
  removeContent: (contentId: string) => void;
  isMutating?: boolean;
}

export const AdditionalContentDisplay = ({
  contentIds,
  removeContent,
  isMutating = false,
}: AdditionalContentDisplayProps) => {
  console.log('contentIds', contentIds);
  if (!contentIds || contentIds.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-nowrap gap-2 px-2 py-2">
      {contentIds.map((contentId, index) => (
        <AdditionalContentItem
          key={contentId}
          contentId={contentId}
          index={index}
          removeContent={removeContent}
          isMutating={isMutating}
        />
      ))}
    </div>
  );
};
