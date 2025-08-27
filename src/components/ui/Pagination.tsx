import { Pagination as TGPagination } from '@telegram-apps/telegram-ui';
interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  className?: string;
}

export function Pagination({
  page,
  setPage,
  totalPages,
  className = '',
}: PaginationProps) {
  return (
    <TGPagination
      count={totalPages}
      page={page}
      siblingCount={1}
      onChange={(_, page) => setPage(page)}
    />
  );
}
