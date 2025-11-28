import { useEffect, useState, useRef } from 'react';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import type { Contract } from '@/types/contract';
import { List, Button, Switch } from '@telegram-apps/telegram-ui';
import { TgInput } from '@/components/ui/forms/TgInput';
import { TgTextarea } from '@/components/ui/forms/TgTextarea';
import { TgSelect } from '@/components/ui/forms/TgSelect';
import type { UseMutationResult } from '@tanstack/react-query';
import { useModels } from '@/hooks/useModels';

import {
  IoPersonOutline,
  IoLayersOutline,
  IoStatsChartOutline,
  IoInformationCircleOutline,
  IoDocumentTextOutline,
  IoTrashOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { useDeletePromptMutation } from '@/hooks/usePrompts';
import { useSession } from '@/auth/SessionProvider';
import { useNavigate } from '@tanstack/react-router';
import { popup } from '@telegram-apps/sdk-react';
import { useSelectCommunity } from '../../contexts/SelectCommunityContext';

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
  const { session } = useSession();
  const navigate = useNavigate();
  const { models, isLoading: modelsLoading } = useModels();
  const { selectedCommunity, isLoading: communityIsLoading } =
    useSelectCommunity();
  const supportedCollections = selectedCommunity?.collections || [];

  const [deletingPromptId, setDeletingPromptId] = useState<number | null>(null);

  const deletePrompt = useDeletePromptMutation(session!, {
    onSuccess: () => {
      navigate({ to: '/profile/admin' });
    },
    onError: error => {
      console.error('Failed to delete prompt:', error);
    },
    onSettled: () => {
      setDeletingPromptId(null);
    },
  });

  // Map prompt types to capability types
  const getCapabilityType = (promptType: string): string => {
    switch (promptType) {
      case 'stickers':
        return 'image'; // stickers use image capability
      case 'animated_stickers':
        return 'video'; // animated stickers use video capability
      case 'images':
        return 'image';
      case 'videos':
        return 'video';
      default:
        return promptType;
    }
  };

  const filteredModels = models.filter(model =>
    model.capabilities.some(
      capability => capability.type === getCapabilityType(prompt.type!)
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

    const newPrompt = {
      ...prompt,
      model: initialModel,
    };

    // Only update editedPrompt if we don't have unsaved changes
    // This preserves user edits when the prompt is refetched (e.g., after generation)
    if (!hasChanges) {
      setEditedPrompt(newPrompt);
      setContractsError('');
    }
  }, [prompt, hasChanges]);

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

            // Prepare the prompt for saving
            // If all contracts are selected, send empty array; otherwise send selected contracts
            const allContractsSelected =
              supportedCollections &&
              currentPrompt.contracts.length === supportedCollections.length;

            console.log('Auto-save debug:', {
              currentContractsLength: currentPrompt.contracts.length,
              supportedCollectionsLength: supportedCollections?.length,
              allContractsSelected,
              contractsToSend: allContractsSelected
                ? []
                : currentPrompt.contracts,
            });

            const promptToSave = {
              ...currentPrompt,
              contracts: allContractsSelected ? [] : currentPrompt.contracts,
            };

            const updatedPrompt = await promptMutation.mutateAsync({
              prompt: promptToSave,
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
    setEditedPrompt(prev => {
      // Special handling for fields that exist at both prompt and version levels
      // Update both prompt-level and version[0]-level
      if (
        (field === 'model' || field === 'minTokens' || field === 'maxTokens') &&
        prev.versions &&
        prev.versions.length > 0
      ) {
        return {
          ...prev,
          [field]: value,
          versions: prev.versions.map((version, index) =>
            // Update the first version (version 0) with the new value
            index === 0 ? { ...version, [field]: value } : version
          ),
        };
      }
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  };

  // Handle immediate publication toggle
  const handlePublicationToggle = async (checked: boolean) => {
    if (!editedPrompt.id) return;

    console.log('Toggle clicked, new value:', checked);
    setIsPublishing(true);
    try {
      // If all contracts are selected, send empty array; otherwise send selected contracts
      const allContractsSelected =
        supportedCollections &&
        editedPrompt.contracts &&
        editedPrompt.contracts.length === supportedCollections.length;

      console.log('Publication toggle debug:', {
        currentContractsLength: editedPrompt.contracts?.length,
        supportedCollectionsLength: supportedCollections?.length,
        allContractsSelected,
        contractsToSend: allContractsSelected ? [] : editedPrompt.contracts,
      });

      await promptMutation.mutateAsync({
        prompt: {
          ...editedPrompt,
          published: checked ? 1 : 0, // Keep timestamp locally, API gets boolean
          contracts: allContractsSelected ? [] : editedPrompt.contracts,
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

  // Handle prompt deletion
  const handleDeletePrompt = async (promptId: number) => {
    // Show Telegram confirmation popup
    try {
      const result = await popup.open({
        title: 'Delete Prompt',
        message:
          'Are you sure you want to delete this prompt? This action cannot be undone.',
        buttons: [
          {
            id: 'delete',
            type: 'destructive',
            text: 'Delete',
          },
          {
            id: 'cancel',
            type: 'cancel',
          },
        ],
      });

      // If user confirmed deletion
      if (result === 'delete') {
        setDeletingPromptId(promptId);
        try {
          await deletePrompt.mutateAsync({ promptId });
          // Don't clear deletingPromptId here - let mutation onSettled callback handle it after refetch
        } catch (error) {
          console.error('Failed to delete prompt:', error);
          // Error case is handled by mutation onError callback, onSettled will still clear the state
        }
      }
    } catch (error) {
      console.error('Failed to show popup:', error);
      // Fallback: proceed with deletion if popup fails
      setDeletingPromptId(promptId);
      try {
        await deletePrompt.mutateAsync({ promptId });
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="scrollbar-hide z-50 flex h-screen w-full flex-col pb-60">
      {/* Scrollable Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <List className="bg-tg-secondary m-0 p-5">
          {/* Basic Information Section */}
          <div>
            <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
              Basic Information
            </h2>
            <TgInput
              header="Name"
              placeholder="Enter prompt name"
              value={editedPrompt.name || ''}
              onChange={e => updateField('name', e.target.value)}
            />
            <div className="relative">
              <TgTextarea
                header="Description"
                placeholder="Enter prompt description"
                value={editedPrompt.description || ''}
                onChange={e => {
                  const value = e.target.value;
                  // Only update if within character limit
                  if (value.length <= 100) {
                    updateField('description', value);
                  }
                }}
                rows={3}
                maxLength={100}
              />
              <div
                className={`mt-1 text-right text-xs ${
                  (editedPrompt.description || '').length >= 100
                    ? 'text-red-500'
                    : 'text-tg-hint'
                }`}
              >
                {(editedPrompt.description || '').length}/100
              </div>
            </div>
          </div>

          {/* Publication Status Section */}
          <div>
            <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
              Publication Status
            </h2>
            <div
              className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 ${editedPrompt.published ? 'border-l-green-500 bg-green-500/10' : 'border-l-orange-500 bg-orange-500/10'}`}
            >
              <div className="flex items-center justify-center">
                <IoInformationCircleOutline className="text-tg-hint h-6 w-6" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-tg-text font-semibold">
                  Status: {prompt.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-tg-hint text-sm">
                  {editedPrompt.published
                    ? `Published on ${new Date(editedPrompt.published * 1000).toLocaleDateString()}`
                    : 'This prompt is not yet published'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isPublishing ? (
                  <span className="text-tg-hint text-sm font-medium">
                    Updating...
                  </span>
                ) : (
                  <span
                    onClick={() =>
                      handlePublicationToggle(!editedPrompt.published)
                    }
                    className={`cursor-pointer text-sm font-medium hover:opacity-80 ${editedPrompt.published ? 'text-green-500' : 'text-tg-hint'}`}
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
            </div>
            <p className="text-tg-hint mt-2 text-sm">
              Control whether this prompt is published and available for use.
            </p>
          </div>

          {/* AI Model Settings Section */}
          <div>
            <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
              AI Model Settings
            </h2>
            <TgSelect
              header="Model"
              value={editedPrompt.model || ''}
              onChange={e => updateField('model', e.target.value)}
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
            </TgSelect>
            <TgInput
              header="Min Tokens"
              type="number"
              placeholder="Minimum tokens"
              value={editedPrompt.minTokens?.toString() || ''}
              onChange={e =>
                updateField('minTokens', parseInt(e.target.value) || 0)
              }
            />
            <TgInput
              header="Max Tokens"
              type="number"
              placeholder="Maximum tokens"
              value={editedPrompt.maxTokens?.toString() || ''}
              onChange={e =>
                updateField('maxTokens', parseInt(e.target.value) || 0)
              }
            />
            <p className="text-tg-hint mt-2 text-sm">
              Configure the AI model and token limits for generation.
            </p>
          </div>

          {/* Contracts Section */}
          <div>
            <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
              Contracts
            </h2>
            {communityIsLoading ? (
              <div className="bg-tg-section-bg text-tg-hint rounded-lg px-4 py-3 text-center">
                Loading contracts...
              </div>
            ) : (
              <>
                {supportedCollections && supportedCollections.length > 0 ? (
                  supportedCollections.map(contract => {
                    const contractKey = `${contract.chain}-${contract.address}`;
                    return (
                      <div
                        key={contractKey}
                        className="bg-tg-section-bg hover:bg-tg-secondary-bg flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                        onClick={() => handleContractToggle(contract)}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={contract.image}
                            alt={contract.name}
                            className="h-10 w-10 rounded-full"
                            onError={e => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/nfts/not-available.png';
                            }}
                          />
                          <div className="flex items-center justify-center">
                            <IoDocumentTextOutline className="text-tg-hint h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-tg-text font-medium">
                            {contract.name}
                          </div>
                          <div className="text-tg-hint text-sm">
                            {contract.chain} • {contract.address.slice(0, 6)}...
                            {contract.address.slice(-4)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-tg-section-bg text-tg-hint rounded-lg px-4 py-3 text-center">
                    No contracts available
                  </div>
                )}
              </>
            )}
            <p className="text-tg-hint mt-2 text-sm">
              {contractsError ||
                'Select which NFT contracts this prompt should work with.'}
            </p>
          </div>

          {/* Statistics & Info Section */}
          <div>
            <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
              Statistics & Info
            </h2>
            <div className="space-y-2">
              <div className="bg-tg-section-bg flex items-center justify-between rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <IoInformationCircleOutline className="text-tg-hint h-5 w-5" />
                  </div>
                  <span className="text-tg-text">Created</span>
                </div>
                <span className="text-tg-hint text-sm">
                  {editedPrompt.createdAt
                    ? new Date(
                        editedPrompt.createdAt * 1000
                      ).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
              <div className="bg-tg-section-bg flex items-center justify-between rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <IoLayersOutline className="text-tg-hint h-5 w-5" />
                  </div>
                  <span className="text-tg-text">Versions</span>
                </div>
                <span className="text-tg-hint text-sm">
                  {editedPrompt.versions?.length || 0}
                </span>
              </div>
              <div className="bg-tg-section-bg flex items-center justify-between rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <IoStatsChartOutline className="text-tg-hint h-5 w-5" />
                  </div>
                  <span className="text-tg-text">Usage Count</span>
                </div>
                <span className="text-tg-hint text-sm">
                  {editedPrompt.usageCount || 0}
                </span>
              </div>
              <div className="bg-tg-section-bg flex items-center justify-between rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <IoPersonOutline className="text-tg-hint h-5 w-5" />
                  </div>
                  <span className="text-tg-text">Selected NFTs</span>
                </div>
                <span className="text-tg-hint text-sm">
                  {selectedNFTs.length}
                </span>
              </div>
              <div className="bg-tg-section-bg flex items-center justify-between rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <IoInformationCircleOutline className="text-tg-hint h-5 w-5" />
                  </div>
                  <span className="text-tg-text">Last Used</span>
                </div>
                <span className="text-tg-hint text-sm">
                  {editedPrompt.lastUsed
                    ? new Date(
                        editedPrompt.lastUsed * 1000
                      ).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>
            <p className="text-tg-hint mt-2 text-sm">
              View prompt statistics and usage information.
            </p>
          </div>

          {/* Danger Zone Section */}
          <div>
            <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
              Danger Zone
            </h2>
            <div className="flex items-start gap-3 rounded-lg border-l-4 border-l-red-500 bg-red-500/10 px-4 py-3">
              <div className="flex items-center justify-center pt-1">
                <IoWarningOutline className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex w-full flex-1 flex-col gap-3">
                <div className="flex w-full flex-col">
                  <span className="font-semibold text-red-500">
                    Delete Prompt
                  </span>
                  <p className="text-tg-hint mt-1 text-sm break-words whitespace-normal">
                    This action cannot be undone. All data associated with this
                    prompt will be permanently deleted.
                  </p>
                </div>
                <Button
                  mode="filled"
                  size="s"
                  onClick={() => handleDeletePrompt(prompt.id!)}
                  loading={deletingPromptId === prompt.id}
                  disabled={deletingPromptId === prompt.id}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <div className="text-tg-button-text flex flex-row items-center">
                    <IoTrashOutline className="mr-2" />
                    Delete Prompt
                  </div>
                </Button>
              </div>
            </div>
            <p className="text-tg-hint mt-2 text-sm">
              Deleting a prompt is permanent and cannot be undone.
            </p>
          </div>
        </List>
      </div>
    </div>
  );
};
