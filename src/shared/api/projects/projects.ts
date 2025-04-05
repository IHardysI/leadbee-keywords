// Define Project interface based on the API response
export interface Project {
  id: string | number;
  name: string;
  description: string;
  created_at?: string | Date;
  updated_at: string;
}

// Define parameters for fetching projects
export interface GetProjectsParams {
  skip?: number;
  limit?: number;
}

// Base API URL
const API_BASE_URL = 'https://leadbee-keywords.dev.reflectai.pro/api/v1';

// Fix any types with proper interfaces
export interface Keyword {
  id: string;
  text: string;
  // Add other required fields
}

export interface Chat {
  id: string;
  name: string;
  // Add other required fields
}

/**
 * Response interface for project details
 */
export interface ProjectDetailsResponse {
  project: Project;
  keywords: Keyword[];
  chats: Chat[];
}

/**
 * Fetch projects from the API
 * @param params Optional parameters for pagination
 * @returns Promise with an array of Project objects
 */
export async function getProjects(params: GetProjectsParams = { skip: 0, limit: 100 }): Promise<Project[]> {
  try {
    const { skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });
    
    const response = await fetch(`${API_BASE_URL}/projects/?${queryParams}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
    }

    const data: Project[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Fetch a specific project by ID
 * @param id Project ID
 * @returns Promise with a ProjectDetailsResponse object
 */
export async function getProjectById(id: string): Promise<ProjectDetailsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}`);
    }

    const data: ProjectDetailsResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching project with id ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new project
 * @param data Project data (name and description)
 * @returns Promise with the created Project
 */
export async function createProject(data: { name: string; description: string }): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.status} ${response.statusText}`);
    }

    const createdProject: Project = await response.json();
    return createdProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Update an existing project
 * @param id Project ID
 * @param data Project data (name and description)
 * @returns Promise with the updated Project
 */
export async function updateProject(id: string | number, data: { name: string; description: string }): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.status} ${response.statusText}`);
    }

    const updatedProject: Project = await response.json();
    return updatedProject;
  } catch (error) {
    console.error(`Error updating project with id ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a project
 * @param id Project ID
 * @returns Promise with void
 */
export async function deleteProject(id: string | number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.status} ${response.statusText}`);
    }

    return;
  } catch (error) {
    console.error(`Error deleting project with id ${id}:`, error);
    throw error;
  }
}
