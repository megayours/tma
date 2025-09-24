import { createPortal } from 'react-dom';
import { TokenSelectionCore } from './TokenSelectionCore';
import type { Token } from '@/types/response';
import type { Prompt } from '@/types/prompt';

interface TokenSelectionCloudProps {
  selectedFavorite: { token: Token };
  requiredTokens: number;
  optionalTokens: number;
  onClose: () => void;
  onGenerate: (tokens: Token[]) => void;
  prompt: Prompt;
}

export const TokenSelectionCloud = ({
  selectedFavorite,
  requiredTokens,
  optionalTokens,
  onClose,
  onGenerate,
  prompt,
}: TokenSelectionCloudProps) => {
  const handleCloudClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Find the token-selection-container element
  const portalContainer = document.getElementById('token-selection-container');

  if (!portalContainer) {
    return null;
  }

  const cloudContent = (
    <div
      className="relative overflow-y-auto"
      style={{
        maxHeight: '80vh',
        minHeight: '200px',
        width: '90vw',
        maxWidth: '400px',
        zIndex: 9999,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
      }}
      onClick={handleCloudClick}
    >
      <TokenSelectionCore
        selectedFavorite={selectedFavorite}
        requiredTokens={requiredTokens}
        optionalTokens={optionalTokens}
        onGenerate={onGenerate}
        prompt={prompt}
        showHeader={true}
        onClose={onClose}
      />
    </div>
  );

  return createPortal(cloudContent, portalContainer);
};