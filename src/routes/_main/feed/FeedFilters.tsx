import type { SupportedCollection } from '@/hooks/useCollections';

type ContentTypeFilter =
  | 'images'
  | 'videos'
  | 'gifs'
  | 'stickers'
  | 'animated_stickers';

interface FeedFiltersProps {
  contentTypes: { value: ContentTypeFilter | 'all'; label: string }[];
  selectedTypes: ContentTypeFilter[];
  toggleType: (type: ContentTypeFilter | 'all') => void;
  typeButtonsRef: React.MutableRefObject<{
    [key: string]: HTMLButtonElement | null;
  }>;
  usedCollections: SupportedCollection[];
  isLoadingCollections: boolean;
  selectedCollections: SupportedCollection[];
  toggleCollection: (collection: SupportedCollection) => void;
}

export function FeedFilters({
  contentTypes,
  selectedTypes,
  toggleType,
  typeButtonsRef,
  usedCollections,
  isLoadingCollections,
  selectedCollections,
  toggleCollection,
}: FeedFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-2 lg:flex-row lg:gap-0">
      {/* Content type filters */}
      <div className="scrollbar-hide flex h-8 w-full flex-row overflow-x-auto lg:w-auto">
        {contentTypes.map(({ value, label }) => {
          const isActive =
            value === 'all'
              ? selectedTypes.length === 0
              : selectedTypes.includes(value as ContentTypeFilter);
          return (
            <button
              key={value}
              ref={el => {
                typeButtonsRef.current[value] = el;
              }}
              onClick={() => toggleType(value)}
              style={{ minWidth: 0 }}
              className={`shrink-0 overflow-hidden rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-tg-button text-tg-button-text shadow-md backdrop-blur-sm'
                  : 'border-tg-section-separator text-tg-text bg-tg-bg/60 hover:bg-tg-section-bg/80 border backdrop-blur-sm'
              }`}
            >
              {label}
            </button>
          );
        })}

        {/* Separator - only visible on large screens */}
        {(usedCollections.length > 0 || isLoadingCollections) && (
          <div className="border-tg-section-separator mx-2 hidden h-8 w-px shrink-0 border-l lg:block" />
        )}
      </div>

      {/* Collection filters */}
      {(usedCollections.length > 0 || isLoadingCollections) && (
        <div className="scrollbar-hide flex h-8 w-full flex-row gap-1 overflow-x-auto lg:w-auto">
          {/* Collection filters loading placeholders */}
          {isLoadingCollections && (
            <>
              {[1, 2, 3, 4, 5, 6].map(index => (
                <div
                  key={`placeholder-${index}`}
                  className="border-tg-section-separator bg-tg-bg/60 flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 backdrop-blur-sm"
                >
                  <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                </div>
              ))}
            </>
          )}

          {/* Collection filters */}
          {!isLoadingCollections &&
            usedCollections.map(collection => {
              const isActive = selectedCollections.some(
                c => c.id === collection.id
              );
              return (
                <button
                  key={collection.id}
                  onClick={() => toggleCollection(collection)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-tg-button text-tg-button-text shadow-md backdrop-blur-sm'
                      : 'border-tg-section-separator text-tg-text bg-tg-bg/60 hover:bg-tg-section-bg/80 border backdrop-blur-sm'
                  }`}
                >
                  {collection.image && (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                  )}
                  <span className="line-clamp-1">{collection.name}</span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
