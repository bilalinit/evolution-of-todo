/**
 * TaskItem Component
 * Modern Technical Editorial Design System
 * Displays a single task with all visual elements
 */

import * as React from 'react';
import { Check, Edit2, Trash2 } from 'lucide-react';
import { Task } from '@/types/task';
import { PriorityBadge, CategoryBadge, StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isUpdating?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isUpdating = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
    } else {
      setShowDeleteConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleToggle = () => {
    if (!isUpdating) {
      onToggle(task.id);
    }
  };

  return (
    <div className={`
      group relative overflow-hidden
      border border-[#2A1B12]/20 bg-[#F9F7F2]
      transition-all duration-200
      ${task.completed ? 'opacity-75' : ''}
      ${isUpdating ? 'opacity-50 pointer-events-none' : ''}
    `}>
      {/* Technical Lines - Subtle connection lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute left-0 top-0 w-1 h-full bg-[#2A1B12]/10" />
        <div className="absolute left-0 top-0 w-full h-1 bg-[#2A1B12]/10" />
      </div>

      <div className="relative p-4 flex items-start gap-4">
        {/* Checkbox Toggle */}
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className={`
            flex-shrink-0 w-6 h-6 border-2 rounded-md
            flex items-center justify-center
            transition-all duration-200
            ${task.completed
              ? 'bg-[#FF6B4A] border-[#FF6B4A] text-white'
              : 'bg-[#F9F7F2] border-[#2A1B12]/30 hover:border-[#FF6B4A]'
            }
            ${isUpdating ? 'cursor-wait' : 'cursor-pointer'}
          `}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        >
          {task.completed && <Check className="w-4 h-4" strokeWidth={3} />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`
                font-serif font-bold text-[#2A1B12] text-lg leading-tight mb-1
                ${task.completed ? 'line-through opacity-60' : ''}
              `}>
                {task.title}
              </h3>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <PriorityBadge priority={task.priority} />
                <CategoryBadge category={task.category} />
                <StatusBadge completed={task.completed} />
                {task.due_date && (
                  <span className="font-mono text-[10px] text-[#5C4D45] uppercase tracking-widest">
                    DUE: {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onEdit(task)}
                disabled={isUpdating}
                className="p-2 hover:bg-[#2A1B12]/10 rounded-md transition-colors"
                aria-label="Edit task"
              >
                <Edit2 className="w-4 h-4 text-[#2A1B12]" strokeWidth={1.5} />
              </button>

              <button
                onClick={handleDelete}
                disabled={isUpdating}
                className={`
                  p-2 rounded-md transition-colors
                  ${showDeleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'hover:bg-[#2A1B12]/10 text-[#2A1B12]'
                  }
                `}
                aria-label={showDeleteConfirm ? "Confirm delete" : "Delete task"}
              >
                <Trash2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`
              font-sans text-sm text-[#5C4D45] mb-2
              ${task.completed ? 'opacity-60' : ''}
            `}>
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#5C4D45] uppercase tracking-widest">
            <span>CREATED: {formatRelativeTime(task.created_at)}</span>
            {task.updated_at !== task.created_at && (
              <span>UPDATED: {formatRelativeTime(task.updated_at)}</span>
            )}
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
              <span className="font-sans text-sm text-red-900 font-medium">
                Are you sure you want to delete this task?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 font-mono text-xs uppercase tracking-widest hover:bg-red-100 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 font-mono text-xs uppercase tracking-widest bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-[#2A1B12]/10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#FF6B4A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};