import type { Token } from '@/types/response';

interface NFTsSummaryProps {
  tokens: Token[];
  heading?: string;
  onModify?: (index?: number) => void;
  maxTokens?: number; // Total number of slots to display
}

export function NFTsSummary({ tokens, onModify, maxTokens }: NFTsSummaryProps) {
  // Create an array that includes both selected tokens and empty slots
  const totalSlots = maxTokens || tokens.length;
  const displaySlots = Array.from(
    { length: totalSlots },
    (_, i) => tokens[i] || null
  );

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-6 py-8">
      <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 lg:grid-cols-4">
        {displaySlots.map((token, index) => (
          <div
            key={
              token ? `${token.contract.address}-${token.id}` : `empty-${index}`
            }
            className="relative cursor-pointer"
            onClick={() => onModify?.(index)}
          >
            {token ? (
              <img
                src={token.image}
                alt={token.name || `NFT #${token.id}`}
                className="border-tg-button aspect-square w-full min-w-32 rounded-full border-2 object-cover"
              />
            ) : (
              <div className="bg-tg-secondary border-tg-hint/30 text-tg-hint flex aspect-square w-full min-w-32 items-center justify-center rounded-full border-2 border-dashed">
                <div className="flex flex-col items-center justify-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium opacity-70">
                    #{index + 1}
                  </span>
                </div>
              </div>
            )}

            {/* Edit Icon - Positioned overlay */}
            {onModify && (
              <div className="bg-tg-accent-text absolute right-1 bottom-1 rounded-full p-1.5 transition-all duration-300 ease-in-out hover:opacity-90">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
