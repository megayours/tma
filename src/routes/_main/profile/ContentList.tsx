import { useSession } from '@/auth/SessionProvider';
import { useGetContents, useRevealContent } from '@/hooks/useContents';
import { useState } from 'react';

export function ContentList() {
  const { session } = useSession();
  const { data } = useGetContents(session, session?.id!);
  const contents = data?.contents;
  const revealMutation = useRevealContent(session);
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());

  console.log('contents', contents);

  const handleReveal = async (contentId: string) => {
    if (revealingIds.has(contentId)) return; // Prevent double clicks

    setRevealingIds(prev => new Set(prev).add(contentId));
    try {
      await revealMutation.mutateAsync(contentId);
    } catch (error) {
      console.error('Failed to reveal content:', error);
    } finally {
      setRevealingIds(prev => {
        const next = new Set(prev);
        next.delete(contentId);
        return next;
      });
    }
  };

  if (!contents || contents.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-tg-text mb-3 text-lg font-semibold">
        Recent Generations
      </h2>
      <div className="scrollbar-hide -mx-6 flex flex-row gap-2 overflow-x-auto pr-6 pl-6">
        {contents?.map(content => {
          const isRevealed = content.revealedAt !== null;
          const isRevealing = revealingIds.has(content.id);

          return (
            <div
              key={content.id}
              className="relative h-40 w-40 flex-shrink-0 cursor-pointer"
              onClick={() => !isRevealed && handleReveal(content.id)}
            >
              <img
                src={
                  content.url ||
                  content.image ||
                  content.video ||
                  content.gif ||
                  ''
                }
                alt="Generated content"
                className={`h-full w-full rounded-xl object-cover shadow-sm transition-all ${
                  !isRevealed ? 'blur-xl' : ''
                }`}
              />
              {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
                  {isRevealing ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                  ) : (
                    <div className="text-center">
                      <div className="text-xs font-semibold text-white">
                        Tap to reveal
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
