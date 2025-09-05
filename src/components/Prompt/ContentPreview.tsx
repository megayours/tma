import type { Prompt, PromptVersion } from '@/types/prompt';
import { useSession } from '../../auth/SessionProvider';
import { useGetPreviewContent } from '../../hooks/useContents';
import type { Content } from '@/types/response';
import { useState, useEffect, useMemo } from 'react';
import { DisplayContent } from '../DisplayContent';

export const ContentPreviews = ({
  prompt,
  selectedVersion,
}: {
  prompt: Prompt;
  selectedVersion: PromptVersion;
}) => {
  const { session } = useSession();
  const { data: { content } = { content: [] } } = useGetPreviewContent(
    session,
    prompt.id,
    selectedVersion
  );
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

  // Preselect the first item in grouped content when content loads
  useEffect(() => {
    if (
      groupedContent.length > 0 &&
      groupedContent[0].items.length > 0 &&
      !selectedContent
    ) {
      setSelectedContent(groupedContent[0].items[0]);
    }
  }, [groupedContent, selectedContent]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-4">
        {selectedContent && (
          <div className="container h-full w-full items-center justify-center">
            <DisplayContent
              content={selectedContent}
              className="h-full w-full rounded-lg object-contain"
              showVersion={true}
            />
          </div>
        )}
        {!selectedContent && <div className="">Unleash your imagination</div>}
      </div>
      <div>
        {groupedContent.length > 0 && (
          <div className="bg-tg-secondary-bg flex max-h-20 w-full flex-shrink-0 flex-row items-center gap-4 overflow-x-auto p-2">
            {groupedContent.flatMap((group, groupIndex) => {
              const items = [
                // Content items for this version
                ...group.items.map((content: Content) => (
                  <div
                    key={content.id}
                    className={`min-w-0 flex-shrink-0 cursor-pointer rounded border-2 ${
                      selectedContent?.id === content.id
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedContent(content)}
                  >
                    <DisplayContent content={content} className="h-14 w-14" />
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
        )}
      </div>
    </div>
  );
};
