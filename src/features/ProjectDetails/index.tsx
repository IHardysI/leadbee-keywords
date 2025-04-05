"use client"

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, MessageSquare, Bell, Eye, Send, ArrowLeft, Loader, Trash2 } from "lucide-react";
import { TimeChart } from "@/features/TimeChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { getProjectById } from "@/shared/api/projects/projects";
import { getProjectKeywords, Keyword, addKeywordsToProject, deleteKeyword } from '../../shared/api/keywords';
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// We keep this interface for our internal use with additional UI-specific fields
interface Project {
  id: string | number;
  name: string;
  description: string;
  keywordsCount?: number;
  chatsCount?: number;
  createdAt: string | Date;
  status?: string;
  isTracking?: boolean;  
  isSending?: boolean;
  matchesCount?: number;
}

type TimeGranularity = "15m" | "1h" | "1d" | undefined;

export function ProjectDetails({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("1d");
  const [dateRangeMode, setDateRangeMode] = useState<string>("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [chartData, setChartData] = useState<any[]>([]);
  
  const handleDateRangeModeChange = (mode: string) => {
    setDateRangeMode(mode);
    
    if (mode === "today") {
      setSelectedDate(new Date());
    } else if (mode === "range" && !dateRange.from) {
      setDateRange({
        from: subDays(new Date(), 7),
        to: new Date()
      });
    }
  };
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range || { from: undefined, to: undefined });
  };
  
  const getDateRangeDescription = () => {
    if (dateRangeMode === "today") {
      return "Сегодня";
    } else if (dateRangeMode === "custom" && selectedDate) {
      return format(selectedDate, "d MMMM yyyy", { locale: ru });
    } else if (dateRangeMode === "range" && dateRange.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "d MMM yyyy", { locale: ru })} - ${format(dateRange.to, "d MMM yyyy", { locale: ru })}`;
      }
      return format(dateRange.from, "d MMMM yyyy", { locale: ru });
    } else if (dateRangeMode === "all") {
      return "Все время";
    }
    return "Выберите дату";
  };
  
  const getEffectiveDateRange = useCallback(() => {
    if (dateRangeMode === "today") {
      const today = new Date();
      return { 
        from: startOfDay(today),
        to: endOfDay(today)
      };
    } else if (dateRangeMode === "custom" && selectedDate) {
      return {
        from: startOfDay(selectedDate),
        to: endOfDay(selectedDate)
      };
    } else if (dateRangeMode === "range" && dateRange.from) {
      return {
        from: startOfDay(dateRange.from),
        to: dateRange.to ? endOfDay(dateRange.to) : endOfDay(new Date())
      };
    } else {
      return {
        from: startOfDay(subDays(new Date(), 30)),
        to: endOfDay(new Date())
      };
    }
  }, [dateRangeMode, selectedDate, dateRange]);
  
  useEffect(() => {
    if (!project) return;
    
    const range = getEffectiveDateRange();
    const startDate = range.from;
    const endDate = range.to;
    
    const generateData = () => {
      const data = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        data.push({
          date: currentDate.toISOString(),
          value: Math.floor(Math.random() * 100) + 10
        });
        
        if (timeGranularity === "15m") {
          currentDate.setMinutes(currentDate.getMinutes() + 15);
        } else if (timeGranularity === "1h") {
          currentDate.setHours(currentDate.getHours() + 1);
        } else if (timeGranularity === "1d") {
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      return data;
    };
    
    setChartData(generateData());
  }, [project, timeGranularity, dateRangeMode, selectedDate, dateRange, getEffectiveDateRange]);
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const projectDetails = await getProjectById(projectId);
        
        // Convert API response to our internal Project format
        const projectData: Project = {
          id: projectDetails.project.id,
          name: projectDetails.project.name,
          description: projectDetails.project.description,
          keywordsCount: projectDetails.keywords.length,
          chatsCount: projectDetails.chats.length,
          createdAt: projectDetails.project.created_at || new Date(),
          status: "Активен", // Default status
          isTracking: true,  // Default UI state
          isSending: false   // Default UI state
        };
        
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);
  
  if (loading) {
    return (
      <div className="container">
        <div className="relative min-h-[80vh] flex items-center justify-center">
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container p-6">
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="cursor-pointer">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return <div className="container p-6">Проект не найден</div>;
  }
  
  const matchesCount = project.matchesCount || Math.floor(Math.random() * 1000) + 100;
  const growthPercent = (Math.random() * 20 - 5).toFixed(1);
  const isPositiveGrowth = parseFloat(growthPercent) > 0;
  
  return (
    <div className="container" suppressHydrationWarning>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 cursor-pointer" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>
      
      <div className="mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
        <p className="text-base text-muted-foreground">{project.description}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {project.isTracking && (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 py-1">
            <Eye className="h-3 w-3" />
            <span>Отслеживается</span>
          </Badge>
        )}
        {project.isSending && (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-500/10 py-1">
            <Send className="h-3 w-3" />
            <span>Отправляется</span>
          </Badge>
        )}
        <Badge variant="outline" className="py-1">{project.status || "Активен"}</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего совпадений</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesCount}</div>
            <p className={`text-xs ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveGrowth ? '+' : ''}{growthPercent}% с прошлой недели
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ключевые слова</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.keywordsCount}</div>
            <p className="text-xs text-muted-foreground">Активных ключевых слов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Группы</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.chatsCount}</div>
            <p className="text-xs text-muted-foreground">Отслеживаемых групп</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Совпадения ключевых слов во времени</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Детализация:</span>
              <Select value={timeGranularity} onValueChange={(value: any) => setTimeGranularity(value)}>
                <SelectTrigger className="w-[120px] cursor-pointer">
                  <SelectValue placeholder="Детализация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 минут</SelectItem>
                  <SelectItem value="1h">1 час</SelectItem>
                  <SelectItem value="1d">1 день</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Диапазон дат:</span>
              <Badge variant="outline" className="font-normal">{getDateRangeDescription()}</Badge>
            </div>
            <div className="w-[480px]">
              <Tabs value={dateRangeMode} onValueChange={handleDateRangeModeChange} className="w-full">
                <TabsList className="grid grid-cols-4 hover:cursor-pointer w-full">
                  <TabsTrigger value="today" className="cursor-pointer">Сегодня</TabsTrigger>
                  <TabsTrigger value="custom" className="cursor-pointer">Выбрать дату</TabsTrigger>
                  <TabsTrigger value="range" className="cursor-pointer">Диапазон дат</TabsTrigger>
                  <TabsTrigger value="all" className="cursor-pointer">Все время</TabsTrigger>
                </TabsList>
                
                {dateRangeMode === "custom" && (
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
                
                {dateRangeMode === "range" && (
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "d MMM yyyy", { locale: ru })} -{" "}
                                {format(dateRange.to, "d MMM yyyy", { locale: ru })}
                              </>
                            ) : (
                              format(dateRange.from, "d MMMM yyyy", { locale: ru })
                            )
                          ) : (
                            "Выберите диапазон дат"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from}
                          selected={dateRange}
                          onSelect={handleDateRangeChange}
                          numberOfMonths={2}
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </Tabs>
            </div>
          </div>
        </div>
        
        <Card className="mt-4">
          <CardContent className="pt-6">
            <TimeChart 
              data={chartData.map(item => ({
                date: item.date,
                value: item.value
              }))}
              timeGranularity={timeGranularity}
              dateRange={getEffectiveDateRange()}
              title=""
              color="#4f46e5" 
            />
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="keywords">
        <TabsList className="cursor-pointer">
          <TabsTrigger value="keywords" className="cursor-pointer">Ключевые слова</TabsTrigger>
          <TabsTrigger value="groups" className="cursor-pointer">Группы</TabsTrigger>
        </TabsList>
        <TabsContent value="keywords" className="mt-4">
          <KeywordsTab projectId={String(project.id)} /> 
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">Группы проекта</h3>
            <p className="text-muted-foreground">Здесь будет отображаться список групп, в которых ведется мониторинг с дополнительной информацией.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Компонент KeywordsTab
