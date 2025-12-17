import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Prompt } from '@/types/prompt';
import type { Token } from '@/types/response';
import { List, Button, Switch } from '@telegram-apps/telegram-ui';
import { TgInput } from '@/components/ui/forms/TgInput';
import { TgTextarea } from '@/components/ui/forms/TgTextarea';
import { TgSelect } from '@/components/ui/forms/TgSelect';
import type { UseMutationResult } from '@tanstack/react-query';
import { useModels } from '@/hooks/useModels';
import { TelegramMainButton } from '@/components/TelegramMainButton';

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

type PromptFormData = {
  name: string;
  description: string;
  model: string;
  tokens: number; // Combined field for both minTokens and maxTokens
  published: number;
};

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

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
    watch,
    setValue,
  } = useForm<PromptFormData>({
    defaultValues: {
      name: prompt.name || '',
      description: prompt.description || '',
      model: prompt.versions?.[0]?.model || prompt.model || '',
      tokens: prompt.versions?.[0]?.maxTokens || prompt.maxTokens || 0,
      published: prompt.published || 0,
    },
  });

  // Keep state for UI elements
  const [isPublishing, setIsPublishing] = useState(false);

  // Update form when prompt prop changes (e.g., after mutation)
  useEffect(() => {
    if (!isDirty) {
      reset({
        name: prompt.name || '',
        description: prompt.description || '',
        model: prompt.versions?.[0]?.model || prompt.model || '',
        tokens: prompt.versions?.[0]?.maxTokens || prompt.maxTokens || 0,
        published: prompt.published || 0,
      });
    }
  }, [prompt, isDirty, reset]);

  // Handle form submission
  const onSubmit = async (formData: PromptFormData) => {
    if (!prompt.id) return;

    try {
      // Prepare prompt with dual-level fields (prompt + version[0])
      const promptToSave: Prompt = {
        ...prompt,
        name: formData.name,
        description: formData.description,
        model: formData.model,
        minTokens: formData.tokens,
        maxTokens: formData.tokens,
        published: formData.published,
        versions: prompt.versions?.map((v, i) =>
          i === 0
            ? {
                ...v,
                model: formData.model,
                minTokens: formData.tokens,
                maxTokens: formData.tokens,
              }
            : v
        ),
      };

      await promptMutation.mutateAsync({ prompt: promptToSave });

      // Reset form dirty state with new values
      reset(formData);
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  // Handle immediate publication toggle
  const handlePublicationToggle = async (checked: boolean) => {
    if (!prompt.id) return;

    setIsPublishing(true);
    try {
      const currentFormData = watch(); // Get current form values

      await promptMutation.mutateAsync({
        prompt: {
          ...prompt,
          ...currentFormData,
          published: checked ? 1 : 0,
          versions: prompt.versions?.map((v, i) =>
            i === 0
              ? {
                  ...v,
                  model: currentFormData.model,
                  minTokens: currentFormData.tokens,
                  maxTokens: currentFormData.tokens,
                }
              : v
          ),
        },
      });

      // Update form value without marking as dirty
      setValue('published', checked ? 1 : 0, { shouldDirty: false });

      // The query will be invalidated and refetched automatically
    } catch (error) {
      console.error('Failed to update publication status:', error);
    } finally {
      setIsPublishing(false);
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
    <>
      <div className="scrollbar-hide z-50 flex h-screen w-full flex-col">
        {/* Scrollable Content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto pb-36">
          <List className="bg-tg-secondary m-0 p-5">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
                Basic Information
              </h2>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TgInput
                    header="Name"
                    placeholder="Enter prompt name"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                rules={{ maxLength: 100 }}
                render={({ field }) => (
                  <div className="relative">
                    <TgTextarea
                      header="Description"
                      placeholder="Enter prompt description"
                      value={field.value}
                      onChange={e => {
                        const value = e.target.value;
                        // Only update if within character limit
                        if (value.length <= 100) {
                          field.onChange(e);
                        }
                      }}
                      rows={3}
                      maxLength={100}
                    />
                    <div
                      className={`mt-1 text-right text-xs ${
                        field.value.length >= 100
                          ? 'text-red-500'
                          : 'text-tg-hint'
                      }`}
                    >
                      {field.value.length}/100
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Publication Status Section */}
            <div>
              <h2 className="text-tg-section-header-text-color mb-3 text-sm font-medium tracking-wide uppercase">
                Publication Status
              </h2>
              <div
                className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 ${watch('published') ? 'border-l-green-500 bg-green-500/10' : 'border-l-orange-500 bg-orange-500/10'}`}
              >
                <div className="flex items-center justify-center">
                  <IoInformationCircleOutline className="text-tg-hint h-6 w-6" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-tg-text font-semibold">
                    Status: {watch('published') ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-tg-hint text-sm">
                    {watch('published')
                      ? `Published on ${new Date(watch('published') * 1000).toLocaleDateString()}`
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
                        handlePublicationToggle(!watch('published'))
                      }
                      className={`cursor-pointer text-sm font-medium hover:opacity-80 ${watch('published') ? 'text-green-500' : 'text-tg-hint'}`}
                    >
                      {watch('published') ? 'Published' : 'Draft'}
                    </span>
                  )}
                  <Switch
                    checked={!!watch('published')}
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
              <Controller
                name="model"
                control={control}
                render={({ field }) => (
                  <TgSelect
                    header="Model"
                    value={field.value}
                    onChange={field.onChange}
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
                )}
              />
              <Controller
                name="tokens"
                control={control}
                render={({ field }) => (
                  <TgInput
                    header="Number of input assets"
                    type="number"
                    placeholder="Number of tokens"
                    value={field.value.toString()}
                    onChange={e =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                )}
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
                          className="bg-tg-section-bg mb-2 flex items-center gap-3 rounded-lg px-4 py-3"
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
                              {contract.chain} • {contract.address.slice(0, 6)}
                              ...
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
                Collections associated with this prompt.
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
                    {prompt.createdAt
                      ? new Date(prompt.createdAt * 1000).toLocaleDateString()
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
                    {prompt.versions?.length || 0}
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
                    {prompt.usageCount || 0}
                  </span>
                </div>
                <div className="bg-tg-section-bg flex items-center justify-between rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                      <IoPersonOutline className="text-tg-hint h-5 w-5" />
                    </div>
                    <span className="text-tg-text">Selected Characters</span>
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
                    {prompt.lastUsed
                      ? new Date(prompt.lastUsed * 1000).toLocaleDateString()
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
                      This action cannot be undone. All data associated with
                      this prompt will be permanently deleted.
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

      {/* Telegram Main Button for Close */}
      <TelegramMainButton
        text="Save Changes"
        visible={isDirty}
        disabled={!isDirty || isSubmitting}
        loading={isSubmitting || promptMutation.isPending}
        onClick={handleSubmit(onSubmit)}
      />
    </>
  );
};
