"use client"

import { useEffect, useState } from "react";
import { getTelegramGroups, TelegramGroupsResponse, createGroup } from "@/shared/api/chats";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader, PlusCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaginationUniversal from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChatsPage() {
  const [telegramGroups, setTelegramGroups] = useState<TelegramGroupsResponse['groups']>([]);
  const [filteredGroups, setFilteredGroups] = useState<TelegramGroupsResponse['groups']>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [navigationMode, setNavigationMode] = useState<'pagination' | 'loadmore'>('pagination');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [joinLink, setJoinLink] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [joinLinkError, setJoinLinkError] = useState('');
  const [isAddMassGroupsOpen, setIsAddMassGroupsOpen] = useState(false);
  const [massGroupsSheetUrl, setMassGroupsSheetUrl] = useState('');
  const [isSheetUrlEditable, setIsSheetUrlEditable] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const telegramData = await getTelegramGroups(currentPage, itemsPerPage);
        
        if (telegramData.status === "success") {
          if (navigationMode === 'pagination') {
            setTelegramGroups(telegramData.groups);
          } else {
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

  // Handle creating a new group
  const handleCreateGroup = async () => {
    // Validate join link
    if (!joinLink.trim()) {
      setJoinLinkError('Ссылка не может быть пустой');
      return;
    }
    
    // Simple validation for Telegram links
    if (!joinLink.includes('t.me/') && !joinLink.includes('telegram.me/')) {
      setJoinLinkError('Введите корректную ссылку Telegram');
      return;
    }
    
    setJoinLinkError('');
    setIsCreating(true);
    
    try {
      await createGroup(joinLink);
      
      // Refresh the list after creating a new group
      const telegramData = await getTelegramGroups(1, itemsPerPage);
      setTelegramGroups(telegramData.groups);
      setTotalCount(telegramData.total_count);
      
      toast.success("Группа добавлена", {
        description: "Группа успешно добавлена в список",
      });
      
      // Close dialog and clear input
      setIsAddDialogOpen(false);
      setJoinLink('');
    } catch (err) {
      console.error('Error creating group:', err);
      toast.error("Ошибка", {
        description: "Не удалось добавить группу. Проверьте ссылку и попробуйте снова.",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Добавить группу</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Добавить новую группу</DialogTitle>
                <DialogDescription>
                  Введите ссылку-приглашение для добавления новой Telegram группы
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="join-link">Ссылка-приглашение</Label>
                  <Input
                    id="join-link"
                    placeholder="https://t.me/joinchat/..."
                    value={joinLink}
                    onChange={(e) => {
                      setJoinLink(e.target.value);
                      setJoinLinkError(''); // Clear error when typing
                    }}
                    className={joinLinkError ? "border-red-500" : ""}
                  />
                  {joinLinkError && (
                    <p className="text-sm text-red-500">{joinLinkError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateGroup}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Добавление...
                    </>
                  ) : (
                    "Добавить"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            variant="default"
            className="flex-grow sm:flex-grow-0"
            onClick={() => setIsAddMassGroupsOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Добавить чаты массово
          </Button>
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
                  <TableHead>Аккаунты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {navigationMode === 'pagination' 
                  ? filteredGroups.slice(0, itemsPerPage).map((group) => (
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
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.joined_accounts && group.joined_accounts.length > 0 ? (
                              group.joined_accounts.map((account, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  {account}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">Нет аккаунтов</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : filteredGroups.map((group) => (
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
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.joined_accounts && group.joined_accounts.length > 0 ? (
                              group.joined_accounts.map((account, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  {account}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">Нет аккаунтов</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                }
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

      {isAddMassGroupsOpen && (
        <Dialog open={true} onOpenChange={() => setIsAddMassGroupsOpen(false)}>
          <DialogContent className="w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавить группы массово</DialogTitle>
              <DialogDescription>URL Google-таблицы со списком групп для добавления</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="URL Google-таблицы"
                  value={massGroupsSheetUrl}
                  onChange={(e) => setMassGroupsSheetUrl(e.target.value)}
                  className="flex-grow"
                  disabled={!isSheetUrlEditable}
                />
                <Button 
                  variant="outline" 
                  className="whitespace-nowrap"
                  onClick={() => setIsSheetUrlEditable(!isSheetUrlEditable)}
                >
                  {isSheetUrlEditable ? "Готово" : <><Pencil className="h-4 w-4 mr-2" /> Изменить</>}
                </Button>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                variant="default"
                className="flex items-center"
                onClick={() => {
                  // Placeholder for the actual functionality
                  alert('Функциональность добавления массово будет реализована позже');
                  setIsAddMassGroupsOpen(false);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Добавить чаты массово из источника
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 