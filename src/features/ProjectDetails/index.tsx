"use client"

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, MessageSquare, Bell, Eye, EyeOff, Send, ArrowLeft, Loader, Trash2, Search } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getChatsByProjectId, ChatGroup, getTelegramGroups, TelegramGroupsResponse, addChatToProject, deleteChat } from "../../shared/api/chats";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  getAnalysisStatus, 
  getHierarchicalStats, 
  TimeGrouping, 
  startAnalysis, 
  stopAnalysis,
  runOneTimeAnalysis, 
  getOneTimeAnalysisStatus 
} from "@/shared/api/analysis";

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
  const [analysisData, setAnalysisData] = useState<{
    matches_found: number;
    is_running: boolean;
    keywords_count: number;
    chats_count: number;
  } | null>(null);
  
  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("1d");
  const [dateRangeMode, setDateRangeMode] = useState<string>("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [chartData, setChartData] = useState<any[]>([]);
  
  const [isStartingAnalysis, setIsStartingAnalysis] = useState(false);
  const [isStoppingAnalysis, setIsStoppingAnalysis] = useState(false);
  const [isRunningManualAnalysis, setIsRunningManualAnalysis] = useState(false);
  
  const [chartTabValue, setChartTabValue] = useState("realtime");
  const [analysisTaskId, setAnalysisTaskId] = useState<string | null>(null);
  const [isSelectingDateRange, setIsSelectingDateRange] = useState(false);
  const [analysisDateRange, setAnalysisDateRange] = useState<DateRange>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [isLoadingAnalysisResults, setIsLoadingAnalysisResults] = useState(false);
  const [hasAnalysisResults, setHasAnalysisResults] = useState(false);
  
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // Add a state for chart stats
  const [chartStats, setChartStats] = useState({
    totalMessages: 0,
    totalKeywords: 0
  });
  
  // Create a new state to track when data should be refreshed
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add new state variables
  const [analysisTask, setAnalysisTask] = useState<{
    taskId: string;
    status: string;
    polling: boolean;
  } | null>(null);
  
  // Function to trigger a refresh
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
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
    
    const fetchChartData = async () => {
      try {
        setIsChartLoading(true);
    
    const range = getEffectiveDateRange();
    const startDate = range.from;
    const endDate = range.to;
    
        // Map UI time granularity to API time grouping
        let groupBy: TimeGrouping = 'day';
        if (timeGranularity === "15m") groupBy = '15min';
        else if (timeGranularity === "1h") groupBy = 'hour';
        else if (timeGranularity === "1d") groupBy = 'day';
        
        // Call the API
        const response = await getHierarchicalStats({
          project_id: projectId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          group_by: groupBy
        });
        
        // Save the stats
        setChartStats({
          totalMessages: response.total_messages,
          totalKeywords: response.total_keywords
        });
        
        // Transform API response into chart data format
        const mappedData = response.periods.map(period => ({
          date: period.period_start,
          value: period.total_messages,
          keywords: period.total_keywords
        }));
        
        setChartData(mappedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        
        // Get range again for the catch block
        const fallbackRange = getEffectiveDateRange();
        
        // Fallback to generated data if API fails
    const generateData = () => {
      const data = [];
          let currentDate = new Date(fallbackRange.from);
      
          while (currentDate <= fallbackRange.to) {
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
      } finally {
        setIsChartLoading(false);
      }
    };
    
    fetchChartData();
  }, [project, timeGranularity, dateRangeMode, selectedDate, dateRange, getEffectiveDateRange, projectId]);
  
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
        
        // Fetch analysis status
        try {
          const analysisStatus = await getAnalysisStatus(projectId);
          setAnalysisData(analysisStatus);
        } catch (analysisError) {
          console.error('Error fetching analysis status:', analysisError);
          // Don't set error state as the main project data loaded successfully
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, refreshTrigger]);
  
  const handleStartAnalysis = async () => {
    try {
      setIsStartingAnalysis(true);
      
      // Call the API to start analysis
      await startAnalysis(projectId);
      
      toast.success("Анализ запущен", {
        description: "Отслеживание данных началось"
      });
      
      // Refresh analysis status
      const analysisStatus = await getAnalysisStatus(projectId);
      setAnalysisData(analysisStatus);
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error("Ошибка", {
        description: "Не удалось запустить анализ"
      });
    } finally {
      setIsStartingAnalysis(false);
    }
  };

  const handleStopAnalysis = async () => {
    try {
      setIsStoppingAnalysis(true);
      
      // Call the API to stop analysis
      await stopAnalysis(projectId);
      
      toast.success("Анализ остановлен", {
        description: "Отслеживание данных прекращено"
      });
      
      // Refresh analysis status
      const analysisStatus = await getAnalysisStatus(projectId);
      setAnalysisData(analysisStatus);
    } catch (error) {
      console.error('Error stopping analysis:', error);
      toast.error("Ошибка", {
        description: "Не удалось остановить анализ"
      });
    } finally {
      setIsStoppingAnalysis(false);
    }
  };

  const handleRunManualAnalysis = async () => {
    try {
      setIsRunningManualAnalysis(true);
      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Ручной анализ запущен", {
        description: "Анализ будет выполнен в ближайшее время"
      });
    } catch (error) {
      console.error('Error running manual analysis:', error);
      toast.error("Ошибка", {
        description: "Не удалось запустить ручной анализ"
      });
    } finally {
      setIsRunningManualAnalysis(false);
    }
  };
  
  const handleOneTimeAnalysis = () => {
    setIsSelectingDateRange(true);
  };
  
  const handleAnalysisDateRangeSubmit = async () => {
    if (!analysisDateRange.from || !analysisDateRange.to) {
      toast.error("Выберите диапазон дат", {
        description: "Пожалуйста, укажите начальную и конечную даты для анализа"
      });
      return;
    }
    
    setIsSelectingDateRange(false);
    setIsLoadingAnalysisResults(true);
    
    try {
      // Start one-time analysis
      const result = await runOneTimeAnalysis(projectId, {
        start_date: analysisDateRange.from.toISOString(),
        end_date: analysisDateRange.to.toISOString()
      });
      
      // Save task ID and start polling
      setAnalysisTaskId(result.task_id);
      setAnalysisTask({
        taskId: result.task_id,
        status: 'pending',
        polling: true
      });
      
      // Show success toast
      toast.success("Анализ запущен", {
        description: "Анализ данных начат. Это может занять некоторое время."
      });
      
      // Start polling for status
      pollAnalysisStatus(result.task_id);
      
    } catch (error) {
      console.error('Error starting analysis:', error);
      toast.error("Ошибка", {
        description: "Не удалось запустить анализ. Попробуйте еще раз."
      });
      setIsLoadingAnalysisResults(false);
    }
  };
  
  // Add function to poll analysis status
  const pollAnalysisStatus = async (taskId: string) => {
    try {
      const status = await getOneTimeAnalysisStatus(taskId);
      
      // Update analysis task state
      setAnalysisTask(prev => ({
        ...prev!,
        status: status.status
      }));
      
      // Check if analysis is complete or has error
      if (status.status === 'completed') {
        // Analysis is complete, get the results
        await fetchAnalysisResults(taskId);
        
        toast.success("Анализ завершен", {
          description: "Анализ данных успешно завершен."
        });
        
        setAnalysisTask(prev => ({
          ...prev!,
          polling: false
        }));
        
      } else if (status.status === 'error') {
        // Analysis failed
        toast.error("Ошибка анализа", {
          description: status.error_message || "Произошла ошибка при выполнении анализа."
        });
        
        setAnalysisTask(prev => ({
          ...prev!,
          polling: false
        }));
        
        setIsLoadingAnalysisResults(false);
        
      } else {
        // Analysis is still running, continue polling
        setTimeout(() => pollAnalysisStatus(taskId), 2000);
      }
      
    } catch (error) {
      console.error('Error polling analysis status:', error);
      
      toast.error("Ошибка", {
        description: "Не удалось получить статус анализа."
      });
      
      setAnalysisTask(prev => ({
        ...prev!,
        polling: false
      }));
      
      setIsLoadingAnalysisResults(false);
    }
  };

  // Add function to fetch analysis results
  const fetchAnalysisResults = async (taskId: string) => {
    try {
      // Get the status to get the analysis details
      const status = await getOneTimeAnalysisStatus(taskId);
      
      // Map UI time granularity to API time grouping
      let groupBy: TimeGrouping = 'day';
      if (timeGranularity === "15m") groupBy = '15min';
      else if (timeGranularity === "1h") groupBy = 'hour';
      else if (timeGranularity === "1d") groupBy = 'day';
      
      // Fetch hierarchical stats with the same date range
      const response = await getHierarchicalStats({
        project_id: projectId,
        start_date: status.start_date || (analysisDateRange.from ? analysisDateRange.from.toISOString() : new Date().toISOString()),
        end_date: status.end_date || (analysisDateRange.to ? analysisDateRange.to.toISOString() : new Date().toISOString()),
        group_by: groupBy
      });
      
      // Update the chart stats
      setChartStats({
        totalMessages: status.total_messages,
        totalKeywords: status.matches_found
      });
      
      // Transform API response into chart data format
      const mappedData = response.periods.map(period => ({
        date: period.period_start,
        value: period.total_messages,
        keywords: period.total_keywords
      }));
      
      setChartData(mappedData);
      setHasAnalysisResults(true);
      setIsLoadingAnalysisResults(false);
      
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      
      toast.error("Ошибка", {
        description: "Не удалось получить результаты анализа."
      });
      
      setIsLoadingAnalysisResults(false);
    }
  };
  
  const handleResetAnalysis = () => {
    setAnalysisTaskId(null);
    setHasAnalysisResults(false);
    setIsSelectingDateRange(false);
  };
  
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
  
  const matchesCount = analysisData?.matches_found ?? 0;
  
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
        {analysisData !== null && (
          <Badge variant="outline" className={`flex items-center gap-1 py-1 ${analysisData.is_running ? "bg-blue-500/10" : "bg-gray-500/10"}`}>
            {analysisData.is_running ? (
              <>
            <Eye className="h-3 w-3" />
            <span>Отслеживается</span>
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" />
                <span>Не отслеживается</span>
              </>
            )}
          </Badge>
        )}
        {project.isSending && (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-500/10 py-1">
            <Send className="h-3 w-3" />
            <span>Отправляется</span>
          </Badge>
        )}
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium mb-1">Управление анализом</h3>
            <p className="text-sm text-muted-foreground">Запуск/остановка анализа данных</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {analysisData?.is_running ? (
              <Button 
                variant="outline" 
                onClick={handleStopAnalysis} 
                disabled={isStoppingAnalysis}
                className="bg-red-100 hover:bg-red-200 text-red-700 border-red-200"
              >
                {isStoppingAnalysis ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Останавливается...
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Остановить анализ
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleStartAnalysis}
                disabled={isStartingAnalysis}
                className="bg-blue-100 hover:bg-blue-200 border-blue-200"
              >
                {isStartingAnalysis ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Запускается...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Запустить анализ
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего совпадений</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesCount}</div>
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

          <Tabs value={chartTabValue} onValueChange={setChartTabValue}>
            <TabsList>
              <TabsTrigger value="realtime" className="cursor-pointer">Данные в реальном времени</TabsTrigger>
              <TabsTrigger value="analysis" className="cursor-pointer">Анализ по выбору</TabsTrigger>
            </TabsList>
            
            <TabsContent value="realtime">
              <div className="flex items-center justify-between mb-4">
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
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Всего совпадений</div>
                  <div className="text-2xl font-medium">{isChartLoading ? "..." : chartStats.totalMessages.toLocaleString()}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-sm text-muted-foreground">Найдено ключевых слов</div>
                  <div className="text-2xl font-medium">{isChartLoading ? "..." : chartStats.totalKeywords.toLocaleString()}</div>
          </div>
        </div>
        
              <Card>
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
                    loading={isChartLoading}
            />
          </CardContent>
        </Card>
            </TabsContent>
            
            <TabsContent value="analysis">
              <div className="mt-4">
                {isSelectingDateRange ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Выберите диапазон дат для анализа</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        <div>
                          <Label className="mb-2 block">Период для анализа:</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant={"outline"} className="w-full justify-start text-left font-normal cursor-pointer">
                                <Calendar className="mr-2 h-4 w-4" />
                                {analysisDateRange.from ? (
                                  analysisDateRange.to ? (
                                    <>
                                      {format(analysisDateRange.from, "d MMM yyyy", { locale: ru })} -{" "}
                                      {format(analysisDateRange.to, "d MMM yyyy", { locale: ru })}
                                    </>
                                  ) : (
                                    format(analysisDateRange.from, "d MMMM yyyy", { locale: ru })
                                  )
                                ) : (
                                  "Выберите диапазон дат"
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                initialFocus
                                mode="range"
                                defaultMonth={analysisDateRange.from}
                                selected={analysisDateRange}
                                onSelect={range => setAnalysisDateRange(range || { from: undefined, to: undefined })}
                                numberOfMonths={2}
                                locale={ru}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsSelectingDateRange(false)}>
                            Отмена
                          </Button>
                          <Button onClick={handleAnalysisDateRangeSubmit}>
                            Запустить анализ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : isLoadingAnalysisResults ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Выполняется анализ</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Анализируем данные за период: {format(analysisDateRange.from!, "d MMM yyyy", { locale: ru })} - 
                        {format(analysisDateRange.to!, "d MMM yyyy", { locale: ru })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Badge variant="outline" className="mb-2">ID задачи: {analysisTaskId}</Badge>
                        {analysisTask && (
                          <Badge variant={analysisTask.status === 'error' ? 'destructive' : 'outline'} className="ml-2">
                            Статус: {
                              analysisTask.status === 'pending' ? 'Ожидание' :
                              analysisTask.status === 'processing' ? 'Обработка' :
                              analysisTask.status === 'completed' ? 'Завершено' :
                              'Ошибка'
                            }
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-center items-center py-8">
                        <div className="text-center">
                          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                            <span className="sr-only">Загрузка...</span>
                          </div>
                          <p className="mt-4 text-sm text-muted-foreground">
                            Это может занять некоторое время в зависимости от объема данных
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : hasAnalysisResults ? (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Результаты анализа</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Период: {format(analysisDateRange.from!, "d MMM yyyy", { locale: ru })} - 
                          {format(analysisDateRange.to!, "d MMM yyyy", { locale: ru })}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleResetAnalysis}>
                        Новый анализ
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Badge variant="outline" className="mb-2">ID задачи: {analysisTaskId}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="text-sm text-muted-foreground">Всего совпадений</div>
                          <div className="text-2xl font-medium">
                            {isLoadingAnalysisResults ? "..." : chartStats.totalMessages.toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3">
                          <div className="text-sm text-muted-foreground">Найдено ключевых слов</div>
                          <div className="text-2xl font-medium">
                            {isLoadingAnalysisResults ? "..." : chartStats.totalKeywords.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <TimeChart 
                        data={chartData.map(item => ({
                          date: item.date,
                          value: item.value,
                          keywords: item.keywords
                        }))}
                        timeGranularity={timeGranularity}
                        dateRange={{
                          from: analysisDateRange.from!,
                          to: analysisDateRange.to!
                        }}
                        title=""
                        color="#10b981"
                        loading={isLoadingAnalysisResults}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <div className="text-center max-w-[450px]">
                        <h3 className="text-lg font-medium mb-2">Запустить детальный анализ</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Выберите период для одноразового анализа данных и получите детальную статистику по совпадениям
                        </p>
                        <Button onClick={handleOneTimeAnalysis}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Запустить анализ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Tabs defaultValue="keywords">
        <TabsList className="cursor-pointer">
          <TabsTrigger value="keywords" className="cursor-pointer">Ключевые слова</TabsTrigger>
          <TabsTrigger value="groups" className="cursor-pointer">Чаты</TabsTrigger>
        </TabsList>
        <TabsContent value="keywords" className="mt-4">
          <KeywordsTab projectId={String(project.id)} onDataChange={triggerRefresh} /> 
        </TabsContent>
        <TabsContent value="groups" className="mt-4">
          <GroupsTab projectId={String(project.id)} onDataChange={triggerRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Компонент KeywordsTab
const KeywordsTab = ({ projectId, onDataChange }: { projectId: string | number, onDataChange: () => void }) => {
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
      
      await addKeywordsToProject(String(projectId), wordsToAdd);
      
      // Refresh keywords list
      await fetchKeywords();
      
      // Reset form and close dialog
      setKeywordsInput("");
      setIsDialogOpen(false);
      
      // Show success toast
      toast.success("Ключевые слова добавлены", {
        description: `Добавлено ${wordsToAdd.length} ключевых слов в проект.`
      });
      
      // Call onDataChange to trigger refresh in parent component
      onDataChange();
      
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

  const handleDeleteKeyword = async (keywordId: string | number, word: string) => {
    try {
      await deleteKeyword(String(keywordId));
      
      // Refresh keyword list
      await fetchKeywords();
      
      // Show success toast
      toast.success("Ключевое слово удалено", {
        description: `Ключевое слово "${word}" удалено из проекта.`
      });
      
      // Call onDataChange to trigger refresh in parent component
      onDataChange();
      
    } catch (err) {
      console.error('Failed to delete keyword:', err);
      // Show error toast
      toast.error("Ошибка удаления ключевого слова", {
        description: "Пожалуйста, попробуйте снова позже."
      });
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (error) return <div className="text-red-500 p-4 min-h-[200px]">{error}</div>;

  return (
    <div className="">
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

const GroupsTab = ({ projectId, onDataChange }: { projectId: string | number, onDataChange: () => void }) => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [telegramGroups, setTelegramGroups] = useState<TelegramGroupsResponse['groups']>([]);
  const [loadingTelegramGroups, setLoadingTelegramGroups] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [addingChat, setAddingChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTelegramGroups, setFilteredTelegramGroups] = useState<TelegramGroupsResponse['groups']>([]);
  const [telegramGroupsPage, setTelegramGroupsPage] = useState(1);
  const [hasMoreGroups, setHasMoreGroups] = useState(false);
  const itemsPerPage = 50;
  const [chatToDelete, setChatToDelete] = useState<ChatGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch project groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        const data = await getChatsByProjectId(String(projectId));
        setGroups(data);
        setError(null);
      } catch (err) {
        setError('Ошибка при загрузке групп');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [projectId]);

  const handleOpenDialog = async () => {
    setIsDialogOpen(true);
    setSelectedChat(null);
    setTelegramGroupsPage(1);
    setTelegramGroups([]);
    
    try {
      setLoadingTelegramGroups(true);
      await fetchMoreGroups(1);
    } catch (err) {
      console.error('Error fetching Telegram groups:', err);
      toast.error("Ошибка", {
        description: "Не удалось загрузить список Telegram групп"
      });
    } finally {
      setLoadingTelegramGroups(false);
    }
  };

  // Function to fetch more groups
  const fetchMoreGroups = async (page: number) => {
    try {
      const data = await getTelegramGroups(page, itemsPerPage);
      
      if (data.status === "success") {
        // Append new groups to existing ones, avoiding duplicates
        setTelegramGroups(prev => {
          const newGroups = data.groups.filter(
            group => !prev.some(existing => existing.id === group.id)
          );
          return [...prev, ...newGroups];
        });
        
        // Check if there are more groups to load
        setHasMoreGroups(data.total_count > page * itemsPerPage);
      }
    } catch (err) {
      console.error('Error fetching more Telegram groups:', err);
      throw err;
    }
  };

  // Handle loading more groups
  const handleLoadMore = async () => {
    const nextPage = telegramGroupsPage + 1;
    setLoadingTelegramGroups(true);
    
    try {
      await fetchMoreGroups(nextPage);
      setTelegramGroupsPage(nextPage);
    } catch (err) {
      toast.error("Ошибка", {
        description: "Не удалось загрузить больше групп"
      });
    } finally {
      setLoadingTelegramGroups(false);
    }
  };

  // Handle chat selection
  const handleChatSelection = (chatId: string) => {
    setSelectedChat(chatId === selectedChat ? null : chatId);
  };

  // Handle adding chat to project
  const handleAddChat = async () => {
    if (!selectedChat) {
      toast.error("Выберите чат для добавления");
      return;
    }
    
    // Find the selected group to get its title
    const selectedGroup = telegramGroups.find(group => group.id === selectedChat);
    if (!selectedGroup) {
      toast.error("Выбранная группа не найдена");
      return;
    }
    
    try {
      setAddingChat(true);
      
      await addChatToProject({
        project_id: String(projectId),
        chat_id: selectedChat,
        chat_name: selectedGroup.title,
        chat_type: "telegram"
      });
      
      // Refresh groups list
      const data = await getChatsByProjectId(String(projectId));
      setGroups(data);
      
      // Close dialog and reset selection
      setIsDialogOpen(false);
      setSelectedChat(null);
      
      // Show success toast
      toast.success("Чат добавлен", {
        description: "Чат успешно добавлен в проект"
      });
      
      // Call onDataChange to trigger refresh in parent component
      onDataChange();
      
    } catch (err) {
      console.error('Error adding chat to project:', err);
      toast.error("Ошибка", {
        description: "Не удалось добавить чат в проект",
      });
    } finally {
      setAddingChat(false);
    }
  };

  // Filter groups based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTelegramGroups(telegramGroups);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = telegramGroups.filter(group => 
      group.title.toLowerCase().includes(term)
    );
    setFilteredTelegramGroups(filtered);
  }, [searchTerm, telegramGroups]);

  // Handle delete chat
  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await deleteChat({ 
        project_id: String(projectId), 
        chat_id: chatToDelete.id 
      });
      
      // Update groups list (remove deleted chat)
      setGroups(prevGroups => 
        prevGroups.filter(g => g.id !== chatToDelete.id)
      );
      
      // Close alert dialog
      setChatToDelete(null);
      
      // Show success toast
      toast.success("Чат удален", {
        description: `Чат "${chatToDelete.chat_name}" удален из проекта.`
      });
      
      // Call onDataChange to trigger refresh in parent component
      onDataChange();
      
    } catch (err) {
      console.error('Error deleting chat:', err);
      toast.error("Ошибка", {
        description: "Не удалось удалить чат из проекта",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return (
    <div className="p-4 flex justify-center items-center min-h-[200px]">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  
  if (error) return <div className="text-red-500 p-4 min-h-[200px]">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Группы проекта</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>Добавить группу</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] w-full">
            <DialogHeader>
              <DialogTitle>Добавить группу в проект</DialogTitle>
              <DialogDescription>
                Выберите Telegram группу, которую хотите добавить в проект
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-2 mb-2">
              <SearchInput 
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            
            <div className="">
              {loadingTelegramGroups && telegramGroups.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTelegramGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 
                    `Telegram группы не найдены по запросу "${searchTerm}"` : 
                    "Telegram группы не найдены"}
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="max-h-[400px] overflow-y-auto border rounded-md w-full">
                    <div className="w-full overflow-x-hidden">
                      <Table className="w-full table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="w-[60%]">Название</TableHead>
                            <TableHead className="w-[30%]">Тип</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTelegramGroups.map((group) => (
                            <TableRow 
                              key={group.id} 
                              className="cursor-pointer hover:bg-gray-50/10"
                              onClick={() => handleChatSelection(group.id)}
                            >
                              <TableCell className="text-center">
                                <Checkbox 
                                  checked={selectedChat === group.id}
                                  onCheckedChange={() => handleChatSelection(group.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium truncate max-w-[250px]">
                                {group.title}
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
                  </div>
                  
                  {/* Load more button */}
                  {hasMoreGroups && (
                    <div className="mt-4 flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={handleLoadMore}
                        disabled={loadingTelegramGroups}
                        className="transition-colors duration-300 hover:bg-black hover:text-white"
                      >
                        {loadingTelegramGroups ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          "Загрузить ещё"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleAddChat} 
                disabled={!selectedChat || addingChat}
              >
                {addingChat ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Добавление...
                  </>
                ) : (
                  "Добавить в проект"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Dialog for delete confirmation */}
      <AlertDialog open={!!chatToDelete} onOpenChange={(open) => !open && setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит чат "{chatToDelete?.chat_name}" из проекта. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChat}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Groups table */}
      {groups.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          В этом проекте нет групп. Нажмите "Добавить группу", чтобы добавить первую группу.
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Дата добавления</TableHead>
                <TableHead>Обновлено последний раз</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id} className="hover:bg-gray-50/10">
                  <TableCell className="font-medium">
                    {group.chat_name}
                  </TableCell>
                  <TableCell>{group.chat_type}</TableCell>
                  <TableCell>
                    {format(new Date(group.created_at), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(group.updated_at), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatToDelete(group);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}; 