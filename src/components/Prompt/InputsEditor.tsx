import { useState } from 'react';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useNFTSetsContext } from '@/contexts/NFTSetsContext';
import type { Prompt } from '../../types/prompt';
import { InputSelector } from './InputSelector';

export const InputsEditor = ({ prompt }: { prompt: Prompt }) => {
  // State to track whether we're in NFT modification mode
  const [isModifyingInputsEditor, setIsModifyingInputsEditor] = useState(false);

  // Use the NFT sets from the context
  const { nftSets, addNFTSet, canAddSet } = useNFTSetsContext();

  return (
    <div
      className="flex h-full flex-row flex-nowrap items-center overflow-x-auto px-4 scrollbar-hide min-w-0 gap-2"
      onClick={() =>
        !isModifyingInputsEditor &&
        setIsModifyingInputsEditor(!isModifyingInputsEditor)
      }
    >
      {nftSets.map((nftSet, index) => (
        <InputSelector
          key={index}
          nftSet={nftSet}
          isOpen={true}
          prompt={prompt}
          setIndex={index}
          onCloudClose={() => {
            setIsModifyingInputsEditor(false);
          }}
        />
      ))}
      {canAddSet && (
        <div
          style={{ maxWidth: 40 }}
          onClick={e => {
            e.stopPropagation(); // Prevent event bubbling to parent div
            addNFTSet();
          }}
        >
          <IoIosAddCircleOutline size={20} />
        </div>
      )}
    </div>
  );
};
