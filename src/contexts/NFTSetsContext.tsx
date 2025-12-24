import React, { createContext, useContext, type ReactNode } from 'react';
import { useNFTSets } from '@/hooks/useNFTSets';
import type { Prompt } from '@/types/prompt';
import { useSelectCommunity } from './SelectCommunityContext';

interface NFTSetsContextType {
  compulsoryNFTs: any[][];
  optionalNFTs: any[][];
  setCompulsoryNFTs: (sets: any[][]) => void;
  setOptionalNFTs: (sets: any[][]) => void;
  addNFTSet: () => void;
  removeNFTSet: (index: number) => void;
  updateCompulsoryNFTInSet: (setIndex: number, nftIndex: number, newToken: any) => void;
  updateOptionalNFTInSet: (setIndex: number, nftIndex: number, newToken: any) => void;
  addOptionalNFT: (setIndex: number, newToken: any) => void;
  removeOptionalNFT: (setIndex: number, nftIndex: number) => void;
  canAddSet: boolean;
  canRemoveSet: boolean;
  maxOptionalTokens: number;
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
  const { defaultCollection, selectedCommunity } = useSelectCommunity();
  const allCollections = selectedCommunity?.collections;
  const nftSetsHook = useNFTSets(prompt, defaultCollection, allCollections);

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
