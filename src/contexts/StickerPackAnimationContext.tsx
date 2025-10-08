import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useStickerPackAnimation } from '@/hooks/useStickerPackAnimation';
import { ConfettiAnimation } from '@/components/StickerPack/ConfettiAnimation';

interface StickerPackAnimationContextType {
  triggerAnimation: (status: 'processing' | 'completed', onComplete?: () => void) => void;
}

const StickerPackAnimationContext = createContext<
  StickerPackAnimationContextType | undefined
>(undefined);

interface StickerPackAnimationProviderProps {
  children: ReactNode;
}

export const StickerPackAnimationProvider: React.FC<
  StickerPackAnimationProviderProps
> = ({ children }) => {
  const { showAnimation, triggerAnimation } = useStickerPackAnimation();

  return (
    <StickerPackAnimationContext.Provider value={{ triggerAnimation }}>
      {children}
      <ConfettiAnimation show={showAnimation} />
    </StickerPackAnimationContext.Provider>
  );
};

export const useStickerPackAnimationContext =
  (): StickerPackAnimationContextType => {
    const context = useContext(StickerPackAnimationContext);
    if (context === undefined) {
      throw new Error(
        'useStickerPackAnimationContext must be used within a StickerPackAnimationProvider'
      );
    }
    return context;
  };
