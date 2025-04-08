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
