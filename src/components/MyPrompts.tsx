import { useDeletePromptMutation, useGetMyPrompts } from '@/hooks/usePrompts';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '@/types/prompt';
import { Button, Card } from '@telegram-apps/telegram-ui';
import { useNavigate } from '@tanstack/react-router';
import { IoTrashBinOutline } from 'react-icons/io5';
import { useGetPreviewContent } from '../hooks/useContents';

export const RenderPreview = ({ prompt }: { prompt: Prompt }) => {
  const { session } = useSession();
  const { data } = useGetPreviewContent(session, prompt.id, {
    page: 1,
    size: 8,
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
    size: 5,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [deletingPromptId, setDeletingPromptId] = useState<number | null>(null);

  const { data } = useGetMyPrompts(session!, pagination, {
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const { mutateAsync: deletePrompt } = useDeletePromptMutation(session!, {
    onSettled: () => {
      // Clear the deleting state after mutation settles (success or error) and query refetch completes
      setDeletingPromptId(null);
    },
  });

  useEffect(() => {
    if (data?.pagination.totalPages !== totalPages) {
      setTotalPages(data?.pagination.totalPages);
    }
  }, [data]);

  const handleDeletePrompt = async (promptId: number) => {
    setDeletingPromptId(promptId);
    try {
      await deletePrompt({ promptId });
      // Don't clear deletingPromptId here - let mutation onSettled callback handle it after refetch
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      // Error case is handled by mutation onError callback, onSettled will still clear the state
    }
  };

  if (!session) {
    return <div>No session available</div>;
  }

  return (
    <div>
      {data && (
        <div className="flex flex-col gap-2">
          {data?.data.map((prompt: Prompt) => (
            <Card
              key={prompt.id}
              type="plain"
              onClick={() => {
                navigate({
                  to: '/profile/prompt/edit/$promptId',
                  params: { promptId: prompt.id?.toString() ?? '' },
                });
              }}
              className={deletingPromptId === prompt.id ? 'opacity-50' : ''}
            >
              <Card.Chip readOnly>{prompt.type}</Card.Chip>
              <RenderPreview prompt={prompt} />

              <Card.Cell
                readOnly
                subtitle={prompt.type}
                className="relative w-full"
              >
                <div className="flex w-full flex-row items-center justify-between">
                  <h1 className="flex-1 text-sm font-bold">{prompt.name}</h1>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2">
                    <Button
                      before={<IoTrashBinOutline />}
                      mode="filled"
                      size="s"
                      onClick={event => {
                        // stop propagation to the card
                        event.stopPropagation();
                        handleDeletePrompt(prompt.id!);
                      }}
                      loading={deletingPromptId === prompt.id}
                    >
                      <span className="text-tg-button-text">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card.Cell>
            </Card>
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
