import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Token } from '@/types/response';
import type { Favorite } from '@/hooks/useFavorites';

interface SelectedNFTsContextType {
  selectedNFTs: Token[];
  setSelectedNFTs: (nfts: Token[]) => void;
  selectedFavorite: Favorite | null;
  setSelectedFavorite: (favorite: Favorite | null) => void;
}

const SelectedNFTsContext = createContext<SelectedNFTsContextType | undefined>(
  undefined
);

export function SelectedNFTsProvider({ children }: { children: ReactNode }) {
  const [selectedNFTs, setSelectedNFTs] = useState<Token[]>([]);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);

  return (
    <SelectedNFTsContext.Provider value={{
      selectedNFTs,
      setSelectedNFTs,
      selectedFavorite,
      setSelectedFavorite
    }}>
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