const KeywordsTab = ({ projectId }: { projectId: string | number }) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKeywords = async () => {
    try {
      setIsLoading(true);
      const data = await getProjectKeywords(String(projectId));
      setKeywords(data);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке ключевых слов');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, [projectId]);

  const handleAddKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keywordsInput.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Split by comma and trim each keyword
      const wordsToAdd = keywordsInput
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      await addKeywordsToProject(projectId, wordsToAdd);
      
      // Refresh keywords list
      await fetchKeywords();
      
      // Reset form and close dialog
      setKeywordsInput("");
      setIsDialogOpen(false);
      
      // Show success toast
      toast.success("Ключевые слова добавлены", {
        description: `Добавлено ${wordsToAdd.length} ключевых слов в проект.`
      });
      
    } catch (err) {
      console.error('Failed to add keywords:', err);
      setError('Ошибка при добавлении ключевых слов');
      
      // Show error toast
      toast.error("Ошибка добавления ключевых слов", {
        description: "Пожалуйста, попробуйте снова позже."
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKeyword = async (keywordId: string, word: string) => {
    try {
      await deleteKeyword(keywordId);
      // Remove the keyword from the local state
      setKeywords(keywords.filter(k => k.id !== keywordId));
      // Show success toast
      toast.success("Ключевое слово удалено", {
        description: `Ключевое слово "${word}" было успешно удалено из проекта.`
      });
    } catch (err) {
      console.error('Failed to delete keyword:', err);
      // Show error toast
      toast.error("Ошибка удаления ключевого слова", {
        description: "Пожалуйста, попробуйте снова позже."
      });
    }
  };

  if (isLoading) return (
    <div className="p-4 flex justify-center items-center min-h-[200px]">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (error) return <div className="text-red-500 p-4 min-h-[200px]">{error}</div>;

  return (
    <div className="p-4 min-h-[200px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ключевые слова</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Добавить ключевые слова</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Добавить ключевые слова</DialogTitle>
              <DialogDescription>
                Введите ключевые слова через запятую, которые хотите добавить в проект
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddKeywords} className="w-full">
              <div className="py-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="keywords">Ключевые слова</Label>
                  <Textarea
                    id="keywords"
                    placeholder="word1, word2, word3"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Добавление...
                    </>
                  ) : (
                    "Добавить"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {keywords.length === 0 ? (
          <p>Ключевые слова не найдены</p>
        ) : (
          keywords.map((keyword) => (
            <span 
              key={keyword.id}
              className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm relative group hover:scale-105 transition-all duration-200"
            >
              {keyword.word}
              <button
                onClick={() => handleDeleteKeyword(keyword.id, keyword.word)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/20 hover:bg-black/50 cursor-pointer"
                title="Удалить ключевое слово"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
}; 