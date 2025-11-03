'use client';

import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onTaskComplete?: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed' | 'overdue';

export function TaskList({ tasks, onTaskComplete, onTaskClick }: TaskListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = tasks.filter((task) => {
    // Derive status from completed_at field if status is not provided
    const taskStatus = task.status || (task.completedAt ? 'completed' : 'pending');

    // Apply status filter
    if (filter === 'overdue') {
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && taskStatus !== 'completed';
      if (!isOverdue) return false;
    } else if (filter !== 'all' && taskStatus !== filter) {
      return false;
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.taskType.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return tasks.length;
    if (filterType === 'overdue') {
      return tasks.filter((t) => {
        const taskStatus = t.status || (t.completedAt ? 'completed' : 'pending');
        return t.dueDate && new Date(t.dueDate) < new Date() && taskStatus !== 'completed';
      }).length;
    }
    return tasks.filter((t) => {
      const taskStatus = t.status || (t.completedAt ? 'completed' : 'pending');
      return taskStatus === filterType;
    }).length;
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'הכל' },
    { value: 'pending', label: 'ממתין' },
    { value: 'in_progress', label: 'בתהליך' },
    { value: 'overdue', label: 'באיחור' },
    { value: 'completed', label: 'הושלם' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="חפש משימות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 text-right"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => {
          const count = getFilterCount(f.value);
          return (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="whitespace-nowrap"
            >
              {f.label}
              <span
                className={`mr-2 ${
                  filter === f.value
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                } rounded-full px-2 py-0.5 text-xs font-medium`}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">
              {search ? 'לא נמצאו משימות מתאימות' : 'אין משימות להצגה'}
            </div>
            {search && (
              <Button
                variant="link"
                onClick={() => setSearch('')}
                className="text-primary"
              >
                נקה חיפוש
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onTaskComplete}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredTasks.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          מציג {filteredTasks.length} מתוך {tasks.length} משימות
        </div>
      )}
    </div>
  );
}
