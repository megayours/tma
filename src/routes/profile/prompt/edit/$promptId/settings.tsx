import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useSession } from '@/auth/SessionProvider';
import { useGetPrompt } from '@/hooks/usePrompts';
import { useSelectedNFTs } from '@/contexts/SelectedNFTsContext';
import { useSettings } from '@/contexts/SettingsContext';

export const Route = createFileRoute('/profile/prompt/edit/$promptId/settings')(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { promptId } = Route.useParams();
  const { session } = useSession();
  const { data: prompt, isLoading, error } = useGetPrompt(promptId, session);
  const { selectedNFTs } = useSelectedNFTs();
  const { settingsOpen, setSettingsOpen } = useSettings();
  const settingsRef = useRef<HTMLDivElement>(null);

  // Log when settings are opened (3 dots pressed)
  useEffect(() => {
    if (settingsOpen) {
      console.log('3 dots pressed');
    }
  }, [settingsOpen]);

  // GSAP animation for settings dropdown
  useEffect(() => {
    if (settingsRef.current) {
      if (settingsOpen) {
        // Animate settings opening (slide down)
        gsap.to(settingsRef.current, {
          height: 'auto',
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            gsap.set(settingsRef.current, { height: 0, overflow: 'hidden' });
          },
          onComplete: () => {
            gsap.set(settingsRef.current, {
              height: 'auto',
              overflow: 'visible',
            });
          },
        });
      } else {
        // Animate settings closing (slide up)
        gsap.to(settingsRef.current, {
          height: 0,
          duration: 0.3,
          ease: 'power2.in',
          onStart: () => {
            gsap.set(settingsRef.current, { overflow: 'hidden' });
          },
        });
      }
    }
  }, [settingsOpen]);

  if (isLoading) return <div>Loading prompt settings...</div>;

  if (error) {
    return (
      <div className="p-4 text-center">
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  if (!prompt) return <div>Prompt not found</div>;

  return (
    <div ref={settingsRef} className="overflow-hidden" style={{ height: 0 }}>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Prompt Settings</h1>
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Prompt Name</h2>
            <p className="text-tg-hint">{prompt.name}</p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Created</h2>
            <p className="text-tg-hint">
              {prompt.createdAt
                ? new Date(prompt.createdAt).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Versions</h2>
            <p className="text-tg-hint">
              {prompt.versions?.length || 0} versions
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-lg font-semibold">Selected NFTs</h2>
            <p className="text-tg-hint">{selectedNFTs.length} NFTs selected</p>
          </div>
          {/* Add more settings options here */}
        </div>
      </div>
    </div>
  );
}
