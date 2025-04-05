"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Tag, MessageSquare, Bell, Eye, Send, ArrowLeft, Loader } from "lucide-react";
import { TimeChart } from "@/features/TimeChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfDay, endOfDay, subDays, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { getProjectById, ProjectDetailsResponse } from "@/shared/api/projects/projects";

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
  
  const getEffectiveDateRange = () => {
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
  };
  
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
          time: currentDate.toISOString(),
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
  }, [project, timeGranularity, dateRangeMode, selectedDate, dateRange]);
  
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
          createdAt: projectDetails.project.created_at,
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
              data={chartData}
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
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">Ключевые слова проекта</h3>
            <p className="text-muted-foreground">Здесь будет отображаться список ключевых слов проекта с метриками и возможностью редактирования.</p>
          </div>
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