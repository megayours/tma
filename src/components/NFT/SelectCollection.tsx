import type { SupportedCollection } from '@/hooks/useCollections';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { useMemo } from 'react';

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
  const { selectedCommunity } = useSelectCommunity();
  console.log('GGGGSelectedCOmmnuity', selectedCommunity);

  // Filter collections by selected community
  const filteredCollections = useMemo(() => {
    console.log('[SelectCollection Filter] Computing collections', {
      totalCollections: collections?.length || 0,
      selectedCommunity: selectedCommunity
        ? { id: selectedCommunity.id, name: selectedCommunity.name }
        : null,
      communityCollectionsCount: selectedCommunity?.collections?.length || 0,
    });

    if (!collections) {
      console.log('[SelectCollection Filter] No collections provided');
      return [];
    }

    // If no community selected, show all collections
    if (!selectedCommunity || !selectedCommunity.collections) {
      console.log(
        '[SelectCollection Filter] No community selected, showing all collections'
      );
      return collections;
    }

    // Filter to only show collections that belong to the selected community
    const filtered = collections.filter(collection =>
      selectedCommunity.collections.some(
        c => c.address === collection.address && c.chain === collection.chain
      )
    );

    console.log('[SelectCollection Filter] Filtered collections', {
      totalCollections: collections.length,
      filteredCount: filtered.length,
      communityName: selectedCommunity.name,
    });

    return filtered;
  }, [collections, selectedCommunity]);

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
        {filteredCollections?.map((collection: SupportedCollection) => (
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
