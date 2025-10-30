import { useGetMyPrompts } from '@/hooks/usePrompts';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '@/types/prompt';
import { Button } from '@telegram-apps/telegram-ui';
import { useNavigate } from '@tanstack/react-router';
import { useGetPreviewContent } from '../hooks/useContents';

export const RenderPreview = ({ prompt }: { prompt: Prompt }) => {
  const { session } = useSession();
  const { data } = useGetPreviewContent(session, prompt.id, {
    page: 1,
    size: 1,
  });
  console.log(data);
  return (
    <div
      className={`flex h-48 flex-row gap-2 ${data?.content.length === 0 ? '' : 'scrollbar-hide overflow-x-scroll'}`}
    >
      {data?.content.map(content => (
        <div key={content.id} className="flex-shrink-0">
          <img
            src={content.image || content.gif || '/public/gifs/loadings.gif'}
            alt={content.id}
            className="block h-48 w-auto object-contain"
          />
        </div>
      ))}
      {data?.content.length === 0 && (
        <div className="flex h-full w-full items-center justify-center">
          No content
        </div>
      )}
    </div>
  );
};

export default function MyPrompts() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 6,
  });
  const [totalPages, setTotalPages] = useState(1);

  const { data } = useGetMyPrompts(session!, pagination, {
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (data?.pagination.totalPages !== totalPages) {
      setTotalPages(data?.pagination.totalPages);
    }
  }, [data]);

  if (!session) {
    return <div>No session available</div>;
  }

  console.log('prompt', data?.data[1]);
  return (
    <div>
      {data && (
        <div className="grid grid-cols-2 gap-2">
          {data?.data.map((prompt: Prompt) => (
            <div key={prompt.id}>
              <div className="border-tg-section-separator flex flex-col rounded-lg border p-2">
                <RenderPreview prompt={prompt} />
                <h1 className="text-sm font-bold">{prompt.name}</h1>
                <h2 className="text-sm font-medium">
                  {prompt.type?.replaceAll('_', ' ')}
                </h2>
                <Button
                  before={'Modify'}
                  mode="filled"
                  size="s"
                  onClick={() => {
                    navigate({
                      to: '/profile/prompt/edit/$promptId',
                      params: { promptId: prompt.id?.toString() ?? '' },
                    });
                  }}
                ></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mb-16 flex justify-center">
        <Pagination
          page={pagination.page}
          setPage={(page: number) => setPagination({ ...pagination, page })}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
