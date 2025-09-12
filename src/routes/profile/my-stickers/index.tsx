import { createFileRoute } from '@tanstack/react-router';
import { useGetContent } from '@/hooks/useContents';
import { useEffect, useState } from 'react';
import { Pagination } from '../../../components/ui/Pagination';
import type { Pagination as PaginationType } from '@/types/pagination';
import type { ContentFilters } from '@/types/requests';
import { useSession } from '@/auth/SessionProvider';
import type { ContentResponse } from '../../../types/response';

export const Route = createFileRoute('/profile/my-stickers/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <MyStickers />;
}

function MyStickers() {
  const { session } = useSession();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 5,
  });
  const [totalPages, setTotalPages] = useState(1);

  const stickersParams: ContentFilters = {
    type: 'sticker',
    account: session?.id,
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    pagination,
  };

  const animatedStickersParams: ContentFilters = {
    type: 'animated_sticker',
    account: session?.id,
    filters: {
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    pagination,
  };

  const { data: stickersData } = useGetContent(stickersParams, session);
  const { data: animatedStickersData } = useGetContent(animatedStickersParams, session);

  const allContent = [
    ...(stickersData?.data || []),
    ...(animatedStickersData?.data || [])
  ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const combinedTotalPages = Math.max(
    stickersData?.pagination?.totalPages || 0,
    animatedStickersData?.pagination?.totalPages || 0
  );

  useEffect(() => {
    if (combinedTotalPages !== totalPages) {
      setTotalPages(combinedTotalPages);
    }
  }, [combinedTotalPages, totalPages]);

  // Content deletion functionality would go here if available
  // Currently no delete API for content, so removing delete functionality

  if (!session) {
    return <div>No session available</div>;
  }

  return (
    <div>
      <div className="mb-4">My Stickers</div>
      {allContent.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {allContent.map((content: ContentResponse) => (
            <div
              key={content.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-sm text-gray-500">{content.type}</span>
              </div>
              
              {/* Type badge overlay */}
              <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-1">
                <span className="text-xs font-medium text-white">
                  {content.type === 'animated_sticker' ? 'Animated' : content.type}
                </span>
              </div>

              {/* Status indicator overlay */}
              <div className="absolute top-2 right-2">
                <div className={`rounded-full px-2 py-1 text-xs font-medium ${
                  content.status === 'completed' 
                    ? 'bg-green-500/70 text-white'
                    : content.status === 'processing'
                    ? 'bg-yellow-500/70 text-white'
                    : 'bg-red-500/70 text-white'
                }`}>
                  {content.status}
                </div>
              </div>

              {/* ID label at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                <span className="text-xs font-medium text-white">#{content.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-center">
        <Pagination
          page={pagination.page}
          setPage={page => setPagination({ ...pagination, page })}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
