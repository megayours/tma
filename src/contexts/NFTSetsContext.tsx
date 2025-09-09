import React, { createContext, useContext, type ReactNode } from 'react';
import { useNFTSets } from '@/hooks/useNFTSets';
import type { Prompt } from '@/types/prompt';

interface NFTSetsContextType {
  nftSets: any[][];
  setNftSets: (sets: any[][]) => void;
  addNFTSet: () => void;
  removeNFTSet: (index: number) => void;
  updateNFTSet: (index: number, newSet: any[]) => void;
  updateNFTInSet: (setIndex: number, nftIndex: number, newToken: any) => void;
  canAddSet: boolean;
  canRemoveSet: boolean;
}

const NFTSetsContext = createContext<NFTSetsContextType | undefined>(undefined);

interface NFTSetsProviderProps {
  children: ReactNode;
  prompt: Prompt | null;
}

export const NFTSetsProvider: React.FC<NFTSetsProviderProps> = ({
  children,
  prompt,
}) => {
  const nftSetsHook = useNFTSets(prompt);

  return (
    <NFTSetsContext.Provider value={nftSetsHook}>
      {children}
    </NFTSetsContext.Provider>
  );
};

export const useNFTSetsContext = () => {
  const context = useContext(NFTSetsContext);
  if (context === undefined) {
    throw new Error('useNFTSetsContext must be used within a NFTSetsProvider');
  }
  return context;
};
