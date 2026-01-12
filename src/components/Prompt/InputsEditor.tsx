import { useState, useEffect } from 'react';
import { useNFTSet } from '@/hooks/useNFTSet';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import type { Prompt } from '../../types/prompt';
import { NFTItem } from './NFTItem';
import { AddElement } from './AddElement';
import { IoIosAddCircleOutline } from 'react-icons/io';

/**
 * InputsEditor component
 * Manages and renders NFT inputs for prompt generation
 * Handles NFT selection, modification, and click state management
 */
export const InputsEditor = ({ prompt }: { prompt: Prompt }) => {
  // State to track whether we're in NFT modification mode
  const [isModifyingInputsEditor, setIsModifyingInputsEditor] = useState(false);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  // Get community data for NFT initialization
  const { defaultCollection, selectedCommunity } = useSelectCommunity();
  const allCollections = selectedCommunity?.collections;

  // Use the simplified single NFT set hook
  const {
    compulsoryNFTs,
    optionalNFTs,
    updateCompulsoryNFT,
    updateOptionalNFT,
    addOptionalNFT,
    removeOptionalNFT,
    addCompulsoryNFT,
    removeCompulsoryNFT,
    maxOptionalTokens,
  } = useNFTSet(prompt, defaultCollection, allCollections);

  // Enhanced onCloudClose that resets clicked state
  const handleCloudClose = () => {
    setClickedIndex(null);
    setIsModifyingInputsEditor(false);
  };

  // Handle click on NFT items
  const handleClick = (index: number) => {
    // Remove focus from any active textarea to prevent keyboard from opening
    if (document.activeElement instanceof HTMLTextAreaElement) {
      document.activeElement.blur();
    }
    setClickedIndex(index);
  };

  // Handle click outside to close NFT cloud tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Close if clicking outside any cloud, or if clicking inside the add cloud
      if (!target.closest('.nft-cloud') || target.closest('.add-cloud')) {
        setClickedIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="scrollbar-hide flex h-full min-w-0 flex-row flex-nowrap items-center gap-2 overflow-x-auto px-4"
      onClick={() =>
        !isModifyingInputsEditor &&
        setIsModifyingInputsEditor(!isModifyingInputsEditor)
      }
    >
      <div className="flex h-12 flex-shrink-0 flex-row items-center gap-1 rounded-full">
        {/* Render compulsory NFT items */}
        {compulsoryNFTs.map((token, index) => (
          <NFTItem
            key={`compulsory-${index}`}
            token={token}
            index={index}
            pressedIndex={clickedIndex}
            onPress={handleClick}
            prompt={prompt}
            onCloudClose={handleCloudClose}
            isCompulsory={true}
            onRemove={() => removeCompulsoryNFT(index)}
            updateCompulsoryNFT={updateCompulsoryNFT}
            updateOptionalNFT={updateOptionalNFT}
          />
        ))}

        {/* Render optional NFT items */}
        {optionalNFTs.map((token, index) => (
          <NFTItem
            key={`optional-${index}`}
            token={token}
            index={index}
            pressedIndex={clickedIndex}
            onPress={handleClick}
            prompt={prompt}
            onCloudClose={handleCloudClose}
            isCompulsory={false}
            onRemove={() => removeOptionalNFT(index)}
            updateCompulsoryNFT={updateCompulsoryNFT}
            updateOptionalNFT={updateOptionalNFT}
          />
        ))}

        {/* Add Element Component for optional NFTs */}
        <AddElement
          prompt={prompt}
          addOptionalNFT={addOptionalNFT}
          optionalNFTs={optionalNFTs}
          maxOptionalTokens={maxOptionalTokens}
        />
        <div
          style={{ maxWidth: 40 }}
          onClick={e => {
            e.stopPropagation(); // Prevent event bubbling to parent div
          }}
        ></div>
        <div
          className="flex cursor-pointer justify-center"
          onClick={e => {
            e.stopPropagation(); // Prevent event bubbling to parent div
            addCompulsoryNFT();
          }}
        >
          <IoIosAddCircleOutline size={20} />
        </div>
      </div>
    </div>
  );
};
