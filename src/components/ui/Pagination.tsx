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
    <div className={`flex w-full flex-row gap-2 ${className}`}>
      <button
        className="bg-tg-primary text-tg-text rounded-lg p-2"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous Page
      </button>
      <button
        className="bg-tg-primary text-tg-text rounded-lg p-2"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
      >
        Next Page
      </button>
    </div>
  );
}
