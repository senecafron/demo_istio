import {
  User,
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  CreateUserResponse,
  SetUserEmailRequest,
  GetTodosRequest,
  GetTodosResponse,
} from '@/types/todo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}

export const userApi = {
  async createUser(): Promise<CreateUserResponse> {
    return apiRequest('/create-user', {
      method: 'POST',
    });
  },

  async setUserEmail(request: SetUserEmailRequest): Promise<User> {
    return apiRequest('/set-user-email', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getUserByEmail(userEmail: string): Promise<GetTodosResponse | null> {
    try {
      return await todoApi.getTodos({ userEmail });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null; // User not found
      }
      throw error;
    }
  },
};

export const todoApi = {
  async createTodo(request: CreateTodoRequest): Promise<Todo> {
    return apiRequest('/create-todo-item', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async updateTodo(request: UpdateTodoRequest): Promise<Todo> {
    return apiRequest('/update-todo-item', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async getTodos(request: GetTodosRequest): Promise<GetTodosResponse> {
    // Using GET with query parameters
    const params = new URLSearchParams({ userEmail: request.userEmail });
    return apiRequest(`/get-todo-items?${params}`, {
      method: 'GET',
    });
  },
};

export { ApiError };