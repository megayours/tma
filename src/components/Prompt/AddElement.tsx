import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdAddCircleOutline } from 'react-icons/md';
import type { Prompt } from '../../types/prompt';

interface AddElementProps {
  prompt: Prompt;
  setIndex: number;
}

export const AddElement = ({ prompt, setIndex }: AddElementProps) => {
  const [showAddCloud, setShowAddCloud] = useState(false);

  // Handle add button click
  const handleAddClick = () => {
    setShowAddCloud(true);
  };

  // Handle click outside to close cloud
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`[data-cloud-index="add-${setIndex}"]`)) {
        setShowAddCloud(false);
      }
    };

    if (showAddCloud) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddCloud, setIndex]);

  return (
    <>
      {/* Larger plus button to add an nft to the set - styled like NFTItem */}
      <div 
        className="bg-tg-secondary-bg hover:bg-tg-section-separator flex h-8 flex-row items-center justify-center gap-2 rounded-full px-2 cursor-pointer transition-colors"
        onClick={handleAddClick}
      >
        <div className="flex items-center">
          <MdAddCircleOutline className="h-4 w-4" />
        </div>
        <span className="text-xs font-medium">Add</span>
      </div>

      {/* Add Cloud Portal */}
      {showAddCloud && (() => {
        const portalContainer = document.getElementById('custom-input-container');
        if (!portalContainer) return null;

        const addCloudContent = (
          <div
            className="bg-tg-bg border-tg-hint/20 relative min-h-16 overflow-y-auto rounded-lg border shadow-lg"
            style={{
              maxHeight: '60vh',
              minHeight: '64px',
              height: 'auto',
              overflow: 'auto',
              zIndex: 9999,
              position: 'relative',
              pointerEvents: 'auto',
              userSelect: 'auto',
            }}
            data-cloud-index={`add-${setIndex}`}
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-4">
              <div className="text-tg-text text-center text-lg font-medium mb-4">
                Add NFT to Set
              </div>
              <div className="text-tg-hint text-center text-sm">
                Placeholder for Add NFT functionality
              </div>
              <div className="text-tg-hint text-center text-xs mt-2">
                Prompt: {prompt.name}
              </div>
              <div className="text-tg-hint text-center text-xs">
                Set Index: {setIndex}
              </div>
            </div>
          </div>
        );

        return createPortal(addCloudContent, portalContainer);
      })()}
    </>
  );
};