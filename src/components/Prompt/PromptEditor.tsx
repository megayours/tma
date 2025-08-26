import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { Prompt } from '@/types/prompt';
import { Textarea } from '@telegram-apps/telegram-ui';
import { AddContentButton } from '../ui/AddContentButton';
import { IoSend } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export const PromptEditor = ({ prompt }: { prompt: Prompt | null }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptText, setPromptText] = useState('');

  const handleGenerate = async () => {
    if (!promptText.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Simulate generation process - replace with your actual API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Generated content for:', promptText);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Enhanced keyboard handling with Visual Viewport API
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight =
          window.innerHeight - window.visualViewport.height;
        const offsetY = keyboardHeight > 0 ? -keyboardHeight * 0.1 : 0; // Slight offset for better UX

        document.documentElement.style.setProperty(
          '--keyboard-offset',
          `${offsetY}px`
        );

        // Add smooth transition class
        const container = document.querySelector('.mobile-input-container');
        if (container) {
          container.classList.add('keyboard-aware');
        }
      }
    };

    // Fallback for browsers without Visual Viewport API
    const handleResize = () => {
      if (!window.visualViewport) {
        const currentHeight = window.innerHeight;
        const standardHeight = window.screen.height;
        const keyboardHeight = standardHeight - currentHeight;

        if (keyboardHeight > 100) {
          // Keyboard is likely open
          document.documentElement.style.setProperty(
            '--keyboard-offset',
            '-20px'
          );
        } else {
          document.documentElement.style.setProperty(
            '--keyboard-offset',
            '0px'
          );
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          handleViewportChange
        );
        window.visualViewport.removeEventListener(
          'scroll',
          handleViewportChange
        );
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  if (!prompt) return <div>Loading...</div>;

  return (
    <div className="keyboard-aware-container relative min-h-screen">
      {/* Main content area */}
      <div className="pb-20">{/* Your main content goes here */}</div>

      {/* Fixed bottom toolbar with smooth keyboard transitions */}
      <div className="mobile-input-container keyboard-aware bg-tg-secondary-bg border-tg-hint/20 safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50 border-t">
        <div className="flex flex-row items-center p-4">
          <div className="flex items-center justify-center">
            <AddContentButton />
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4">
            <Textarea
              placeholder="Enter your prompt..."
              className="transition-all duration-200 focus:scale-[1.02]"
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              className="bg-tg-button-secondary text-tg-button-accent-color-text hover:bg-tg-button-accent-color/80 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin" />
              ) : (
                <IoSend className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
