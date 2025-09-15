import {
  useDeletePromptMutation,
  useGetMyPrompts,
} from '@/hooks/usePrompts';
import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '@/types/prompt';
import { Button, Card } from '@telegram-apps/telegram-ui';
import { useNavigate } from '@tanstack/react-router';
import { IoTrashBinOutline } from 'react-icons/io5';

export default function MyPrompts() {
  const navigate = useNavigate();
  const { session } = useSession();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 5,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [deletingPromptId, setDeletingPromptId] = useState<number | null>(null);

  const { data } = useGetMyPrompts(session!, pagination);
  const { mutateAsync: deletePrompt } = useDeletePromptMutation(session!);

  useEffect(() => {
    if (data?.pagination.totalPages !== totalPages) {
      setTotalPages(data?.pagination.totalPages);
    }
  }, [data]);

  const handleDeletePrompt = async (promptId: number) => {
    setDeletingPromptId(promptId);
    try {
      await deletePrompt({ promptId });
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    } finally {
      setDeletingPromptId(null);
    }
  };

  if (!session) {
    return <div>No session available</div>;
  }

  return (
    <div>
      <div>My Prompts</div>
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
            >
              <Card.Chip readOnly>{prompt.type}</Card.Chip>
              <img
                alt={prompt.name}
                src={prompt.image ?? '/gifs/loadings.gif'}
                className="block h-30 w-full object-cover"
              />
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
      <div className="flex justify-center">
        <Pagination
          page={pagination.page}
          setPage={(page: number) => setPagination({ ...pagination, page })}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
