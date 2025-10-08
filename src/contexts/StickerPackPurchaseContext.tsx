import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Token } from '@/types/response';
import type { StickerPackDetail } from '@/hooks/useStickerPacks';

interface StickerPackPurchaseContextType {
  // State
  selectedNFTs: Token[];
  selectedTier: 'basic' | 'gold' | 'legendary';
  stickerPack: StickerPackDetail | null;
  executionId: string | null;

  // Actions
  setSelectedNFTs: (nfts: Token[]) => void;
  setSelectedTier: (tier: 'basic' | 'gold' | 'legendary') => void;
  setStickerPack: (pack: StickerPackDetail | null) => void;
  setExecutionId: (id: string | null) => void;
  resetPurchase: () => void;
}

const StickerPackPurchaseContext = createContext<
  StickerPackPurchaseContextType | undefined
>(undefined);

interface StickerPackPurchaseProviderProps {
  children: ReactNode;
}

export function StickerPackPurchaseProvider({
  children,
}: StickerPackPurchaseProviderProps) {
  const [selectedNFTs, setSelectedNFTs] = useState<Token[]>([]);
  const [selectedTier, setSelectedTier] = useState<
    'basic' | 'gold' | 'legendary'
  >('basic');
  const [stickerPack, setStickerPack] = useState<StickerPackDetail | null>(
    null
  );
  const [executionId, setExecutionId] = useState<string | null>(null);

  const resetPurchase = () => {
    setSelectedNFTs([]);
    setSelectedTier('basic');
    setStickerPack(null);
    setExecutionId(null);
  };

  return (
    <StickerPackPurchaseContext.Provider
      value={{
        selectedNFTs,
        selectedTier,
        stickerPack,
        executionId,
        setSelectedNFTs,
        setSelectedTier,
        setStickerPack,
        setExecutionId,
        resetPurchase,
      }}
    >
      {children}
    </StickerPackPurchaseContext.Provider>
  );
}

export function useStickerPackPurchase() {
  const context = useContext(StickerPackPurchaseContext);
  if (context === undefined) {
    throw new Error(
      'useStickerPackPurchase must be used within a StickerPackPurchaseProvider'
    );
  }
  return context;
}
