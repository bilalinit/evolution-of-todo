/**
 * React Query Hooks for Tasks
 *
 * Provides hooks for task operations with optimistic updates and error handling.
 * Based on the specification in specs/003-nextjs-frontend/contracts/rest-api.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion
} from '@/lib/api/tasks';
import { TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '@/lib/api/types';
import { toast } from 'sonner';

/**
 * Hook to fetch tasks with filters
 */
export function useTasks(userId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', userId, filters],
    queryFn: () => getTasks(userId, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once on failure
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => createTask(userId, data),
    onSuccess: (response) => {
      // Invalidate and refetch tasks and stats
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', userId] });

      // Show success toast
      toast.success('Task created successfully', {
        description: `"${response.task.title}" has been added to your tasks.`
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create task', {
        description: error.message || 'Please try again.'
      });
    },
  });
}

/**
 * Hook to update an existing task
 */
export function useUpdateTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      updateTask(userId, taskId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      toast.success('Task updated successfully', {
        description: `"${response.task.title}" has been updated.`
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update task', {
        description: error.message || 'Please try again.'
      });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(userId, taskId),
    onSuccess: () => {
      // Invalidate all task queries for this user (matches any filter combination)
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', userId] });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete task', {
        description: error.message || 'Please try again.'
      });
    },
  });
}

/**
 * Hook to toggle task completion with optimistic updates
 */
export function useToggleTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => toggleTaskCompletion(userId, taskId),
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks', userId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['tasks', userId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          tasks: oldData.tasks.map((task: any) =>
            task.id === taskId
              ? { ...task, completed: !task.completed }
              : task
          ),
        };
      });

      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Rollback to previous state on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', userId], context.previousTasks);
      }
      toast.error('Failed to update task status', {
        description: 'Please try again.'
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['task-stats', userId] });
    },
  });
}

/**
 * Hook to get task statistics
 */
export function useTaskStats(userId: string) {
  return useQuery({
    queryKey: ['task-stats', userId],
    queryFn: async () => {
      const result = await getTasks(userId);
      return {
        total: result.total,
        completed: result.completed_count,
        pending: result.pending_count,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}