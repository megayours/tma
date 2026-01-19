import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useGetSupportedCollections } from '@/hooks/useCollections';
import { useGetMemeTemplate, useGenerateMemeMutation } from '@/hooks/useMemes';
import { useSession } from '@/auth/SessionProvider';
import { SpinnerFullPage } from '@/components/ui';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { createMemeParamsSchema } from '@/utils/memeUrlParams';
import { NFTSelectionPageUI } from '@/components/NFT/flows';
import { useMemeCharacterSelection } from '@/hooks/useMemeCharacterSelection';
import { useMemeTextInputs } from '@/hooks/useMemeTextInputs';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { MemeTextInput } from '@/components/Meme';

export const Route = createFileRoute(
  '/memes/$templateId/select-characters/'
)({
  validateSearch: createMemeParamsSchema(10, 10),
  component: SelectCharactersPage,
});

function SelectCharactersPage() {
  const { templateId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const search = Route.useSearch();

  const { data: template, isLoading: isLoadingTemplate } =
    useGetMemeTemplate(templateId);
  const { data: collections } = useGetSupportedCollections();
  const generateMutation = useGenerateMemeMutation(session);

  const selection = useMemeCharacterSelection({
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
    if (!template || !selection.canGenerate) {
      alert('Please select all required characters to continue');
      return;
    }

    // Check if text fields are required and filled
    const hasTextAnchors = template.text_anchors && template.text_anchors.length > 0;
    if (hasTextAnchors && !textInputs.allTextsFilled) {
      alert('Please fill in all text fields');
      return;
    }

    generateMutation.mutate({
      templateId,
      characterAssignments: selection.characterAssignments,
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

  if (isLoadingTemplate || selection.isLoading) {
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

  // Build button config
  const hasTextAnchors = template && template.text_anchors && template.text_anchors.length > 0;
  const isButtonDisabled =
    !selection.canGenerate ||
    (hasTextAnchors && !textInputs.allTextsFilled) ||
    generateMutation.isPending;

  const mainButton = {
    text: generateMutation.isPending ? 'Generating...' : 'Generate Meme',
    onClick: handleGenerate,
    disabled: isButtonDisabled,
    loading: generateMutation.isPending,
    visible: true,
  };

  const hasTextAnchorsToShow =
    template.text_anchors && template.text_anchors.length > 0;
  const characterCount = template.characters?.length || 0;
  const textAnchorCount = template.text_anchors?.length || 0;

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        {/* Template Info Header */}
        <div className="bg-tg-section-bg border-tg-section-separator border-b px-6 py-4">
          <h2 className="text-tg-text mb-1 text-lg font-semibold">
            {template.name}
          </h2>
          <p className="text-tg-hint text-sm">
            Select {characterCount} character
            {characterCount > 1 ? 's' : ''}
            {hasTextAnchorsToShow &&
              ` and add ${textAnchorCount} text${textAnchorCount > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto">
          <NFTSelectionPageUI
            maxTokens={characterCount}
            collections={collections}
            selectionState={selection}
          />

          {/* Text Inputs Section */}
          {hasTextAnchorsToShow && (
            <div className="border-tg-section-separator border-t p-6">
              <h3 className="text-tg-text mb-4 text-lg font-semibold">
                Add Text to Meme
              </h3>
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
            </div>
          )}
        </div>

        <TelegramDualButtons mainButton={mainButton} />
      </div>
    </ProtectedRoute>
  );
}
