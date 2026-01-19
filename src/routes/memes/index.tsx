import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useGetMemeTemplates } from '@/hooks/useMemes';
import { MemeTemplateGrid, MemeSearchBar } from '@/components/Meme';

export const Route = createFileRoute('/memes/')({
  component: MemeTemplatesPage,
});

function MemeTemplatesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useGetMemeTemplates(
    { page, size: 20 },
    debouncedSearch || undefined
  );

  const handleSelectTemplate = (templateId: string) => {
    navigate({
      to: '/memes/$templateId/details',
      params: { templateId },
    });
  };

  const handleLoadMore = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const hasMore =
    data?.pagination && page < data.pagination.totalPages;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="bg-tg-section-bg border-tg-section-separator border-b px-6 py-4">
        <h1 className="text-tg-text mb-3 text-2xl font-bold">Meme Templates</h1>
        <MemeSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search templates by name or tag..."
        />
      </div>

      {/* Template Grid */}
      <div className="scrollbar-hide flex-1 overflow-y-auto">
        <MemeTemplateGrid
          templates={data?.data}
          onSelect={handleSelectTemplate}
          isLoading={isLoading}
        />

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center p-4">
            <button
              onClick={handleLoadMore}
              className="bg-tg-button text-tg-button-text rounded-lg px-6 py-3 font-semibold transition-all hover:brightness-110 active:scale-95"
            >
              Load More
            </button>
          </div>
        )}

        {/* Results Info */}
        {data?.pagination && (
          <div className="text-tg-hint p-4 text-center text-sm">
            Showing {data.data.length} of {data.pagination.total} templates
          </div>
        )}
      </div>
    </div>
  );
}
