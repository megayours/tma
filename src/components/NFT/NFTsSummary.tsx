import type { Token } from '@/types/response';

interface NFTsSummaryProps {
  tokens: Token[];
  heading?: string;
  onModify?: (index?: number) => void;
  maxTokens?: number; // Total number of slots to display
}

export function NFTsSummary({
  tokens,
  heading,
  onModify,
  maxTokens,
}: NFTsSummaryProps) {
  // Create an array that includes both selected tokens and empty slots
  const totalSlots = maxTokens || tokens.length;
  const displaySlots = Array.from(
    { length: totalSlots },
    (_, i) => tokens[i] || null
  );

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-6 py-8">
      {heading && (
        <h1 className="text-tg-text mb-4 text-center text-2xl font-bold">
          {heading}
        </h1>
      )}

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
                className="border-tg-button aspect-square w-full rounded-full border-2 object-cover"
              />
            ) : (
              <div className="bg-tg-secondary border-tg-hint/30 text-tg-hint flex aspect-square w-full items-center justify-center rounded-full border-2 text-4xl font-bold">
                #{index + 1}
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
