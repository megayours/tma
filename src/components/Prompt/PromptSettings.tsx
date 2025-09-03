import { useEffect, useRef, useState } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import {
  Input,
  Textarea,
  Select,
  List,
  Section,
  Cell,
  IconContainer,
} from '@telegram-apps/telegram-ui';
import { usePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import {
  IoPersonOutline,
  IoLayersOutline,
  IoStatsChartOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';

interface PromptSettingsProps {
  prompt: Prompt;
  selectedNFTs: Token[];
  isOpen: boolean;
  onPromptUpdate?: (updatedPrompt: Prompt) => void;
}

/**
 * PromptSettings component that displays prompt settings in a dropdown/popup.
 * This component is designed to be used within a TopBar or similar container.
 *
 * @param prompt - The prompt object containing prompt data
 * @param selectedNFTs - Array of selected NFT tokens
 * @param isOpen - Whether the settings popup is open
 */
export const PromptSettings = ({
  prompt,
  selectedNFTs,
  isOpen,
  onPromptUpdate,
}: PromptSettingsProps) => {
  const { session } = useSession();
  const promptMutation = usePromptMutation(session);

  // Local state for form fields
  const [editedPrompt, setEditedPrompt] = useState<Prompt>(prompt);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when prompt prop changes
  useEffect(() => {
    setEditedPrompt(prompt);
    setHasChanges(false);
  }, [prompt]);

  // Handle auto-save when settings close
  useEffect(() => {
    // If settings are closing (isOpen becomes false) and we have changes, auto-save
    if (!isOpen && hasChanges && editedPrompt.id) {
      const autoSave = async () => {
        try {
          const updatedPrompt = await promptMutation.mutateAsync({
            prompt: editedPrompt,
          });
          if (updatedPrompt) {
            setHasChanges(false);
            onPromptUpdate?.(updatedPrompt);
          }
        } catch (error) {
          console.error('Failed to auto-save prompt:', error);
        }
      };
      autoSave();
    }
  }, [isOpen, hasChanges, editedPrompt, promptMutation, onPromptUpdate]);

  // Handle field updates
  const updateField = (field: keyof Prompt, value: any) => {
    setEditedPrompt(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Type options for select
  const typeOptions = [
    { value: 'images', label: 'Images' },
    { value: 'videos', label: 'Videos' },
    { value: 'stickers', label: 'Stickers' },
    { value: 'animated_stickers', label: 'Animated Stickers' },
    { value: 'gifs', label: 'GIFs' },
  ];

  if (!isOpen) return null;

  return (
    <div className="z-40 flex h-screen w-full flex-col bg-[var(--tgui--secondary_bg_color)] pb-20">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-center px-5 py-4">
        <img
          src={editedPrompt.images?.[0]}
          alt="Prompt Image"
          className="h-10 w-10 rounded-full"
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <List className="m-0 bg-transparent p-5">
          {/* Basic Information Section */}
          <Section
            header="Basic Information"
            footer="Configure the basic properties of your prompt including name and description."
          >
            <Input
              header="Name"
              placeholder="Enter prompt name"
              value={editedPrompt.name || ''}
              onChange={e => updateField('name', e.target.value)}
            />
            <Textarea
              header="Description"
              placeholder="Enter prompt description"
              value={editedPrompt.description || ''}
              onChange={e => updateField('description', e.target.value)}
              rows={3}
            />
          </Section>

          {/* Content Configuration Section */}
          <Section
            header="Content Configuration"
            footer="Set up the content type and main prompt text for generation."
          >
            <Cell
              before={
                <IconContainer>
                  <IoLayersOutline />
                </IconContainer>
              }
            >
              <Select
                value={editedPrompt.type || 'images'}
                onChange={e => updateField('type', e.target.value)}
                className="w-full"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Cell>
            <Textarea
              header="Prompt Text"
              placeholder="Enter the main prompt text"
              value={editedPrompt.prompt || ''}
              onChange={e => updateField('prompt', e.target.value)}
              rows={4}
            />
          </Section>

          {/* AI Model Settings Section */}
          <Section
            header="AI Model Settings"
            footer="Configure the AI model and token limits for generation."
          >
            <Input
              header="Model"
              placeholder="AI model (e.g., gpt-4, claude-3)"
              value={editedPrompt.model || ''}
              onChange={e => updateField('model', e.target.value)}
            />
            <Input
              header="Min Tokens"
              type="number"
              placeholder="Minimum tokens"
              value={editedPrompt.minTokens?.toString() || ''}
              onChange={e =>
                updateField('minTokens', parseInt(e.target.value) || 0)
              }
            />
            <Input
              header="Max Tokens"
              type="number"
              placeholder="Maximum tokens"
              value={editedPrompt.maxTokens?.toString() || ''}
              onChange={e =>
                updateField('maxTokens', parseInt(e.target.value) || 0)
              }
            />
          </Section>

          {/* Statistics & Info Section */}
          <Section
            header="Statistics & Info"
            footer="View prompt statistics and usage information."
          >
            <Cell
              before={
                <IconContainer>
                  <IoInformationCircleOutline />
                </IconContainer>
              }
              after={
                editedPrompt.createdAt
                  ? new Date(editedPrompt.createdAt).toLocaleDateString()
                  : 'Unknown'
              }
            >
              Created
            </Cell>
            <Cell
              before={
                <IconContainer>
                  <IoLayersOutline />
                </IconContainer>
              }
              after={editedPrompt.versions?.length || 0}
            >
              Versions
            </Cell>
            <Cell
              before={
                <IconContainer>
                  <IoStatsChartOutline />
                </IconContainer>
              }
              after={editedPrompt.usageCount || 0}
            >
              Usage Count
            </Cell>
            <Cell
              before={
                <IconContainer>
                  <IoPersonOutline />
                </IconContainer>
              }
              after={selectedNFTs.length}
            >
              Selected NFTs
            </Cell>
            <Cell
              before={
                <IconContainer>
                  <IoInformationCircleOutline />
                </IconContainer>
              }
              after={
                editedPrompt.lastUsed
                  ? new Date(editedPrompt.lastUsed).toLocaleDateString()
                  : 'Never'
              }
            >
              Last Used
            </Cell>
          </Section>
        </List>
      </div>
    </div>
  );
};
