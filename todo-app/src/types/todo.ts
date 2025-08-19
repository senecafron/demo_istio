export interface User {
  userId: string;
  email?: string;
  createdAt: string;
}

export interface Todo {
  todoId: string;
  userId: string;
  todoName: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  userId: string;
  todoName: string;
}

export interface UpdateTodoRequest {
  todoId: string;
  todoName?: string;
  completed?: boolean;
}

export interface CreateUserResponse {
  userId: string;
}

export interface SetUserEmailRequest {
  userId: string;
  userEmail: string;
}

export interface GetTodosRequest {
  userEmail: string;
}

export interface GetTodosResponse {
  userId: string;
  userEmail: string;
  todos: Todo[];
}