// Analysis API endpoints

/**
 * Interface for project analysis status response
 */
interface AnalysisStatusResponse {
  is_running: boolean;
  project_id: string;
  start_time: string | null;
  messages_processed: number;
  matches_found: number;
  keywords_count: number;
  chats_count: number;
}

/**
 * Get the analysis status for a specific project
 * 
 * @param projectId - The ID of the project to get analysis for
 * @returns Promise with the analysis status data
 */
export const getAnalysisStatus = async (projectId: string): Promise<AnalysisStatusResponse> => {
  const response = await fetch(
    `https://leadbee-keywords.dev.reflectai.pro/api/v1/analyzer/${projectId}/analyzer/status`,
    {
      headers: {
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch analysis status: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Interface for the keyword data in the hierarchical stats response
 */
interface KeywordStat {
  keyword: string;
  count: number;
  percentage: number;
}

/**
 * Interface for chat data in the hierarchical stats response
 */
interface ChatStat {
  chat_id: string;
  chat_name: string;
  total_messages: number;
  total_keywords: number;
  keywords: KeywordStat[];
  meta: Record<string, any>;
}

/**
 * Interface for a single time period in the hierarchical stats response
 */
interface PeriodStat {
  period_start: string;
  period_end: string;
  period_iso: string;
  total_messages: number;
  total_keywords: number;
  chats: ChatStat[];
  meta: Record<string, any>;
}

/**
 * Interface for hierarchical stats response
 */
export interface HierarchicalStatsResponse {
  start_date: string;
  end_date: string;
  total_messages: number;
  total_keywords: number;
  total_chats: number;
  periods: PeriodStat[];
  meta: {
    empty_result?: boolean;
    [key: string]: any;
  };
  processing_time_ms: number;
}

/**
 * Type for time grouping options
 */
export type TimeGrouping = 'none' | 'hour' | '15min' | 'day' | 'week' | 'month';

/**
 * Interface for hierarchical stats request parameters
 */
export interface HierarchicalStatsParams {
  start_date?: string;
  end_date?: string;
  project_id: string;
  chat_ids?: string[];
  group_by?: TimeGrouping;
  filter_keywords?: string[];
}

/**
 * Get hierarchical statistics for analysis matches
 * 
 * @param params - Parameters for the hierarchical stats request
 * @returns Promise with the hierarchical stats data
 */
export const getHierarchicalStats = async (params: HierarchicalStatsParams): Promise<HierarchicalStatsResponse> => {
  // Build query parameters
  const queryParams = new URLSearchParams();
  
  if (params.start_date) {
    queryParams.append('start_date', params.start_date);
  }
  
  if (params.end_date) {
    queryParams.append('end_date', params.end_date);
  }
  
  if (params.project_id) {
    queryParams.append('project_id', params.project_id);
  }
  
  if (params.chat_ids && params.chat_ids.length > 0) {
    params.chat_ids.forEach(chatId => {
      queryParams.append('chat_ids', chatId);
    });
  }
  
  if (params.group_by) {
    queryParams.append('group_by', params.group_by);
  }
  
  if (params.filter_keywords && params.filter_keywords.length > 0) {
    params.filter_keywords.forEach(keyword => {
      queryParams.append('filter_keywords', keyword);
    });
  }
  
  const url = `https://leadbee-keywords.dev.reflectai.pro/api/v1/analyzer/stats/hierarchical?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch hierarchical stats: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Start continuous analysis for a project
 * 
 * @param projectId - The ID of the project to analyze
 * @returns Promise with the result
 */
export const startAnalysis = async (projectId: string): Promise<any> => {
  const response = await fetch(
    `https://leadbee-keywords.dev.reflectai.pro/api/v1/analyzer/${projectId}/analyzer/start`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to start analysis: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Stop continuous analysis for a project
 * 
 * @param projectId - The ID of the project to stop analyzing
 * @returns Promise with the result
 */
export const stopAnalysis = async (projectId: string): Promise<any> => {
  const response = await fetch(
    `https://leadbee-keywords.dev.reflectai.pro/api/v1/analyzer/${projectId}/analyzer/stop`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to stop analysis: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Interface for one-time analysis request parameters
 */
export interface OneTimeAnalysisParams {
  start_date?: string;
  end_date?: string;
}

/**
 * Interface for one-time analysis response
 */
export interface OneTimeAnalysisResponse {
  status: string;
  project_id: string;
  task_id: string;
  message: string;
}

/**
 * Run a one-time analysis for a project within a specified date range
 * 
 * @param projectId - The ID of the project to analyze
 * @param params - Optional parameters including start and end dates
 * @returns Promise with the one-time analysis task information
 */
export const runOneTimeAnalysis = async (
  projectId: string,
  params: OneTimeAnalysisParams = {}
): Promise<OneTimeAnalysisResponse> => {
  const response = await fetch(
    `https://leadbee-keywords.dev.reflectai.pro/api/v1/analyzer/${projectId}/onetime-analyser`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        start_date: params.start_date,
        end_date: params.end_date
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to run one-time analysis: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Interface for one-time analysis status response
 */
export interface OneTimeAnalysisStatusResponse {
  task_id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  start_time: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  total_messages: number;
  matches_found: number;
  keywords_count: number;
  found_keywords: Record<string, any>;
  error_message?: string;
}

/**
 * Check the status of a one-time analysis task
 * 
 * @param taskId - The ID of the one-time analysis task
 * @returns Promise with the status of the one-time analysis task
 */
export const getOneTimeAnalysisStatus = async (
  taskId: string
): Promise<OneTimeAnalysisStatusResponse> => {
  const response = await fetch(
    `https://leadbee-keywords.dev.reflectai.pro/api/v1/analyzer/onetime-analysis/${taskId}/status`,
    {
      headers: {
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get one-time analysis status: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

// Interface exports
export type {
  AnalysisStatusResponse,
  
};
