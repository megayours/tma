import { useGetMyPrompts } from '../../hooks/usePrompts';
import { useEffect, useState } from 'react';
import { Pagination } from '../../components/ui/Pagination';
import type { Pagination as PaginationType } from '@/types/pagination';
import { useSession } from '@/auth/SessionProvider';
import type { Prompt } from '../../types/prompt';

export default function MyPrompts() {
  const { session } = useSession();
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    size: 10,
  });
  const [totalPages, setTotalPages] = useState(1);

  const { data, isLoading, error } = useGetMyPrompts(session!, pagination);

  useEffect(() => {
    if (data?.pagination.totalPages !== totalPages) {
      setTotalPages(data?.pagination.totalPages);
    }
  }, [data]);

  if (!session) {
    return <div>No session available</div>;
  }

  return (
    <div>
      <div>My Prompts</div>
      {data && (
        <div>
          {data?.data.map((prompt: Prompt) => (
            <div key={prompt.id}>{prompt.name}</div>
          ))}
        </div>
      )}
      <div>
        <Pagination
          page={pagination.page}
          setPage={page => setPagination({ ...pagination, page })}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
