import type { Token } from '@/types/response';

interface TokenSlotProps {
  type: 'favorite' | 'required' | 'optional';
  token: Token | null;
  index?: number;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const TokenSlot = ({ type, token, index, onClick, size = 'medium' }: TokenSlotProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-12 w-12';
      case 'large':
        return 'h-20 w-20';
      case 'medium':
      default:
        return 'h-16 w-16';
    }
  };

  const getBorderClasses = () => {
    if (token) {
      return 'border-tg-section-separator';
    }

    switch (type) {
      case 'favorite':
        return 'border-tg-button';
      case 'required':
        return 'border-blue-500 border-2 border-dashed';
      case 'optional':
        return 'border-gray-400 border-2 border-dashed';
      default:
        return 'border-tg-section-separator';
    }
  };

  const getLabel = () => {
    if (type === 'favorite') return null;
    if (type === 'required') return null; // Remove numbering for required tokens
    if (type === 'optional') return index !== undefined ? `+${index + 1}` : '+1';
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`
          ${getSizeClasses()}
          ${getBorderClasses()}
          relative flex items-center justify-center rounded-full bg-tg-secondary transition-all
          ${onClick ? 'cursor-pointer hover:scale-105 hover:bg-tg-secondary/80' : ''}
          ${!token ? 'border-dashed' : 'border-solid'}
        `}
        onClick={onClick}
      >
        {token ? (
          <img
            src={token.image || '/nfts/not-available.png'}
            alt={token.name || `NFT #${token.id}`}
            className="h-full w-full rounded-full object-cover p-1"
          />
        ) : (
          <div className="flex items-center justify-center text-tg-hint">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Label for slot type */}
      {getLabel() && (
        <div className="text-xs font-medium text-tg-hint">
          {getLabel()}
        </div>
      )}

      {/* Token name if available - always reserve space for alignment */}
      <div className="max-w-[80px] truncate text-xs text-tg-text min-h-[1.125rem]">
        {token ? (token.name || `#${token.id}`) : ''}
      </div>
    </div>
  );
};