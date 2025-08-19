'use client';

import { useState } from 'react';
import { User, Todo } from '@/types/todo';
import { userApi, ApiError } from '@/services/api';
import Button from './Button';

interface UserSetupProps {
  onUserReady: (user: User, todos: Todo[]) => void;
}

export default function UserSetup({ onUserReady }: UserSetupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, try to get existing user by email
      const existingUserData = await userApi.getUserByEmail(email.trim());
      console.log('UserSetup.tsx:29, Existing user data:', existingUserData);      
      if (existingUserData) {
        // User exists, use their data
        const user: User = {
          userId: existingUserData.userId,
          email: existingUserData.userEmail,
          createdAt: new Date().toISOString(), // We don't have this from the API response
        };
        onUserReady(user, existingUserData.todos);
      } else {
        // User doesn't exist, create new user
        const createUserResponse = await userApi.createUser();
        
        const user = await userApi.setUserEmail({
          userId: createUserResponse.userId,
          userEmail: email.trim(),
        });

        onUserReady(user, []);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-8 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-center drop-shadow-lg bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Welcome!
          </h1>
          <p className="text-white/80 text-center mb-8 drop-shadow-sm">
            Enter your email to get started with your todos
          </p>
          
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your email..."
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50 focus:bg-white/90 transition-all duration-300 placeholder-gray-600 text-gray-800"
              disabled={isLoading}
            />
            
            {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-300/50 rounded-2xl p-4">
                <p className="text-white text-center font-medium">{error}</p>
              </div>
            )}
            
            <Button
              onClick={handleSubmit}
              className={`w-full py-4 text-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              variant="primary"
            >
              {isLoading ? 'Setting up...' : 'Get Started'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}