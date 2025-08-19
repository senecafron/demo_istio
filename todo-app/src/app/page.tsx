'use client';

import { useState } from 'react';
import TodoItem from '@/components/TodoItem';
import AddTodoForm from '@/components/AddTodoForm';
import UserSetup from '@/components/UserSetup';
import { Todo, User } from '@/types/todo';
import { todoApi, ApiError } from '@/services/api';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUserReady = (newUser: User, userTodos: Todo[]) => {
    setUser(newUser);
    setTodos(userTodos);
  };

  const addTodo = async (todoName: string) => {
    if (!user) return;

    setError(null);
    try {
      const newTodo = await todoApi.createTodo({
        userId: user.userId,
        todoName,
      });
      setTodos([...todos, newTodo]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to add todo');
      }
    }
  };

  const toggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.todoId === todoId);
    if (!todo) return;

    setError(null);
    try {
      const updatedTodo = await todoApi.updateTodo({
        todoId,
        completed: !todo.completed,
      });
      setTodos(todos.map(t => 
        t.todoId === todoId ? updatedTodo : t
      ));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update todo');
      }
    }
  };

  const deleteTodo = async (todoId: string) => {
    setError(null);
    try {
      await todoApi.updateTodo({
        todoId,
        todoName: '[DELETED]',
        completed: true,
      });
      setTodos(todos.filter(t => t.todoId !== todoId));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete todo');
      }
    }
  };

  if (!user) {
    return <UserSetup onUserReady={handleUserReady} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white text-center drop-shadow-lg bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Todo List
            </h1>
            <div className="text-white/80 text-sm">
              {user.email}
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/50 rounded-2xl p-4 mb-6">
              <p className="text-white text-center font-medium">{error}</p>
            </div>
          )}
          
          <AddTodoForm onAddTodo={addTodo} />

          <div className="space-y-4">
            {todos.map((todo) => (
              <TodoItem
                key={todo.todoId}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
            
            {todos.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                  <p className="text-white text-lg font-medium drop-shadow-sm">
                    ✨ No todos yet. Add one above! ✨
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
