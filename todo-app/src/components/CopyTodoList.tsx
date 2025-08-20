'use client';

import { useState } from 'react';
import { User } from '@/types/todo';
import { todoApi, ApiError } from '@/services/api';
import Button from './Button';

interface CopyTodoListProps {
  currentUser: User;
  onCopyComplete: () => void;
  onClose: () => void;
}

export default function CopyTodoList({ currentUser, onCopyComplete, onClose }: CopyTodoListProps) {
  const [sourceEmail, setSourceEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!sourceEmail.trim()) {
      setError('Please enter a source email address');
      return;
    }

    if (sourceEmail.trim() === currentUser.email) {
      setError('Cannot copy todos from yourself');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await todoApi.copyTodoList({
        source: currentUser.email!,
        target: sourceEmail.trim()
      });
      
      setSuccess(response.message || 'Todos copied successfully!');
      setTimeout(() => {
        onCopyComplete();
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to copy todos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCopy();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow-lg">
          Copy Todos from Another User
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Enter the email address of the user whose todos you want to copy:
            </label>
            <input
              type="email"
              value={sourceEmail}
              onChange={(e) => setSourceEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="user@example.com"
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white/90 transition-all duration-300 placeholder-gray-600 text-gray-800"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/50 rounded-2xl p-4">
              <p className="text-white text-center font-medium">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/20 backdrop-blur-sm border border-green-300/50 rounded-2xl p-4">
              <p className="text-white text-center font-medium">{success}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="danger"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              className={`flex-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              variant="primary"
            >
              {isLoading ? 'Copying...' : 'Copy Todos'}
            </Button>
          </div>
        </div>
        
        <p className="text-white/60 text-xs text-center mt-4">
          Press Escape to close
        </p>
      </div>
    </div>
  );
}