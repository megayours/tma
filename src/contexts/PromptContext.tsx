import { createContext, useContext } from 'react';
import type { Prompt } from '@/types/prompt';

// Define the context type
interface PromptContextType {
  prompt: Prompt;
  onPromptUpdate?: (updatedPrompt: Prompt) => void;
}

// Create React Context
export const PromptContext = createContext<PromptContextType | null>(null);

// Context hook
export const usePromptContext = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
};
