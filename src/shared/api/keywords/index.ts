const API_URL = 'https://leadbee-keywords.dev.reflectai.pro/api/v1';

export interface Keyword {
  id: string;
  word: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface GetKeywordsResponse {
  // Ответ приходит как массив, а не объект с массивом keywords
  // keywords: Keyword[];
}

/**
 * Fetches keywords for a specific project
 * @param projectId - The ID of the project to fetch keywords for
 * @returns A promise that resolves to the keywords response
 */
export async function getProjectKeywords(
  projectId: string
): Promise<Keyword[]> {
  const response = await fetch(
    `${API_URL}/projects/${projectId}/keywords`,
    {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch keywords: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Adds keywords in batch to a project
 * @param projectId - The ID of the project to add keywords to
 * @param words - Array of keywords to add
 * @returns A promise that resolves to the response
 */
export async function addKeywordsToProject(
  projectId: string | number,
  words: string[]
): Promise<any> {
  const response = await fetch(
    `${API_URL}/keywords/batch`,
    {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project_id: String(projectId),
        words
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add keywords: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Deletes a specific keyword by ID
 * @param keywordId - The ID of the keyword to delete
 * @returns A promise that resolves to the response
 */
export async function deleteKeyword(keywordId: string): Promise<any> {
  const response = await fetch(
    `${API_URL}/keywords/${keywordId}`,
    {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete keyword: ${response.statusText}`);
  }

  return response.json();
}
