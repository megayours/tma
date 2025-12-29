import type { Token } from '@/types/response';

interface NFTsSummaryProps {
  tokens: Token[];
  heading?: string;
}

export function NFTsSummary({ tokens, heading }: NFTsSummaryProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-6 py-8">
      {heading && (
        <h1 className="text-tg-text mb-4 text-center text-2xl font-bold">
          {heading}
        </h1>
      )}

      <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 lg:grid-cols-4">
        {tokens.map(token => (
          <img
            key={`${token.contract.address}-${token.id}`}
            src={token.image}
            alt={token.name || `NFT #${token.id}`}
            className="border-tg-button aspect-square w-full rounded-full border-2 object-cover"
          />
        ))}
      </div>
    </div>
  );
}
