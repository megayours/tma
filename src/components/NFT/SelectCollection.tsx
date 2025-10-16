import type { SupportedCollection } from '@/hooks/useCollections';

interface SelectCollectionProps {
  collections: SupportedCollection[];
  onCollectionSelect: (collection: SupportedCollection) => void;
  title?: string;
  className?: string;
}

export function SelectCollection({
  collections,
  onCollectionSelect,
  className = '',
}: SelectCollectionProps) {
  const handleCardClick = (collection: SupportedCollection) => {
    onCollectionSelect(collection);
  };

  return (
    <div
      className={`flex h-full flex-col gap-2 p-2 ${className} w-full`}
      style={{ height: '100%', maxHeight: 'none' }}
    >
      <div
        className="scrollbar-hide grid flex-1 grid-cols-2 gap-1 overflow-y-auto p-2"
        style={{
          height: 'calc(100% - 60px)',
          maxHeight: 'none',
          overflowY: 'auto',
        }}
      >
        {collections?.map((collection: SupportedCollection) => (
          <div
            key={collection.address}
            className="bg-tg-secondary hover:bg-tg-secondary/80 border-tg-section-separator flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border p-1 transition-colors"
            onClick={() => handleCardClick(collection)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={collection.image}
              alt={collection.name}
              className="max-h-16 min-h-8 w-full rounded-md object-cover"
            />
            <div className="text-tg-text mt-2 text-center text-xs font-bold break-words">
              {collection.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
