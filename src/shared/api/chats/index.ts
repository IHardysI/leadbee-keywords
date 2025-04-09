export interface ChatGroup {
  chat_id: string;
  chat_name: string;
  chat_type: string;
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}
export interface ChatGroups {
  chat_id: string;
  chat_name: string;
  chat_type: string;
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}


export interface TelegramGroupsResponse {
  status: string;
  groups: Array<{
    id: string;
    title: string;
    telegram_id: number;
    join_link: string;
    parsing: boolean;
    analysis_status: string;
    analysis_result: any;
    joined_accounts: string[];
    parsing_for_search: boolean;
  }>;
  total_count: number;
}

/**
 * Fetch groups/chats for a specific project by ID
 * @param projectId The ID of the project
 * @returns Promise containing an array of chat groups
 */
export async function getChatsByProjectId(projectId: string): Promise<ChatGroup[]> {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/chats/by-project/${projectId}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<ChatGroup[]>;
  } catch (error) {
    console.error('Error fetching groups by project ID:', error);
    throw error;
  }
}

/**
 * Fetch all Telegram chat groups with pagination
 * @param page Page number (starting from 1)
 * @param limit Number of items per page
 * @returns Promise containing paginated Telegram groups response
 */
export async function getTelegramGroups(page: number = 1, limit: number = 10): Promise<TelegramGroupsResponse> {
  try {
    const offset = (page - 1) * limit;
    const response = await fetch(
      `https://python-platforma-leadbee-freelance.reflectai.pro/group/list?limit=${limit}&offset=${offset}&ts=${new Date().getTime()}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<TelegramGroupsResponse>;
  } catch (error) {
    console.error('Error fetching Telegram groups:', error);
    throw error;
  }
}

/**
 * Fetch all chat groups across all projects
 * @returns Promise containing an array of chat groups
 */
export async function getAllChats(): Promise<ChatGroups[]> {
  try {
    const response = await fetch(
      'https://leadbee-keywords.dev.reflectai.pro/api/v1/chats',
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<ChatGroup[]>;
  } catch (error) {
    console.error('Error fetching all chats:', error);
    throw error;
  }
}

/**
 * Add a chat to a project
 * @param chatData The chat data to add
 * @returns Promise containing the added chat
 */
export const addChatToProject = async (params: { 
  project_id: string, 
  chat_id: string,
  chat_name: string,
  chat_type: string
}): Promise<any> => {
  try {
    const response = await fetch(
      'https://leadbee-keywords.dev.reflectai.pro/api/v1/chats/',
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<ChatGroup>;
  } catch (error) {
    console.error('Error adding chat to project:', error);
    throw error;
  }
};

/**
 * Delete a chat from a project
 * @param params Object containing the chat ID to delete
 * @returns Promise with void on success
 */
export const deleteChat = async (params: { project_id: string, chat_id: string }): Promise<any> => {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/chats/${params.chat_id}`,
      {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return;
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

/**
 * Create a new Telegram group by join link
 * @param joinLink The Telegram group join link
 * @returns Promise with the created group data
 */
export async function createGroup(joinLink: string): Promise<any> {
  try {
    const response = await fetch(
      'https://python-platforma-leadbee-freelance.reflectai.pro/group', 
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ join_link: joinLink }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}
