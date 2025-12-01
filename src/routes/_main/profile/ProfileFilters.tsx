type ProfileContentTypeFilter =
  | 'image'
  | 'video'
  | 'sticker'
  | 'animated_sticker';

interface ProfileFiltersProps {
  contentTypes: { value: ProfileContentTypeFilter | 'all'; label: string }[];
  selectedTypes: ProfileContentTypeFilter[];
  toggleType: (type: ProfileContentTypeFilter | 'all') => void;
  typeButtonsRef: React.MutableRefObject<{
    [key: string]: HTMLButtonElement | null;
  }>;
}

export function ProfileFilters({
  contentTypes,
  selectedTypes,
  toggleType,
  typeButtonsRef,
}: ProfileFiltersProps) {
  return (
    <div className="scrollbar-hide flex h-8 w-full flex-row gap-1 overflow-x-auto">
      {contentTypes.map(({ value, label }) => {
        const isActive =
          value === 'all'
            ? selectedTypes.length === 0
            : selectedTypes.includes(value as ProfileContentTypeFilter);
        return (
          <button
            key={value}
            ref={el => {
              typeButtonsRef.current[value] = el;
            }}
            onClick={() => toggleType(value)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-tg-button text-tg-button-text shadow-md'
                : 'border-tg-section-separator text-tg-text bg-tg-bg/60 hover:bg-tg-section-bg/80 border'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
