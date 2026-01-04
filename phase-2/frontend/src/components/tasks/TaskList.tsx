/**
 * TaskList Component
 * Modern Technical Editorial Design System
 * Displays a list of tasks with empty state handling
 */

import * as React from 'react';
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  isUpdating?: string[];
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  emptyStateType?: 'no-tasks' | 'no-results';
  searchQuery?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  isUpdating = [],
  onToggle,
  onEdit,
  onDelete,
  emptyStateType = 'no-tasks',
  searchQuery
}) => {
  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonList count={5} />
      </div>
    );
  }

  // Show empty state if no tasks
  if (tasks.length === 0) {
    return (
      <EmptyState
        type={emptyStateType}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isUpdating={isUpdating.includes(task.id)}
        />
      ))}
    </div>
  );
};