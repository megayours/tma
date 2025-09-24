import { TokenSelectionCore } from './TokenSelectionCore';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';

interface InlineTokenSelectionProps {
  selectedFavorite: { token: Token };
  requiredTokens: number;
  optionalTokens: number;
  onGenerate: (tokens: Token[]) => void;
  prompt: Prompt;
  className?: string;
}

export const InlineTokenSelection = ({
  selectedFavorite,
  requiredTokens,
  optionalTokens,
  onGenerate,
  prompt,
  className = "",
}: InlineTokenSelectionProps) => {
  return (
    <TokenSelectionCore
      selectedFavorite={selectedFavorite}
      requiredTokens={requiredTokens}
      optionalTokens={optionalTokens}
      onGenerate={onGenerate}
      prompt={prompt}
      showHeader={false}
      className={className}
    />
  );
};