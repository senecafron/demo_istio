'use client';

import { useState } from 'react';

interface AddTodoFormProps {
  onAddTodo: (text: string) => void;
}

export default function AddTodoForm({ onAddTodo }: AddTodoFormProps) {
  const [newTodo, setNewTodo] = useState('');

  const handleSubmit = () => {
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 mb-8">
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a magical todo..."
        className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white/90 transition-all duration-300 placeholder-gray-600 text-gray-800"
      />
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transform hover:scale-105 active:scale-95 transition-all duration-200 font-semibold"
      >
        Add
      </button>
    </div>
  );
}