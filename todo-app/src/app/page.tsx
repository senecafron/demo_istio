'use client';

import { useState } from 'react';
import TodoItem from '@/components/TodoItem';
import AddTodoForm from '@/components/AddTodoForm';
import { Todo } from '@/types/todo';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string) => {
    const todo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos([...todos, todo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 transform hover:scale-105 transition-all duration-300">
          <h1 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Todo List
          </h1>
          
          <AddTodoForm onAddTodo={addTodo} />

          <div className="space-y-4">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
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
