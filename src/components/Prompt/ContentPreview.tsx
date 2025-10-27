import type { Prompt, PromptVersion } from '@/types/prompt';
import { useSession } from '../../auth/SessionProvider';
import { useGetPreviewContent } from '../../hooks/useContents';
import type { Content } from '@/types/response';
import { useState, useEffect, useMemo, useRef } from 'react';
import { DisplayContent } from '../DisplayContent';
import { Spinner } from '@/components/ui';

export const ContentPreviews = ({
  prompt,
}: {
  prompt: Prompt;
  selectedVersion: PromptVersion;
}) => {
  const { session } = useSession();
  const [page, setPage] = useState(1);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    data: { content, pagination: paginationData } = {
      content: [],
    },
  } = useGetPreviewContent(session, prompt.id, {
    page,
    size: 10,
  });
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Update allContent when new data is fetched
  useEffect(() => {
    if (content && content.length > 0) {
      if (page === 1) {
        // First page - replace content
        setAllContent(content);
      } else {
        // Subsequent pages - append content
        setAllContent(prev => [...prev, ...content]);
      }
      setIsLoadingMore(false);
    }

    // Update hasMorePages based on pagination data
    if (paginationData) {
      setHasMorePages(page < (paginationData.totalPages || 1));
    }
  }, [content, page, paginationData]);

  // Group content by prompt version
  const groupedContent = useMemo(() => {
    if (!allContent.length) return [];

    const versionMap = new Map<number, Content[]>();

    allContent.forEach((item: Content) => {
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
  }, [allContent]);

  // Auto-select the first item when content loads or when new content arrives
  useEffect(() => {
    if (groupedContent.length > 0 && groupedContent[0].items.length > 0) {
      const newestContent = groupedContent[0].items[0];

      // Select if no content is selected yet, or if the newest content is newer than selected
      // OR if the selected content's status has changed (e.g., from processing to completed)
      if (
        !selectedContent ||
        (newestContent.created_at > (selectedContent.created_at || 0)) ||
        (selectedContent && newestContent.id === selectedContent.id && newestContent.status !== selectedContent.status)
      ) {
        setSelectedContent(newestContent);
      }
    }
  }, [groupedContent]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-4">
        {selectedContent && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="aspect-square max-h-full max-w-full">
              <DisplayContent
                content={selectedContent}
                className="h-full w-full overflow-hidden rounded-lg object-cover"
                showVersion={true}
              />
            </div>
          </div>
        )}
        {!selectedContent && (
          <div className="flex h-full w-full items-center justify-center">
            Unleash your imagination
          </div>
        )}
      </div>
      <div>
        {groupedContent.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="bg-tg-secondary-bg flex max-h-20 w-full flex-shrink-0 flex-row items-center gap-4 overflow-x-auto p-2"
          >
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

            {/* Load More Button or Loading indicator */}
            {hasMorePages && !isLoadingMore && (
              <button
                onClick={() => {
                  setIsLoadingMore(true);
                  setPage(prev => prev + 1);
                }}
                className="flex flex-shrink-0 items-center justify-center rounded bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600"
              >
                <div className="text-xs font-medium">Load More</div>
              </button>
            )}

            {isLoadingMore && (
              <div className="flex flex-shrink-0 items-center justify-center p-2">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
