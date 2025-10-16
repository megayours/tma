import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

interface StickerPackSearch {
  executionId?: string;
}

export const Route = createFileRoute('/sticker-packs/$stickerPackId/')({
  validateSearch: (search): StickerPackSearch => ({
    executionId: search.executionId as string,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { stickerPackId } = Route.useParams();
  const navigate = useNavigate();

  // Redirect to the new multi-step flow
  useEffect(() => {
    navigate({
      to: '/sticker-packs/$stickerPackId/details',
      params: { stickerPackId },
      replace: true,
    });
  }, [stickerPackId, navigate]);

  return null;
}
