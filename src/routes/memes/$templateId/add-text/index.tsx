import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useGetMemeTemplate, useGenerateMemeMutation } from '@/hooks/useMemes';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { createMemeParamsSchema } from '@/utils/memeUrlParams';
import { useMemeCharacterSelection } from '@/hooks/useMemeCharacterSelection';
import { useMemeTextInputs } from '@/hooks/useMemeTextInputs';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { MemeTextInput } from '@/components/Meme';

export const Route = createFileRoute('/memes/$templateId/add-text/')({
  validateSearch: createMemeParamsSchema(10, 10),
  component: AddMemeTextPage,
});

function AddMemeTextPage() {
  const { templateId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const search = Route.useSearch();

  const { data: template, isLoading: isLoadingTemplate } =
    useGetMemeTemplate(templateId);
  const generateMutation = useGenerateMemeMutation(session);

  // Reconstruct character assignments from URL
  const characterSelection = useMemeCharacterSelection({
    characterCount: template?.characters?.length || 1,
    characters: template?.characters || [],
    urlParams: search,
  });

  // Text inputs state
  const textInputs = useMemeTextInputs({
    textAnchors: template?.text_anchors || [],
    urlParams: search,
  });

  const handleGenerate = () => {
    if (!template || !characterSelection.canGenerate) {
      alert('Please select all required characters');
      return;
    }

    if (!textInputs.allTextsFilled) {
      alert('Please fill in all text fields');
      return;
    }

    generateMutation.mutate({
      templateId,
      characterAssignments: characterSelection.characterAssignments,
      texts: textInputs.textInputs,
    });
  };

  // Navigate on successful generation
  useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      navigate({
        to: '/memes/$templateId/processing/$memeId',
        params: {
          templateId,
          memeId: generateMutation.data.id,
        },
      });
    }
  }, [generateMutation.isSuccess, generateMutation.data, templateId, navigate]);

  // Show error on generation failure
  useEffect(() => {
    if (generateMutation.isError && generateMutation.error) {
      console.error('Generation failed:', generateMutation.error);
      alert(`Generation failed: ${generateMutation.error.message}`);
    }
  }, [generateMutation.isError, generateMutation.error]);

  if (isLoadingTemplate) {
    return <SpinnerFullPage text="Loading..." />;
  }

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Template not found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <div className="bg-tg-section-bg border-tg-section-separator border-b px-6 py-4">
          <h2 className="text-tg-text mb-1 text-lg font-semibold">
            Add Text to Meme
          </h2>
          <p className="text-tg-hint text-sm">
            Fill in the text for your meme
          </p>
        </div>

        {/* Content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {textInputs.textAnchors.map((anchor, index) => (
              <MemeTextInput
                key={anchor.anchor_index}
                anchor={anchor}
                value={textInputs.texts[index] || ''}
                onChange={text => textInputs.updateText(index, text)}
                maxLength={100}
              />
            ))}
          </div>

          {/* Preview Info */}
          {template.image_url && (
            <div className="mt-6">
              <h3 className="text-tg-text mb-2 font-semibold">
                Template Preview
              </h3>
              <img
                src={template.thumbnail_url || template.image_url}
                alt={template.name}
                className="rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <TelegramDualButtons
          mainButton={{
            text: generateMutation.isPending
              ? 'Generating...'
              : 'Generate Meme',
            onClick: handleGenerate,
            disabled:
              !textInputs.allTextsFilled ||
              !characterSelection.canGenerate ||
              generateMutation.isPending,
            loading: generateMutation.isPending,
            visible: true,
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
