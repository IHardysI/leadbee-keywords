"use client"

import { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from "recharts"
import { format, parseISO, isWithinInterval } from "date-fns"
import { ru } from "date-fns/locale"

interface TimeChartData {
  date: string;
  value: number;
}

interface DateRange {
  from: Date
  to: Date
}

interface TimeChartProps {
  data: TimeChartData[]
  timeGranularity?: "15m" | "1h" | "1d" | "1w"
  dateRange?: DateRange | null
  color?: string
  height?: number | string
  title?: string
  loading?: boolean
}

export function TimeChart({
  data,
  timeGranularity = "1d",
  dateRange = null,
  color = "#8884d8",
  height = 400,
  title = "Временной график",
  loading = false,
}: TimeChartProps) {
  const [filteredData, setFilteredData] = useState<TimeChartData[]>([])
  const [aggregatedData, setAggregatedData] = useState<TimeChartData[]>([])
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; value: number; date: Date } | null>(null)

  // Фильтрация данных по диапазону дат
  useEffect(() => {
    if (data.length > 0) {
      const filtered = filterDataByDateRange(data, dateRange)
      setFilteredData(filtered)
    } else {
      setFilteredData([])
    }
  }, [data, dateRange])

  // Агрегация данных по выбранной гранулярности
  useEffect(() => {
    if (filteredData.length > 0) {
      const aggregated = aggregateDataByGranularity(filteredData, timeGranularity)
      setAggregatedData(aggregated)
    } else {
      setAggregatedData([])
    }
  }, [filteredData, timeGranularity])

  // Фильтрация данных по временному диапазону
  const filterDataByDateRange = (data: TimeChartData[], range: DateRange | null): TimeChartData[] => {
    if (!range) return data // Return all data if range not specified

    return data.filter((item) => {
      // Check if date exists and is valid
      if (!item.date || typeof item.date !== 'string') {
        return false;
      }
      
      try {
        const itemDate = parseISO(item.date)
        return isWithinInterval(itemDate, { start: range.from, end: range.to })
      } catch (error) {
        console.error("Invalid date format:", item.date, error);
        return false;
      }
    })
  }

  // Агрегация данных по временной гранулярности
  const aggregateDataByGranularity = (data: TimeChartData[], granularity: string): TimeChartData[] => {
    if (data.length === 0) return []

    if (granularity === "15m") {
      // Для 15-минутных интервалов агрегация не требуется
      return data
    }

    const formatPattern = granularity === "1h" ? "yyyy-MM-dd HH" : 
                          granularity === "1d" ? "yyyy-MM-dd" : 
                          granularity === "1w" ? "yyyy-'W'ww" : "yyyy-MM-dd"

    // Словарь для агрегации
    const aggregatedMap = new Map()

    data.forEach((item) => {
      const date = parseISO(item.date)
      const timeKey = format(date, formatPattern)

      if (!aggregatedMap.has(timeKey)) {
        aggregatedMap.set(timeKey, {
          sum: 0,
          count: 0,
          date: item.date, // Сохраняем первое время для этого ключа
        })
      }

      const groupData = aggregatedMap.get(timeKey)
      groupData.sum += item.value
      groupData.count += 1
    })

    // Преобразуем MAP в массив
    return Array.from(aggregatedMap.entries()).map(([timeKey, groupData]: [string, any]) => ({
      date: groupData.date,
      value: Math.round(groupData.sum / groupData.count),
      originalCount: groupData.count,
      aggregationType: granularity,
    }))
  }

  // Форматирование подписей оси X
  const formatXAxis = (tickItem: string) => {
    const date = parseISO(tickItem)

    if (timeGranularity === "15m") {
      return format(date, "HH:mm", { locale: ru })
    } else if (timeGranularity === "1h") {
      return format(date, "HH:mm", { locale: ru })
    } else if (timeGranularity === "1d") {
      return format(date, "d MMM", { locale: ru })
    } else if (timeGranularity === "1w") {
      return format(date, "'Нед.' w", { locale: ru })
    }

    return format(date, "d MMM", { locale: ru })
  }

  // Компонент всплывающей подсказки
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const date = parseISO(label)
      const value = payload[0].value

      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-md p-4 z-50">
          <div className="text-sm text-gray-500">{format(date, "d MMMM yyyy HH:mm", { locale: ru })}</div>
          <div className="text-xl font-bold mt-1" style={{ color }}>Найдено совпадений: {value}</div>
        </div>
      )
    }
    return null
  }

  // Находим максимальное значение для линии отсчёта
  const maxValue = Math.max(...aggregatedData.map((item) => item.value || 0), 0)

  // Обработчики событий мыши для тултипов
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const chart = e.currentTarget.getBoundingClientRect()
    const chartX = e.clientX - chart.left
    const chartY = e.clientY - chart.top

    // Показываем тултип только рядом с точкой данных
    if (e.target instanceof SVGCircleElement) {
      const pointData = aggregatedData[Number(e.target.getAttribute("data-index") || 0)]
      if (pointData) {
        setTooltipData({
          x: chartX,
          y: chartY,
          value: pointData.value,
          date: parseISO(pointData.date),
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setTooltipData(null)
  }

  // Если данные загружаются или отсутствуют
  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">Загрузка...</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  if (aggregatedData.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <p className="text-center text-gray-500">Нет данных для отображения</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      <div className="h-[400px] w-full relative" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ height }}>
        {tooltipData && (
          <div
            className="absolute z-50 bg-white border border-gray-200 shadow-lg rounded-md p-3"
            style={{
              left: `${tooltipData.x + 10}px`,
              top: `${tooltipData.y - 70}px`,
              pointerEvents: "none",
            }}
          >
            <div className="text-sm text-gray-500">{format(tooltipData.date, "d MMMM yyyy HH:mm", { locale: ru })}</div>
            <div className="text-xl font-bold mt-1" style={{ color }}>Найдено совпадений: {tooltipData.value}</div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={aggregatedData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} tickCount={6} />
            <YAxis />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000 }}
              cursor={{ strokeDasharray: "3 3" }}
              allowEscapeViewBox={{ x: false, y: true }}
            />
            <defs>
              <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={`url(#color-${color.replace('#', '')})`}
              fillOpacity={1}
              strokeWidth={2}
              activeDot={{
                r: 8,
                fill: color,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive={true}
            />
            <ReferenceLine y={maxValue} stroke="red" strokeDasharray="3 3">
              <text x={10} y={-5} fill="red" fontSize={12} textAnchor="start">
                Макс: {maxValue}
              </text>
            </ReferenceLine>
            {aggregatedData.length > 30 && (
              <Brush
                dataKey="date"
                height={30}
                stroke={color}
                tickFormatter={formatXAxis}
                startIndex={Math.max(0, aggregatedData.length - 30)}
                endIndex={aggregatedData.length - 1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 