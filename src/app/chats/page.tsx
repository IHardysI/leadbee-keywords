"use client"

import { useEffect, useState } from "react";
import { getTelegramGroups, TelegramGroupsResponse } from "@/shared/api/chats";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaginationUniversal from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";

export default function ChatsPage() {
  const [telegramGroups, setTelegramGroups] = useState<TelegramGroupsResponse['groups']>([]);
  const [filteredGroups, setFilteredGroups] = useState<TelegramGroupsResponse['groups']>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const telegramData = await getTelegramGroups(currentPage, itemsPerPage);
        
        if (telegramData.status === "success") {
          if (navigationMode === 'pagination') {
            setTelegramGroups(telegramData.groups);
          } else {
            // In "load more" mode, we append new groups to existing ones
            setTelegramGroups(prev => {
              const newGroups = telegramData.groups.filter(
                group => !prev.some(existing => existing.id === group.id)
              );
              return [...prev, ...newGroups];
            });
          }
          
          setTotalCount(telegramData.total_count);
          setError(null);
        } else {
          setError('Ошибка при загрузке групп');
          console.error('API returned error status:', telegramData);
        }
      } catch (err) {
        setError('Ошибка при загрузке групп');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [currentPage, navigationMode, itemsPerPage]);

  // Filter groups based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGroups(telegramGroups);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = telegramGroups.filter(group => 
      group.title.toLowerCase().includes(term)
    );
    setFilteredGroups(filtered);
  }, [searchTerm, telegramGroups]);

  const handlePageChange = (page: number) => {
    setNavigationMode('pagination');
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLoadMore = () => {
    setNavigationMode('loadmore');
    setCurrentPage(prev => prev + 1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading && navigationMode === 'pagination') {
    return (
      <div className="container">
        <div className="flex justify-center items-center min-h-[100dvh]">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error && telegramGroups.length === 0) {
    return (
      <div className="container">
        <div className="text-red-500 p-4 text-center">
          {error}
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Все группы и чаты</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            Всего: {totalCount} групп
          </div>
          <Button>Добавить группу</Button>
        </div>
      </div>

      {/* Replace hardcoded search with SearchInput component */}
      <div className="mb-4 flex">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center p-10 border rounded-md">
          {searchTerm ? (
            <p className="text-muted-foreground mb-4">Группы не найдены по запросу "{searchTerm}"</p>
          ) : (
            <p className="text-muted-foreground mb-4">У вас пока нет добавленных групп</p>
          )}
          {!searchTerm && <Button>Добавить первую группу</Button>}
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((group) => (
                  <TableRow key={group.id} className="cursor-pointer hover:bg-gray-50/10">
                    <TableCell className="font-medium">
                      <a 
                        href={group.join_link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-foreground hover:underline"
                      >
                        {group.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                        test
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isLoading && navigationMode === 'loadmore' && (
            <div className="flex justify-center my-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {totalCount > 0 && (
            <PaginationUniversal 
              currentPage={currentPage} 
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onLoadMore={handleLoadMore}
              showLoadMore={currentPage < totalPages}
            />
          )}
        </>
      )}
    </div>
  );
} 