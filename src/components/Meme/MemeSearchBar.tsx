interface MemeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MemeSearchBar({
  value,
  onChange,
  placeholder = 'Search meme templates...',
}: MemeSearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-tg-section-bg text-tg-text border-tg-section-separator placeholder:text-tg-hint w-full rounded-lg border px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-tg-button"
      />
      <svg
        className="text-tg-hint absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-tg-hint hover:text-tg-text absolute right-3 top-1/2 -translate-y-1/2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
