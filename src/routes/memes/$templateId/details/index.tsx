import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useGetMemeTemplate } from '@/hooks/useMemes';
import { SpinnerFullPage } from '@/components/ui';
import { TelegramDualButtons } from '@/components/TelegramDualButtons';
import { MemeTemplatePreview } from '@/components/Meme';

export const Route = createFileRoute('/memes/$templateId/details/')({
  component: MemeTemplateDetailsPage,
});

function MemeTemplateDetailsPage() {
  const { templateId } = Route.useParams();
  const navigate = useNavigate();

  const { data: template, isLoading } = useGetMemeTemplate(templateId);

  if (isLoading) {
    return <SpinnerFullPage text="Loading template..." />;
  }

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="text-tg-text mb-2 text-xl font-bold">
            Template not found
          </h2>
          <p className="text-tg-hint mb-4">
            This template doesn't exist or has been removed
          </p>
          <button
            onClick={() => navigate({ to: '/memes' })}
            className="bg-tg-button text-tg-button-text rounded-lg px-6 py-3 font-semibold"
          >
            Browse Templates
          </button>
        </div>
      </div>
    );
  }

  const isReady = template.analysis_status === 'completed';

  const handleGetStarted = () => {
    navigate({
      to: '/memes/$templateId/select-characters',
      params: { templateId },
    });
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Content */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Template Image with Bounding Boxes */}
          <div className="mb-6 overflow-hidden rounded-xl">
            <MemeTemplatePreview
              imageUrl={template.image_url}
              alt={template.name}
              characters={template.characters}
              textAnchors={template.text_anchors}
              className="w-full"
            />
          </div>

          {/* Template Info */}
          <h1 className="text-tg-text mb-2 text-2xl font-bold">
            {template.name}
          </h1>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {template.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-tg-button/20 text-tg-button rounded-full px-3 py-1 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Analysis Status Banner */}
          {!isReady && (
            <div className="bg-yellow-500/20 border-yellow-500 mb-4 rounded-lg border p-4">
              <h3 className="text-tg-text mb-1 font-semibold">
                Template Not Ready
              </h3>
              <p className="text-tg-hint text-sm">
                This template is still being analyzed. Please check back later.
              </p>
              <p className="text-tg-hint mt-2 text-xs">
                Status: {template.analysis_status}
              </p>
            </div>
          )}

          {/* Requirements */}
          <div className="bg-tg-section-bg mb-4 space-y-3 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-tg-hint">Characters Needed</span>
              <span className="text-tg-text font-semibold">
                {template.characters?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tg-hint">Text Fields</span>
              <span className="text-tg-text font-semibold">
                {template.text_anchors?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tg-hint">Times Used</span>
              <span className="text-tg-text font-semibold">
                {template.usage_count}
              </span>
            </div>
          </div>

          {/* Character Slots Info */}
          {template.characters && template.characters.length > 0 && (
            <div className="bg-tg-section-bg mb-4 rounded-lg p-4">
              <h3 className="text-tg-text mb-3 font-semibold">
                Character Slots
              </h3>
              <div className="space-y-2">
                {template.characters.map(char => (
                  <div
                    key={char.slot_index}
                    className="border-tg-section-separator flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span className="text-tg-text text-sm">{char.label}</span>
                    <span className="text-tg-hint text-xs">
                      Slot {char.slot_index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Anchors Info */}
          {template.text_anchors && template.text_anchors.length > 0 && (
            <div className="bg-tg-section-bg mb-4 rounded-lg p-4">
              <h3 className="text-tg-text mb-3 font-semibold">Text Fields</h3>
              <div className="space-y-2">
                {template.text_anchors.map(anchor => (
                  <div
                    key={anchor.anchor_index}
                    className="border-tg-section-separator flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span className="text-tg-text text-sm">{anchor.label}</span>
                    <span className="text-tg-hint text-xs">
                      Position {anchor.anchor_index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <TelegramDualButtons
        mainButton={{
          text: 'Get Started',
          onClick: handleGetStarted,
          disabled: !isReady,
          visible: true,
        }}
      />
    </div>
  );
}
