import type { MemeTemplate } from '@/types/meme';
import { SpinnerFullPage } from '@/components/ui';
import { MediaDisplay } from '@/components/lib/LatestContent/MediaDisplay';

interface MemeTemplateGridProps {
  templates?: MemeTemplate[];
  onSelect: (templateId: string) => void;
  isLoading?: boolean;
}

export function MemeTemplateGrid({
  templates,
  onSelect,
  isLoading,
}: MemeTemplateGridProps) {
  if (isLoading) {
    return <SpinnerFullPage text="Loading templates..." />;
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-tg-hint mb-4 text-4xl">🎭</div>
        <h3 className="text-tg-text mb-2 text-lg font-semibold">
          No templates found
        </h3>
        <p className="text-tg-hint text-sm">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {templates.map(template => (
        <div
          key={template.id}
          onClick={() => onSelect(String(template.id))}
          className="bg-tg-section-bg hover:bg-tg-section-bg/80 cursor-pointer rounded-lg p-3 transition-all active:scale-95"
        >
          {/* Template Image */}
          <div className="relative mb-2 aspect-square overflow-hidden rounded">
            <MediaDisplay
              src={template.thumbnail_url || '/logo.png'}
              alt={template.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* Analysis Status Badge */}
            {template.analysis_status !== 'completed' && (
              <div className="absolute right-2 top-2 rounded bg-yellow-500/90 px-2 py-0.5 text-xs font-semibold text-white">
                {template.analysis_status === 'processing'
                  ? 'Processing'
                  : 'Pending'}
              </div>
            )}
          </div>

          {/* Template Info */}
          <h3 className="text-tg-text mb-1 text-sm font-semibold line-clamp-2">
            {template.name}
          </h3>

          {/* Metadata */}
          <div className="text-tg-hint mb-2 flex gap-2 text-xs">
            <span>{template.character_count} chars</span>
            {template.text_anchor_count > 0 && (
              <span>{template.text_anchor_count} texts</span>
            )}
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="bg-tg-button/20 text-tg-hint rounded px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 2 && (
                <span className="text-tg-hint text-xs">
                  +{template.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Usage Count */}
          {template.usage_count > 0 && (
            <div className="text-tg-hint mt-2 text-xs">
              Used {template.usage_count} times
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
