/**
 * TaskForm Component
 * Modern Technical Editorial Design System
 * Creates and edits tasks
 */

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { CreateTaskFormData, Task } from '@/types/task';
import { UpdateTaskRequest } from '@/lib/api/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Dialog, DialogActions } from '@/components/ui/Dialog';

/**
 * Convert UTC datetime string to local datetime string for datetime-local input
 * @param utcDateTime - UTC datetime string from backend (e.g., "2026-02-02T23:33:00Z")
 * @returns Local datetime string in format "YYYY-MM-DDTHH:mm" for datetime-local input
 */
function utcToLocalDateTime(utcDateTime: string): string {
  if (!utcDateTime) return '';

  // Parse UTC datetime (backend returns "2026-02-02T23:33:00Z")
  const utcDate = new Date(utcDateTime);

  // JavaScript getHours()/getMinutes() return LOCAL time automatically
  // No conversion needed - Date object handles it
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getDate()).padStart(2, '0');
  const hours = String(utcDate.getHours()).padStart(2, '0');
  const minutes = String(utcDate.getMinutes()).padStart(2, '0');

  const result = `${year}-${month}-${day}T${hours}:${minutes}`;

  console.log(`[TaskForm] UTC: ${utcDateTime} → Local: ${result}`);

  return result;
}

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: Task;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  task,
  userId,
  isOpen,
  onClose
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<CreateTaskFormData>({
    defaultValues: mode === 'edit' && task ? {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      due_date: task.due_date || '',
      recurring_rule: task.recurring_rule,
      recurring_end_date: task.recurring_end_date ? new Date(task.recurring_end_date).toISOString().slice(0, 16) : '',
      reminder_at: task.reminder_at ? utcToLocalDateTime(task.reminder_at) : '',
      tags: task.tags?.join(', ') || '',
    } : {
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      due_date: '',
      recurring_rule: undefined,
      recurring_end_date: '',
      reminder_at: '',
      tags: '',
    }
  });

  // Watch for recurring_rule to show/hide validation
  const recurringRule = watch('recurring_rule');
  const dueDate = watch('due_date');

  const createMutation = useCreateTask(userId);
  const updateMutation = useUpdateTask(userId);

  // Populate form with task data when opening for edit, or reset when closing
  React.useEffect(() => {
    if (isOpen && mode === 'edit' && task) {
      // Populate form with existing task data for editing
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        category: task.category,
        due_date: task.due_date || '',
        recurring_rule: task.recurring_rule,
        recurring_end_date: task.recurring_end_date ? new Date(task.recurring_end_date).toISOString().slice(0, 16) : '',
        reminder_at: task.reminder_at ? utcToLocalDateTime(task.reminder_at) : '',
        tags: task.tags?.join(', ') || '',
      });
    } else if (!isOpen) {
      // Reset form when dialog closes
      reset();
    }
  }, [isOpen, mode, task, reset]);

  // Reset form when switching from edit to create mode (without closing dialog)
  React.useEffect(() => {
    if (isOpen && mode === 'create') {
      // Reset to blank form for creating new task
      reset({
        title: '',
        description: '',
        priority: 'medium',
        category: 'other',
        due_date: '',
        recurring_rule: undefined,
        recurring_end_date: '',
        reminder_at: '',
        tags: '',
      });
    }
  }, [isOpen, mode, reset]);

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      // Convert comma-separated tags to array
      // Convert datetime-local strings (local time) to UTC for backend
      const toUTC = (dateStr: string) => {
        if (!dateStr) return undefined;
        // datetime-local gives us "YYYY-MM-DDTHH:MM" without timezone
        // new Date() parses this as local time, toISOString() converts to UTC
        const localDate = new Date(dateStr);
        // Return full ISO string with Z suffix (UTC)
        return localDate.toISOString();
      };

      const cleanedData = {
        ...data,
        due_date: data.due_date || undefined,
        description: data.description || undefined,
        recurring_rule: data.recurring_rule || undefined,
        recurring_end_date: toUTC(data.recurring_end_date || ''),
        reminder_at: toUTC(data.reminder_at || ''),
        tags: data.tags
          ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
          : undefined,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(cleanedData);
      } else if (task) {
        await updateMutation.mutateAsync({
          taskId: task.id,
          data: cleanedData as UpdateTaskRequest
        });
      }
      onClose();
    } catch (error) {
      // Error handling is done in the hooks
      console.error('Form submission error:', error);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
  ];

  const categoryOptions = [
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'health', label: 'Health' },
    { value: 'other', label: 'Other' },
  ];

  const recurringRuleOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const formId = `task-form-${mode}`;

  const formActions = (
    <DialogActions>
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={createMutation.isPending || updateMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form={formId}
        variant="primary"
        loading={createMutation.isPending || updateMutation.isPending}
      >
        {mode === 'create' ? 'Create Task' : 'Save Changes'}
      </Button>
    </DialogActions>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
      actions={formActions}
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <Controller
          name="title"
          control={control}
          rules={{
            required: 'Title is required',
            minLength: { value: 1, message: 'Title must be at least 1 character' },
            maxLength: { value: 200, message: 'Title must be 200 characters or less' }
          }}
          render={({ field }) => (
            <Input
              label="Title"
              placeholder="Enter task title..."
              error={errors.title?.message}
              required
              {...field}
            />
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          rules={{
            maxLength: { value: 1000, message: 'Description must be 1000 characters or less' }
          }}
          render={({ field }) => (
            <Input
              label="Description"
              placeholder="Enter task description (optional)..."
              error={errors.description?.message}
              as="textarea"
              rows={3}
              {...field}
            />
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <Controller
            name="priority"
            control={control}
            rules={{ required: 'Priority is required' }}
            render={({ field }) => (
              <Select
                label="Priority"
                placeholder="Select priority"
                options={priorityOptions}
                error={errors.priority?.message}
                required
                {...field}
              />
            )}
          />

          {/* Category */}
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Select
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
                error={errors.category?.message}
                required
                {...field}
              />
            )}
          />
        </div>

        {/* Due Date */}
        <Controller
          name="due_date"
          control={control}
          rules={{
            validate: {
              futureDate: (value) => {
                if (!value) return true;
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate >= today || 'Due date must be today or in the future';
              },
              requiredForRecurring: (value) => {
                if (recurringRule && !value) {
                  return 'Due date is required for recurring tasks';
                }
                return true;
              }
            }
          }}
          render={({ field }) => (
            <Input
              label="Due Date"
              type="date"
              error={errors.due_date?.message}
              required={!!recurringRule}
              {...field}
            />
          )}
        />

        {/* Recurring Rule */}
        <Controller
          name="recurring_rule"
          control={control}
          render={({ field }) => (
            <Select
              label="Repeat (Optional)"
              placeholder="No repetition"
              options={recurringRuleOptions}
              error={errors.recurring_rule?.message}
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value || undefined)}
            />
          )}
        />

        {/* Recurring End Date */}
        {recurringRule && (
          <Controller
            name="recurring_end_date"
            control={control}
            rules={{
              validate: {
                afterDueDate: (value) => {
                  if (!value) return true; // Optional
                  if (!dueDate) return 'Set a due date first';
                  const endDate = new Date(value);
                  const start = new Date(dueDate);
                  return endDate > start || 'End date must be after due date';
                }
              }
            }}
            render={({ field }) => (
              <Input
                label="Repeat Until"
                type="date"
                placeholder="Optional end date"
                error={errors.recurring_end_date?.message}
                {...field}
              />
            )}
          />
        )}

        {/* Reminder At */}
        <Controller
          name="reminder_at"
          control={control}
          render={({ field }) => (
            <Input
              label="Reminder (Optional)"
              type="datetime-local"
              placeholder="Set reminder time"
              error={errors.reminder_at?.message}
              {...field}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value || undefined)}
            />
          )}
        />

        {/* Tags */}
        <Controller
          name="tags"
          control={control}
          rules={{
            validate: {
              validTags: (value) => {
                if (!value) return true;
                // Check for invalid characters (only allow alphanumeric, space, comma, hyphen, underscore)
                const validPattern = /^[a-zA-Z0-9\s,\-_]*$/;
                return validPattern.test(value) || 'Tags can only contain letters, numbers, spaces, commas, hyphens, and underscores';
              }
            }
          }}
          render={({ field }) => (
            <Input
              label="Tags (Optional)"
              placeholder="Enter tags separated by commas"
              error={errors.tags?.message}
              {...field}
            />
          )}
        />
      </form>
    </Dialog>
  );
};