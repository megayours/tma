import { useState } from 'react';

interface AddContentButtonProps {
  onAddContent?: (type: string) => void;
}

export function AddContentButton({ onAddContent }: AddContentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-tg-button-secondary text-tg-button-accent-color-text hover:bg-tg-button-accent-color/80 relative flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Add content"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu positioned above the button */}
          <div className="absolute bottom-full left-1/2 z-20 mb-2 w-[200px] -translate-x-1/2 transform">
            <div className="bg-tg-secondary-bg border-tg-hint/20 flex w-full flex-col gap-2 rounded-lg border p-2 shadow-lg">
              {/* Menu content will go here */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
