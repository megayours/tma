import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import type { Prompt } from '@/types/prompt';
import {
  Button,
  Divider,
  IconButton,
  Textarea,
} from '@telegram-apps/telegram-ui';
import { AddContentButton } from '../ui/AddContentButton';
import { IoSend } from 'react-icons/io5';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { InputsEditor } from './InputsEditor';
import { usePromptPreviewGeneration } from '@/hooks/usePromptPreviewGeneration';
import { useSession } from '@/auth/SessionProvider';
import { ContentPreviews } from './ContentPreview';

export const PromptEditor = ({
  prompt: initialPrompt,
}: {
  prompt: Prompt | null;
}) => {
  const { session } = useSession();
  const [promptText, setPromptText] = useState(
    initialPrompt?.versions?.[0]?.text ?? ''
  );
  const [prompt, setPrompt] = useState<Prompt | null>(initialPrompt);
  const [hasChanges, setHasChanges] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedVersion, setSelectedVersion] = useState(
    prompt?.versions?.[(prompt.versions?.length ?? 0) - 1]
  );

  // Custom hook for prompt generation logic
  const { isGenerating, generatePromptPreview } = usePromptPreviewGeneration({
    session,
    onSuccess: result => {
      console.log('Generation successful:', result);
      if (result.generated) {
        setHasChanges(false);
      }
    },
    onError: error => {
      console.error('Generation failed:', error);
      // Handle error here
    },
  });

  // Function to update prompt and track changes
  const updatePrompt = (updates: Partial<Prompt>) => {
    if (prompt) {
      setPrompt({ ...prompt, ...updates });
      setHasChanges(true);
    }
  };

  const handleGenerate = () => {
    const contentId = generatePromptPreview(
      promptText,
      prompt!,
      hasChanges,
      selectedVersion
    );
    console.log('Content ID:', contentId);
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
    <div className="keyboard-aware-container bg-tg-bg relative min-h-screen">
      {/* Main content area */}
      <div className="h-full pb-42">
        <div className="h-full">
          {/* Your main content goes here */}
          {selectedVersion && (
            <ContentPreviews
              prompt={prompt}
              selectedVersion={selectedVersion}
            />
          )}
        </div>
      </div>

      {/* Fixed bottom toolbar with smooth keyboard transitions */}
      <div className="mobile-input-container keyboard-aware bg-tg-secondary-bg border-tg-hint/20 safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50 border-t">
        <div id="custom-input-container"></div>
        <div className="h-12">
          <InputsEditor prompt={prompt} />
        </div>
        <Divider />
        <div className="flex flex-row items-center gap-2 px-2">
          <div className="flex items-center justify-center">
            <AddContentButton
              updatePrompt={updatePrompt}
              prompt={prompt}
              promptTextareaRef={promptTextareaRef}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <Textarea
              placeholder="Enter your prompt..."
              className="bg-tg-section-bg text-tg-text transition-all duration-200 focus:scale-[1.02]"
              ref={promptTextareaRef}
              value={promptText}
              onChange={e => {
                setHasChanges(true);
                setPromptText(e.target.value);
              }}
              disabled={isGenerating}
            />
          </div>
          <div className="">
            <Button
              mode="filled"
              size="m"
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              loading={isGenerating}
            >
              <IoSend className="text-tg-button-text" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
