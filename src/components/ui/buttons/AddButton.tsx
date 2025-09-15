interface AddButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const AddButton = ({ isOpen, onClick }: AddButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-tg-button text-tg-button-text hover:bg-tg-button/80 flex h-10 w-10 items-center justify-center rounded-lg shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
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
  );
};