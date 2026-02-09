import type { Prompt, PromptVersion } from '@/types/prompt';
import { useSession } from '../../auth/SessionProvider';
import {
  useGetPreviewContent,
  usePreviewContentMutation,
} from '../../hooks/useContents';
import type { Content } from '@/types/response';
import { useState, useEffect, useMemo, useRef } from 'react';
import { DisplayContent } from '../DisplayContent';
import { Spinner } from '@/components/ui';
import { GiphyShareButton } from '@/routes/content/$promptId/success/GiphyShareButton';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { IoSend } from 'react-icons/io5';
import { buildShareUrl } from '@/utils/shareUrl';
import { shareTelegramMessage } from '@/utils/telegramShare';
import {
  canDownloadFile,
  downloadTelegramFile,
} from '@/utils/telegramDownload';

export const ContentPreviews = ({
  prompt,
  selectedVersion,
}: {
  prompt: Prompt;
  selectedVersion: PromptVersion;
}) => {
  const { session } = useSession();
  const { selectedCommunity } = useSelectCommunity();
  const [page, setPage] = useState(1);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: retryPreview, isPending: isRetrying } =
    usePreviewContentMutation(session);
  const [retryingContentId, setRetryingContentId] = useState<string | null>(
    null
  );

  const {
    data: { content, pagination: paginationData } = {
      content: [],
    },
  } = useGetPreviewContent(session, prompt.id, {
    page,
    size: 10,
  });

  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isGiphyEnabled, setIsGiphyEnabled] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isMobileDevice = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as Navigator & {
      userAgentData?: { mobile?: boolean };
    };
    if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
      return nav.userAgentData.mobile;
    }
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      nav.userAgent
    );
  }, []);

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
        newestContent.createdAt > (selectedContent.createdAt || 0) ||
        (selectedContent &&
          newestContent.id === selectedContent.id &&
          newestContent.status !== selectedContent.status)
      ) {
        setSelectedContent(newestContent);
      }
    }
  }, [groupedContent]);

  // Check if Giphy integration is enabled for the selected content's collection
  useEffect(() => {
    if (
      !selectedContent?.token?.contract?.chain ||
      !selectedContent?.token?.contract?.address ||
      !selectedCommunity?.collections
    ) {
      setIsGiphyEnabled(false);
      return;
    }

    // Find matching collection by chain + address
    const contentCollection = selectedCommunity.collections.find(
      c =>
        c.chain === selectedContent.token?.contract?.chain &&
        c.address === selectedContent.token?.contract?.address
    );

    if (!contentCollection) {
      setIsGiphyEnabled(false);
      return;
    }

    // Giphy only supports animated content (GIFs, videos, animated stickers)
    const isGiphyContent = selectedContent.type !== 'image';

    const hasGiphyIntegration =
      contentCollection.integrations?.some(
        i => i.type === 'giphy' && i.enabled
      ) || false;

    setIsGiphyEnabled(isGiphyContent && hasGiphyIntegration);
  }, [selectedContent, selectedCommunity]);

  // Retry handler for failed/error content
  const handleRetry = async (content: Content) => {
    if (
      !content.token ||
      !prompt.id ||
      isRetrying ||
      retryingContentId === content.id
    )
      return;

    setRetryingContentId(content.id);
    try {
      await retryPreview({
        promptId: prompt.id,
        contentIds: [],
        tokens: [content.token],
        overrideExisting: true,
      });
    } catch (error) {
      console.error('Failed to retry preview:', error);
    } finally {
      setRetryingContentId(null);
    }
  };

  const handleTelegramShare = () => {
    const shareUrl = buildShareUrl(
      import.meta.env.VITE_PUBLIC_BOT_URL || '',
      `/content/${prompt.id}/details`,
      selectedCommunity?.id
    );
    const shareText =
      selectedContent?.prompt?.name || prompt.name || 'Check out my creation!';
    shareTelegramMessage(shareUrl, shareText);
  };

  const contentUrl =
    selectedContent?.url ||
    selectedContent?.image ||
    selectedContent?.gif ||
    selectedContent?.video ||
    null;

  const handleDownload = async () => {
    if (!contentUrl || isDownloading) return;

    try {
      setIsDownloading(true);

      const urlExtension = contentUrl.split('.').pop()?.split('?')[0] || 'png';
      const fileName = `artwork-${selectedContent?.id || prompt.id}.${urlExtension}`;

      if (canDownloadFile()) {
        const success = await downloadTelegramFile(contentUrl, fileName);
        if (success) return;
      }

      const response = await fetch(contentUrl, {
        mode: 'cors',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Unable to download content');
      }

      const blob = await response.blob();
      const mimeType = blob.type || 'image/png';
      const extension = mimeType.split('/')[1]?.split('+')[0] || 'png';
      const blobFileName = `artwork-${selectedContent?.id || prompt.id}.${extension}`;
      const file = new File([blob], blobFileName, { type: mimeType });

      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function';
      const canShareThisFile = navigator.canShare
        ? navigator.canShare({ files: [file] })
        : false;

      if (isMobileDevice && canShareFiles && canShareThisFile) {
        await navigator.share({
          files: [file],
          title: 'Save your artwork',
          text: 'Choose "Save Image" to store this in your camera roll.',
        });
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = blobFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('[Download] Failed to download content:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center p-4">
        {selectedContent && (
          <div className="flex h-full w-full flex-col items-center justify-start gap-2 overflow-y-auto pb-10">
            <div className="aspect-square max-h-full max-w-full">
              <DisplayContent
                content={selectedContent}
                className="h-full min-h-24 w-full min-w-24 rounded-lg object-cover"
                showVersion={true}
                onRetry={() => handleRetry(selectedContent)}
                isRetrying={retryingContentId === selectedContent.id}
              />
            </div>
            {selectedContent.status === 'completed' && (
              <div className="flex w-full flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTelegramShare}
                    className="border-tg-section-separator bg-tg-section-bg text-tg-text hover:bg-tg-section-bg/80 flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all active:scale-95"
                    aria-label="Share to Telegram"
                  >
                    <IoSend className="h-6 w-6" />
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!contentUrl || isDownloading}
                    className="border-tg-section-separator bg-tg-section-bg text-tg-text hover:bg-tg-section-bg/80 flex h-12 w-12 items-center justify-center rounded-xl border-2 shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Download content"
                  >
                    {isDownloading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {isGiphyEnabled && (
                  <GiphyShareButton
                    contentId={selectedContent.id}
                    contentType={selectedContent.type || 'image'}
                    collectionChain={selectedContent.token?.contract?.chain}
                    collectionAddress={selectedContent.token?.contract?.address}
                    collections={selectedCommunity?.collections}
                    giphyUrl={
                      selectedContent.integrations?.find(
                        i => i.integration === 'giphy'
                      )?.url
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}
        {!selectedContent && (
          <div className="flex h-full w-full items-center justify-center">
            Unleash your imagination
          </div>
        )}
      </div>
      <div className="fixed bottom-40 w-full">
        {groupedContent.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="bg-tg-secondary flex max-h-25 w-full flex-shrink-0 flex-row items-center gap-2 overflow-x-auto border border-white/20 p-2 shadow-lg backdrop-blur-lg"
          >
            {groupedContent.flatMap((group, groupIndex) => {
              const isSelectedVersion =
                group.version === selectedVersion.version;
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
                    <DisplayContent
                      content={content}
                      className="h-14 w-14"
                      onRetry={() => handleRetry(content)}
                      isRetrying={retryingContentId === content.id}
                    />
                  </div>
                )),
                // Version separator (except for the last group)
                ...(groupIndex < groupedContent.length - 1
                  ? [
                      <div
                        key={`separator-${group.version}`}
                        className={`flex flex-shrink-0 flex-col items-center justify-center ${
                          isSelectedVersion ? 'opacity-100' : 'opacity-50'
                        }`}
                      >
                        <div
                          className={`h-8 w-px ${isSelectedVersion ? 'bg-blue-500' : 'bg-tg-hint/30'}`}
                        ></div>
                        <div
                          className={`mt-1 text-xs font-medium ${isSelectedVersion ? 'text-blue-500' : 'text-tg-hint'}`}
                        >
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
