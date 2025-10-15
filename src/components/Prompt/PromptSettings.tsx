import { useEffect, useState, useRef } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import type { Contract } from '@/types/contract';
import {
  Input,
  Textarea,
  Select,
  List,
  Section,
  Cell,
  IconContainer,
  Checkbox,
  Button,
  Switch,
} from '@telegram-apps/telegram-ui';
import type { UseMutationResult } from '@tanstack/react-query';
import { useModels } from '@/hooks/useModels';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import {
  IoPersonOutline,
  IoLayersOutline,
  IoStatsChartOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
} from 'react-icons/io5';

interface PromptSettingsProps {
  prompt: Prompt;
  selectedNFTs: Token[];
  isOpen: boolean;
  promptMutation: UseMutationResult<Prompt, Error, { prompt: Prompt }, unknown>;
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
  promptMutation,
}: PromptSettingsProps) => {
  const { models, isLoading: modelsLoading } = useModels();
  const { data: supportedCollections, isLoading: collectionsLoading } =
    useGetSupportedCollections();
  const filteredModels = models.filter(model =>
    model.capabilities.some(
      capability => capability.type === prompt.type!.slice(0, -1)
    )
  );

  // Local state for form fields
  const [editedPrompt, setEditedPrompt] = useState<Prompt>(() => {
    // Set the model from version[0] if available, otherwise use prompt.model
    const versionZeroModel = prompt.versions?.[0]?.model;
    const initialModel = versionZeroModel || prompt.model;

    return {
      ...prompt,
      model: initialModel,
    };
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(
    new Set()
  );
  const [contractsError, setContractsError] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState(false);
  const prevIsOpen = useRef(isOpen);

  // Create a stable reference to the latest values
  const latestValues = useRef({ hasChanges, editedPrompt });
  latestValues.current = { hasChanges, editedPrompt };

  // Update local state when prompt prop changes
  useEffect(() => {
    // Set the model from version[0] if available, otherwise use prompt.model
    const versionZeroModel = prompt.versions?.[0]?.model;
    const initialModel = versionZeroModel || prompt.model;

    setEditedPrompt({
      ...prompt,
      model: initialModel,
    });
    setHasChanges(false);
    setContractsError('');
  }, [prompt]);

  // Initialize selected contracts when supportedCollections loads
  useEffect(() => {
    if (!supportedCollections) return;

    const contractKeys = new Set<string>();

    // If prompt.contracts is empty/undefined, select all supported contracts
    if (!prompt.contracts || prompt.contracts.length === 0) {
      supportedCollections.forEach(collection => {
        contractKeys.add(`${collection.chain}-${collection.address}`);
      });
      // Also update the editedPrompt with all contracts
      const allContracts: Contract[] = supportedCollections.map(collection => ({
        chain: collection.chain,
        address: collection.address,
        name: collection.name,
      }));
      setEditedPrompt(prev => ({ ...prev, contracts: allContracts }));
    } else {
      // Otherwise, only select the contracts specified in the prompt
      prompt.contracts.forEach(contract => {
        contractKeys.add(`${contract.chain}-${contract.address}`);
      });
    }

    setSelectedContracts(contractKeys);
  }, [supportedCollections, prompt.contracts]);

  // Handle auto-save when settings close
  useEffect(() => {
    // Only trigger auto-save when isOpen changes from true to false
    if (prevIsOpen.current && !isOpen && !promptMutation.isPending) {
      const { hasChanges: currentHasChanges, editedPrompt: currentPrompt } =
        latestValues.current;

      if (currentHasChanges && currentPrompt.id) {
        const autoSave = async () => {
          try {
            // Validate contracts before saving
            if (
              !currentPrompt.contracts ||
              currentPrompt.contracts.length === 0
            ) {
              setContractsError('At least one contract must be selected');
              return;
            }

            const updatedPrompt = await promptMutation.mutateAsync({
              prompt: currentPrompt,
            });
            if (updatedPrompt) {
              setHasChanges(false);
              // The query will be invalidated and refetched automatically
            }
          } catch (error) {
            console.error('Failed to auto-save prompt:', error);
          }
        };
        autoSave();
      }
    }

    // Update the previous isOpen value
    prevIsOpen.current = isOpen;
  }, [isOpen, promptMutation]); // Only depend on isOpen and promptMutation

  // Handle field updates
  const updateField = (field: keyof Prompt, value: any) => {
    setEditedPrompt(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle immediate publication toggle
  const handlePublicationToggle = async (checked: boolean) => {
    if (!editedPrompt.id) return;

    console.log('Toggle clicked, new value:', checked);
    setIsPublishing(true);
    try {
      await promptMutation.mutateAsync({
        prompt: {
          ...editedPrompt,
          published: checked ? 1 : 0, // Keep timestamp locally, API gets boolean
        },
      });

      // Update local state immediately for UI responsiveness
      setEditedPrompt(prev => ({ ...prev, published: checked ? 1 : 0 }));

      // The query will be invalidated and refetched automatically
    } catch (error) {
      console.error('Failed to update publication status:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle contract selection changes
  const handleContractToggle = (contract: {
    chain: string;
    address: string;
    name: string;
  }) => {
    const contractKey = `${contract.chain}-${contract.address}`;
    const newSelectedContracts = new Set(selectedContracts);

    if (newSelectedContracts.has(contractKey)) {
      newSelectedContracts.delete(contractKey);
    } else {
      newSelectedContracts.add(contractKey);
    }

    setSelectedContracts(newSelectedContracts);

    // Update the edited prompt with the new contracts list
    const updatedContracts: Contract[] = [];
    if (supportedCollections) {
      supportedCollections.forEach(collection => {
        const key = `${collection.chain}-${collection.address}`;
        if (newSelectedContracts.has(key)) {
          updatedContracts.push({
            chain: collection.chain,
            address: collection.address,
            name: collection.name,
          });
        }
      });
    }

    setEditedPrompt(prev => ({ ...prev, contracts: updatedContracts }));
    setHasChanges(true);

    // Clear any existing error when user makes changes
    if (contractsError) {
      setContractsError('');
    }
  };

  // Handle select all contracts
  const handleSelectAllContracts = () => {
    if (!supportedCollections) return;

    const allContractKeys = new Set<string>();
    const allContracts: Contract[] = [];

    supportedCollections.forEach(collection => {
      const key = `${collection.chain}-${collection.address}`;
      allContractKeys.add(key);
      allContracts.push({
        chain: collection.chain,
        address: collection.address,
        name: collection.name,
      });
    });

    setSelectedContracts(allContractKeys);
    setEditedPrompt(prev => ({ ...prev, contracts: allContracts }));
    setHasChanges(true);

    // Clear any existing error
    if (contractsError) {
      setContractsError('');
    }
  };

  // Handle unselect all contracts
  const handleUnselectAllContracts = () => {
    setSelectedContracts(new Set());
    setEditedPrompt(prev => ({ ...prev, contracts: [] }));
    setHasChanges(true);
  };

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

          {/* Publication Status Section */}
          <Section
            header="Publication Status"
            footer="Control whether this prompt is published and available for use."
          >
            <Cell
              before={
                <IconContainer>
                  <IoInformationCircleOutline />
                </IconContainer>
              }
              after={
                <div className="flex items-center gap-2">
                  {isPublishing ? (
                    <span className="text-tg-hint text-sm font-medium">
                      Updating...
                    </span>
                  ) : (
                    <span
                      className={`text-sm font-medium ${editedPrompt.published ? 'text-green-500' : 'text-tg-hint'}`}
                    >
                      {editedPrompt.published ? 'Published' : 'Draft'}
                    </span>
                  )}
                  <Switch
                    checked={!!editedPrompt.published}
                    disabled={isPublishing}
                    onChange={e => handlePublicationToggle(e.target.checked)}
                  />
                </div>
              }
              className={`border-l-4 ${editedPrompt.published ? 'border-l-green-500 bg-green-50/10' : 'border-l-orange-500 bg-orange-50/10'}`}
            >
              <div className="flex flex-col">
                <span className="font-semibold">
                  Publication Status {prompt.published}
                </span>
                <span className="text-tg-hint text-sm">
                  {editedPrompt.published
                    ? `Published on ${new Date(editedPrompt.published * 1000).toLocaleDateString()}`
                    : 'This prompt is not yet published'}
                </span>
              </div>
            </Cell>
          </Section>

          {/* AI Model Settings Section */}
          <Section
            header="AI Model Settings"
            footer="Configure the AI model and token limits for generation."
          >
            <Cell
              before={
                <IconContainer>
                  <IoLayersOutline />
                </IconContainer>
              }
            >
              <Select
                value={editedPrompt.model || ''}
                onChange={e => updateField('model', e.target.value)}
                className="w-full"
                disabled={modelsLoading}
              >
                <option value="">
                  {modelsLoading ? 'Loading models...' : 'Select a model'}
                </option>
                {filteredModels
                  .filter(model => model.isEnabled)
                  .map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
              </Select>
            </Cell>
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

          {/* Contracts Section */}
          <Section
            header="Contracts"
            footer={
              contractsError ||
              'Select which NFT contracts this prompt should work with.'
            }
          >
            {collectionsLoading ? (
              <Cell>Loading contracts...</Cell>
            ) : (
              <>
                {supportedCollections && supportedCollections.length > 0 && (
                  <div className="mb-4 flex gap-2">
                    <Button
                      size="s"
                      mode="outline"
                      onClick={handleSelectAllContracts}
                    >
                      Select All
                    </Button>
                    <Button
                      size="s"
                      mode="outline"
                      onClick={handleUnselectAllContracts}
                    >
                      Unselect All
                    </Button>
                  </div>
                )}
                {supportedCollections && supportedCollections.length > 0 ? (
                  supportedCollections.map(contract => {
                    const contractKey = `${contract.chain}-${contract.address}`;
                    const isSelected = selectedContracts.has(contractKey);
                    return (
                      <Cell
                        key={contractKey}
                        before={
                          <div className="flex items-center">
                            <img
                              src={contract.image}
                              alt={contract.name}
                              className="mr-3 h-8 w-8 rounded-full"
                              onError={e => {
                                const img = e.target as HTMLImageElement;
                                img.src = '/nfts/not-available.png';
                              }}
                            />
                            <IconContainer>
                              <IoDocumentTextOutline />
                            </IconContainer>
                          </div>
                        }
                        after={
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleContractToggle(contract)}
                          />
                        }
                        onClick={() => handleContractToggle(contract)}
                      >
                        <div>
                          <div className="font-medium">{contract.name}</div>
                          <div className="text-sm text-gray-500">
                            {contract.chain} • {contract.address.slice(0, 6)}...
                            {contract.address.slice(-4)}
                          </div>
                        </div>
                      </Cell>
                    );
                  })
                ) : (
                  <Cell>No contracts available</Cell>
                )}
              </>
            )}
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
                  ? new Date(editedPrompt.createdAt * 1000).toLocaleDateString()
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
                  ? new Date(editedPrompt.lastUsed * 1000).toLocaleDateString()
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
