import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  showLoadMore?: boolean;
}

const PaginationUniversal: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  onLoadMore,
  showLoadMore = false
}) => {
  const getPaginationItems = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  };

  const paginationItems = getPaginationItems();

  return (
    <div className="flex flex-col items-center justify-center space-y-4 mt-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {paginationItems.map((item, index) => {
          if (item === '...') {
            return <span key={`ellipsis-${index}`} className="px-2">...</span>;
          }
          return (
            <Button
              key={`page-${index}`}
              variant={item === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(item as number)}
              className="min-w-[40px]"
            >
              {item}
            </Button>
          );
        })}
        
        <Button 
          variant="outline" 
          size="icon"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {showLoadMore && onLoadMore && (
        <Button 
          onClick={onLoadMore}
          variant="outline"
          className="mt-4 transition-colors duration-300 hover:bg-black hover:text-white"
        >
          Загрузить ещё
        </Button>
      )}
    </div>
  );
};

export default PaginationUniversal; 