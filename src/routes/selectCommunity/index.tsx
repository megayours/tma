import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useSelectCommunity } from '@/contexts/SelectCommunityContext';
import { SpinnerFullPage } from '@/components/ui';
import type { Community } from '@/hooks/useCommunities';
import { useState, useRef } from 'react';

const selectCommunitySearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute('/selectCommunity/')({
  validateSearch: selectCommunitySearchSchema,
  component: SelectCommunityPage,
});

function SelectCommunityPage() {
  const { redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const { availableCommunities, setSelectedCommunity, isLoading, error } =
    useSelectCommunity();

  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTitleTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Navigate to about page after 5 taps
    if (newTapCount >= 5) {
      setTapCount(0);
      navigate({ to: '/about' });
      return;
    }

    // Reset tap count after 1 second of inactivity
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 1000);
  };

  const handleCommunitySelect = (community: Community) => {
    setSelectedCommunity(community);
    navigate({ to: redirectTo || '/' });
  };

  if (isLoading) {
    return <SpinnerFullPage text="Loading communities..." />;
  }

  if (availableCommunities.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-tg-text mb-4 text-2xl font-bold">
            No Communities Available
          </h1>
          <p className="text-tg-hint">
            You don't have access to any communities yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col p-4">
      <div className="mb-6 text-center">
        <h1
          className="text-tg-text mb-2 cursor-pointer text-2xl font-bold"
          onClick={handleTitleTap}
        >
          Select Your Community
        </h1>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {availableCommunities.map(community => (
          <button
            key={community.id}
            onClick={() => handleCommunitySelect(community)}
            className="bg-tg-section-bg hover:bg-tg-section-bg/80 border-tg-section-separator flex flex-col items-center gap-3 rounded-xl border p-6 transition-all active:scale-95"
          >
            {community.image && (
              <img
                src={community.image}
                alt={community.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            )}
            <div className="text-center">
              <h3 className="text-tg-text text-lg font-semibold">
                {community.name}
              </h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
