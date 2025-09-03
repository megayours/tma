import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Token } from '@/types/response';

interface SelectedNFTsContextType {
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
}

const SelectedNFTsContext = createContext<SelectedNFTsContextType | undefined>(
  undefined
);

export function SelectedNFTsProvider({ children }: { children: ReactNode }) {
  const [selectedNFTs, setSelectedNFTs] = useState<Token[]>([]);

  return (
    <SelectedNFTsContext.Provider value={{ selectedNFTs, setSelectedNFTs }}>
      {children}
    </SelectedNFTsContext.Provider>
  );
}

export function useSelectedNFTs() {
  const context = useContext(SelectedNFTsContext);
  if (context === undefined) {
    throw new Error(
      'useSelectedNFTs must be used within a SelectedNFTsProvider'
    );
  }
  return context;
}
