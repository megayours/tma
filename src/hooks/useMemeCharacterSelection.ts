import { useMemo } from 'react';
import { useNFTSelection, type NFTSelectionState } from './useNFTSelection';
import type { MemeTemplateCharacter, MemeCharacterAssignment } from '@/types/meme';

interface UseMemeCharacterSelectionProps {
  characterCount: number;
  characters: MemeTemplateCharacter[];
  urlParams: Record<string, any>;
}

/**
 * Adapts useNFTSelection for meme character assignments
 * - Reuses NFT selection logic with min/max = characterCount
 * - Maps selectedTokens to MemeCharacterAssignment[] format
 * - Includes character metadata (labels) for display
 */
export function useMemeCharacterSelection({
  characterCount,
  characters,
  urlParams,
}: UseMemeCharacterSelectionProps) {
  // Use NFT selection with fixed min/max (all characters required)
  const selection = useNFTSelection({
    minTokens: characterCount,
    maxTokens: characterCount,
    urlParams,
  });

  // Map selectedTokens to character assignments for API
  const characterAssignments = useMemo((): MemeCharacterAssignment[] => {
    return selection.selectedTokens
      .map((token, index) =>
        token
          ? {
              slot_index: index,
              token: {
                id: token.id,
                contract: {
                  chain: token.contract.chain,
                  address: token.contract.address,
                },
              },
            }
          : null
      )
      .filter((a): a is MemeCharacterAssignment => a !== null);
  }, [selection.selectedTokens]);

  // Return selection state with character metadata and assignments
  return {
    ...selection,
    characters,
    characterAssignments,
  };
}

export type MemeCharacterSelectionState = ReturnType<
  typeof useMemeCharacterSelection
> & NFTSelectionState;
