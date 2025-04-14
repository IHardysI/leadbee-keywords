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
 * Interface for notification chat objects
 */
export interface NotificationChat {
  chat_id: string;
  project_id: string;
  is_active: boolean;
  show_full_message: boolean;
  id: string;
  created_at: string;
  updated_at: string;
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

/**
 * Get list of Telegram groups with filtering and search capabilities
 * @param options Search and filtering options
 * @returns Promise containing filtered Telegram groups response
 */
export const getGroupsList = async ({
  page = 1,
  limit = 15,
  query = '',
  filter = {}
}: {
  page?: number;
  limit?: number;
  query?: string;
  filter?: Record<string, any>;
}): Promise<TelegramGroupsResponse> => {
  try {
    const offset = (page - 1) * limit;
    
    // Prepare params
    const params: Record<string, any> = { 
      limit, 
      offset,
      ts: new Date().getTime() 
    };
    
    // Add search query if provided
    if (query) {
      params.query = query;
    }
    
    // Add any additional filter parameters
    Object.entries(filter).forEach(([key, value]) => {
      params[key] = value;
    });
    
    // Construct URL with query parameters
    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, v.toString()])
    ).toString();
    
    const response = await fetch(
      `https://python-platforma-leadbee-freelance.reflectai.pro/group/list?${queryString}`,
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
    console.error('Error fetching groups list:', error);
    throw error;
  }
};

/**
 * Add multiple chats to a project in a single request
 * @param chats Array of chat data to add
 * @returns Promise containing the API response
 */
export const addChatsToProjectBatch = async (chats: Array<{ 
  project_id: string, 
  chat_id: string,
  chat_name: string,
  chat_type: string
}>): Promise<any> => {
  try {
    const response = await fetch(
      'https://leadbee-keywords.dev.reflectai.pro/api/v1/chats/batch',
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chats }),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error adding chats to project in batch:', error);
    throw error;
  }
};

/**
 * Fetch notification chats for a specific project
 * @param projectId The ID of the project
 * @returns Promise containing an array of notification chats
 */
export async function getProjectNotificationChats(projectId: string): Promise<NotificationChat[]> {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/notifications/projects/${projectId}/telegram-chats`,
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
    
    return response.json() as Promise<NotificationChat[]>;
  } catch (error) {
    console.error('Error fetching notification chats:', error);
    throw error;
  }
}

/**
 * Activate a notification chat for a project
 * @param projectId The project ID
 * @param chatId The chat ID to activate
 * @returns Promise containing the updated notification chat
 */
export async function activateNotificationChat(projectId: string, chatId: string): Promise<NotificationChat> {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/notifications/projects/${projectId}/telegram-chats/${chatId}/activate`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<NotificationChat>;
  } catch (error) {
    console.error('Error activating notification chat:', error);
    throw error;
  }
}

/**
 * Deactivate a notification chat for a project
 * @param projectId The project ID
 * @param chatId The chat ID to deactivate
 * @returns Promise containing the updated notification chat
 */
export async function deactivateNotificationChat(projectId: string, chatId: string): Promise<NotificationChat> {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/notifications/projects/${projectId}/telegram-chats/${chatId}/deactivate`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<NotificationChat>;
  } catch (error) {
    console.error('Error deactivating notification chat:', error);
    throw error;
  }
}

/**
 * Delete a notification chat from a project
 * @param projectId The project ID
 * @param chatId The chat ID to delete
 * @returns Promise containing the API response
 */
export async function deleteNotificationChat(projectId: string, chatId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/notifications/projects/${projectId}/telegram-chats/${chatId}`,
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
    
    return response.json();
  } catch (error) {
    console.error('Error deleting notification chat:', error);
    throw error;
  }
}

/**
 * Add a new notification chat to a project
 * @param projectId The project ID
 * @param data The notification chat data to add
 * @returns Promise containing the created notification chat
 */
export async function addNotificationChat(
  projectId: string, 
  data: {
    chat_id: string;
    project_id: string;
    is_active: boolean;
    show_full_message: boolean;
  }
): Promise<NotificationChat> {
  try {
    const response = await fetch(
      `https://leadbee-keywords.dev.reflectai.pro/api/v1/notifications/projects/${projectId}/telegram-chats`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json() as Promise<NotificationChat>;
  } catch (error) {
    console.error('Error adding notification chat:', error);
    throw error;
  }
}
