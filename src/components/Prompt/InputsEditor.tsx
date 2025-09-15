import { useState } from 'react';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { useNFTSetsContext } from '@/contexts/NFTSetsContext';
import type { Prompt } from '../../types/prompt';
import { InputSelector } from './InputSelector';

export const InputsEditor = ({ prompt }: { prompt: Prompt }) => {
  // State to track whether we're in NFT modification mode
  const [isModifyingInputsEditor, setIsModifyingInputsEditor] = useState(false);

  // Use the NFT sets from the context
  const { compulsoryNFTs, optionalNFTs, addNFTSet, canAddSet } = useNFTSetsContext();

  return (
    <div
      className="flex h-full flex-row flex-nowrap items-center overflow-x-auto px-4 scrollbar-hide min-w-0 gap-2"
      onClick={() =>
        !isModifyingInputsEditor &&
        setIsModifyingInputsEditor(!isModifyingInputsEditor)
      }
    >
      {compulsoryNFTs.map((compulsorySet, index) => (
        <InputSelector
          key={index}
          compulsoryNFTs={compulsorySet}
          optionalNFTs={optionalNFTs[index] || []}
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
