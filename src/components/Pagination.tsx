import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const Pagination = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) => {
  if (totalCount === 0) return null;

  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700 bg-gray-800">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          Showing <span className="font-medium text-gray-200">{firstItem}–{lastItem}</span> of{' '}
          <span className="font-medium text-gray-200">{totalCount}</span>
        </span>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Rows:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">
          Page <span className="font-medium text-gray-200">{page}</span> of{' '}
          <span className="font-medium text-gray-200">{totalPages}</span>
        </span>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
          className="p-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
