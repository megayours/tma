import { createFileRoute } from '@tanstack/react-router';
import { useGetPrompts } from '@/hooks/usePrompts';
import { useSession } from '../../../../auth/SessionProvider';
import { useState } from 'react';

export const Route = createFileRoute('/profile/my-sticker-packs/new/')({
  component: RouteComponent,
});

function StickerPacks() {
  const { session } = useSession();
  const { data: prompts, isLoading } = useGetPrompts({
    session,
    promptFilters: {
      type: 'stickers',
    },
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    pagination: {
      page: 1,
      size: 10,
    },
  });
  console.log('PROMPTS', prompts);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!prompts) {
    return <div>No prompts available</div>;
  }

  return (
    <div>
      {prompts?.prompts?.map(prompt => (
        <div key={prompt.id}>{prompt.name}</div>
      ))}
    </div>
  );
}

function RouteComponent() {
  const [isStaticSticker, setIsStaticSticker] = useState(true);

  return (
    <div>
      <div className="flex gap-2 p-4">
        <button
          onClick={() => setIsStaticSticker(true)}
          className={`rounded px-4 py-2 ${
            isStaticSticker ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Static
        </button>
        <button
          onClick={() => setIsStaticSticker(false)}
          className={`rounded px-4 py-2 ${
            !isStaticSticker ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Animated
        </button>
      </div>

      {isStaticSticker ? (
        <StickerPacks />
      ) : (
        <div className="p-4 text-center text-gray-500">Coming Soon</div>
      )}
    </div>
  );
}
