import type { SupportedCollection } from '@/hooks/useCollections';

interface SelectCollectionProps {
  collections: SupportedCollection[];
  onCollectionSelect: (collection: SupportedCollection) => void;
  title?: string;
  className?: string;
  size?: 's' | 'm' | 'l';
}

export function SelectCollection({
  collections,
  onCollectionSelect,
  title = 'Select a collection',
  className = '',
  size = 'm',
}: SelectCollectionProps) {
  // Size-based styling configuration
  const sizeConfig = {
    s: {
      section: 'flex flex-col gap-2 p-2 h-full',
      title: 'text-tg-text mb-2 text-sm font-semibold',
      grid: 'grid flex-1 grid-cols-2 gap-1 overflow-y-auto p-2',
      card: 'bg-tg-secondary flex flex-col items-center justify-center gap-2 p-1 cursor-pointer hover:bg-tg-secondary/80 transition-colors rounded-lg border border-tg-section-separator',
      image: 'max-h-16 min-h-8 w-full rounded-md object-cover',
      text: 'text-tg-text mt-2 text-center text-xs font-bold break-words',
    },
    m: {
      section: 'flex flex-col gap-4 p-4',
      title: 'text-tg-text mb-4 text-xl font-semibold',
      grid: 'grid h-full grid-cols-3 gap-2 overflow-y-auto p-4',
      card: 'bg-tg-secondary flex flex-col items-center justify-center gap-4 p-2 cursor-pointer hover:bg-tg-secondary/80 transition-colors rounded-lg border border-tg-section-separator',
      image: 'max-h-24 min-h-12 w-full rounded-lg object-cover',
      text: 'text-tg-text mt-4 text-center text-xs font-bold break-words',
    },
    l: {
      section: 'flex flex-col gap-6 p-6',
      title: 'text-tg-text mb-6 text-2xl font-semibold',
      grid: 'grid h-full grid-cols-2 gap-4 overflow-y-auto p-6',
      card: 'bg-tg-secondary flex flex-col items-center justify-center gap-6 p-4 cursor-pointer hover:bg-tg-secondary/80 transition-colors rounded-lg border border-tg-section-separator',
      image: 'max-h-32 min-h-16 w-full rounded-xl object-cover',
      text: 'text-tg-text mt-6 text-center text-sm font-bold break-words',
    },
  };

  const config = sizeConfig[size];

  const handleCardClick = (collection: SupportedCollection) => {
    onCollectionSelect(collection);
  };

  return (
    <div
      className={`${config.section} h-full ${className} w-full`}
      style={{ height: '100%', maxHeight: 'none' }}
    >
      <div className="bg-tg-bg sticky top-0 z-10 w-full p-2">
        <h2 className={`${config.title}`}>{title}</h2>
      </div>
      <div
        className={config.grid}
        style={{
          height: 'calc(100% - 60px)',
          maxHeight: 'none',
          overflowY: 'auto',
        }}
      >
        {collections?.map((collection: SupportedCollection) => (
          <div
            key={collection.address}
            className={config.card}
            onClick={() => handleCardClick(collection)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={collection.image}
              alt={collection.name}
              className={config.image}
            />
            <div className={config.text}>{collection.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
