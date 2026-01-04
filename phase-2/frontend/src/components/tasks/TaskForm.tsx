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
    formState: { errors }
  } = useForm<CreateTaskFormData>({
    defaultValues: mode === 'edit' && task ? {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      due_date: task.due_date || '',
    } : {
      title: '',
      description: '',
      priority: 'medium',
      category: 'other',
      due_date: '',
    }
  });

  const createMutation = useCreateTask(userId);
  const updateMutation = useUpdateTask(userId);

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = {
        ...data,
        due_date: data.due_date || undefined,
        description: data.description || undefined,
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
              }
            }
          }}
          render={({ field }) => (
            <Input
              label="Due Date"
              type="date"
              error={errors.due_date?.message}
              {...field}
            />
          )}
        />
      </form>
    </Dialog>
  );
};