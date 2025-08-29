import type { Prompt, PromptVersion } from '@/types/prompt';
import { useSession } from '../../auth/SessionProvider';
import { useGetPreviewContent } from '../../hooks/useContents';
import type { Content } from '@/types/response';
import { useState, useEffect, useMemo } from 'react';

export const ContentPreviews = ({
  prompt,
  selectedVersion,
}: {
  prompt: Prompt;
  selectedVersion: PromptVersion;
}) => {
  const { session } = useSession();
  const { data: { content, pagination } = { content: [], pagination: {} } } =
    useGetPreviewContent(session, prompt.id, selectedVersion);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Group content by prompt version
  const groupedContent = useMemo(() => {
    if (!content) return [];

    const versionMap = new Map<number, Content[]>();

    content.forEach((item: Content) => {
      const version = item.prompt?.version || 0;
      if (!versionMap.has(version)) {
        versionMap.set(version, []);
      }
      versionMap.get(version)!.push(item);
    });

    // Convert to array and order from largest to lowest version
    return Array.from(versionMap.entries())
      .map(([version, items]) => ({
        version,
        items,
      }))
      .sort((a, b) => b.version - a.version);
  }, [content]);

  // Set the most recent content as default when content changes
  useEffect(() => {
    if (content?.length > 0 && !selectedContent) {
      // Find the most recent content by looking for the highest version and most recent creation date
      const mostRecent = content.reduce((latest, current) => {
        if (!latest) return current;

        // First compare by version (higher version = more recent)
        if (current.prompt?.version && latest.prompt?.version) {
          if (current.prompt.version > latest.prompt.version) return current;
          if (current.prompt.version < latest.prompt.version) return latest;
        }

        // If versions are the same, compare by creation date
        if (current.created_at && latest.created_at) {
          return new Date(current.created_at) > new Date(latest.created_at)
            ? current
            : latest;
        }

        return latest;
      });

      setSelectedContent(mostRecent);
    }
  }, [content, selectedContent]);

  return (
    <div className="h-full pb-25">
      <div className="flex h-full items-center justify-center">
        {selectedContent && (
          <div className="relative">
            <img
              src={selectedContent.image}
              alt={selectedContent.id}
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-1 text-sm text-white shadow-sm">
              v{selectedContent.prompt?.version || 'N/A'}
            </div>
          </div>
        )}
      </div>
      <div className="bg-tg-secondary-bg flex max-h-20 flex-row items-center gap-4 overflow-x-auto p-2">
        {groupedContent.flatMap((group, groupIndex) => {
          const items = [
            // Content items for this version
            ...group.items.map((content: Content) => (
              <div
                key={content.id}
                className={`flex-shrink-0 cursor-pointer rounded border-2 ${
                  selectedContent?.id === content.id
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
                onClick={() => setSelectedContent(content)}
              >
                <img
                  src={content.image}
                  alt={content.id}
                  className="h-14 w-14 rounded-lg object-cover"
                />
              </div>
            )),
            // Version separator (except for the last group)
            ...(groupIndex < groupedContent.length - 1
              ? [
                  <div
                    key={`separator-${group.version}`}
                    className="flex flex-shrink-0 flex-col items-center justify-center"
                  >
                    <div className="bg-tg-hint/30 h-8 w-px"></div>
                    <div className="text-tg-hint mt-1 text-xs font-medium">
                      v{group.version}
                    </div>
                  </div>,
                ]
              : []),
          ];
          return items;
        })}
      </div>
    </div>
  );
};
