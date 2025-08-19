import { Todo } from '@/types/todo';
import Button from './Button';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="group">
      <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-lg border transition-all duration-300 transform hover:scale-102 hover:shadow-xl ${
        todo.completed 
          ? 'bg-gradient-to-r from-green-100/80 to-emerald-100/80 backdrop-blur-sm border-green-200/50 shadow-green-200/50' 
          : 'bg-white/90 backdrop-blur-sm border-white/50 hover:bg-white/95'
      }`}>
        <div className="relative">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.todoId)}
            className="w-5 h-5 text-blue-600 bg-white/80 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all duration-200 hover:scale-110"
          />
          {todo.completed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-green-600 text-lg">✓</span>
            </div>
          )}
        </div>
        
        <span
          className={`flex-1 transition-all duration-300 ${
            todo.completed
              ? 'text-gray-600 line-through opacity-75'
              : 'text-gray-800 font-medium'
          }`}
        >
          {todo.todoName}
        </span>
        
        <Button
          onClick={() => onDelete(todo.todoId)}
          variant="danger"
          className="opacity-0 group-hover:opacity-100"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}