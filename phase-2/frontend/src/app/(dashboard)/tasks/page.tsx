/**
 * Tasks Page
 * Modern Technical Editorial Design System
 * Main dashboard page for task management
 */

"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/hooks";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/useTasks";
import { useDebounce } from "@/hooks/useDebounce";
import { useDialog } from "@/components/ui/Dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskSearch } from "@/components/tasks/TaskSearch";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskSort } from "@/components/tasks/TaskSort";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import { Task, ActiveFilters, SortConfig } from "@/types/task";
import { useTaskFilters } from "@/hooks/useTaskFilters";

export default function TasksPage() {
  const { session, isLoading: sessionLoading } = useSession();
  const queryClient = useQueryClient();

  // Dialog state for TaskForm
  const {
    isOpen: isFormOpen,
    open: openForm,
    close: closeForm,
  } = useDialog();

  // Form mode state
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [editingTask, setEditingTask] = React.useState<Task | undefined>();

  // Use the new task filters hook
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    sortConfig,
    updateSort,
    hasActiveFilters,
  } = useTaskFilters();

  // Debounced search for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get user ID from session
  const userId = session?.user?.id;

  // Tasks query with filters
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
  } = useTasks(userId || '');

  // Mutations
  const toggleMutation = useToggleTask(userId || '');
  const deleteMutation = useDeleteTask(userId || '');

  // Loading state
  if (sessionLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-[#2A1B12]/10 rounded w-1/3 animate-pulse" />
        <div className="h-96 bg-[#2A1B12]/10 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return null; // AuthGuard should handle this
  }

  // Handlers
  const handleCreateTask = () => {
    setFormMode('create');
    setEditingTask(undefined);
    openForm();
  };

  const handleEditTask = (task: Task) => {
    setFormMode('edit');
    setEditingTask(task);
    openForm();
  };

  const handleToggleTask = (taskId: string) => {
    toggleMutation.mutate(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteMutation.mutate(taskId);
  };

  // Get tasks from data
  const rawTasks = tasksData?.tasks || [];

  // Client-side filtering and sorting
  const tasks = React.useMemo(() => {
    if (!rawTasks.length) return [];

    let filtered = [...rawTasks];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(task =>
        filters.status === 'completed' ? task.completed : !task.completed
      );
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const { field, order } = sortConfig;
      const multiplier = order === 'asc' ? 1 : -1;

      switch (field) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'priority': {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return multiplier * (priorityWeight[a.priority] - priorityWeight[b.priority]);
        }
        case 'due_date': {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1; // No due date at end
          if (!b.due_date) return -1;
          return multiplier * (new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        }
        case 'created_at':
        default:
          return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });
  }, [rawTasks, sortConfig, filters, debouncedSearch]);
  const stats = tasksData ? {
    total: tasksData.total,
    completed: tasksData.completed_count,
    pending: tasksData.pending_count,
  } : { total: 0, completed: 0, pending: 0 };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#2A1B12]">
            My Tasks
          </h1>
          <p className="font-sans text-[#5C4D45] mt-1">
            Welcome back, {session.user.name || "User"}!
          </p>
        </div>
        <Button onClick={handleCreateTask} variant="primary">
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45]">
              Total Tasks
            </p>
            <p className="font-serif text-3xl font-bold text-[#2A1B12] mt-1">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45]">
              Pending
            </p>
            <p className="font-serif text-3xl font-bold text-[#FF6B4A] mt-1">
              {stats.pending}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#5C4D45]">
              Completed
            </p>
            <p className="font-serif text-3xl font-bold text-green-600 mt-1">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <CardDescription>Find and organize your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <TaskSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks by title or description..."
            />

            {/* Filters and Sort Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TaskFilters
                filters={filters}
                onFilterChange={updateFilter}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
                className="lg:col-span-2"
              />
              <TaskSort
                sortConfig={sortConfig}
                onSortChange={updateSort}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Tasks</CardTitle>
          <CardDescription>
            {hasActiveFilters
              ? `Showing filtered results (${tasks.length} tasks)`
              : `${tasks.length} tasks total`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList
            tasks={tasks}
            isLoading={tasksLoading || tasksFetching}
            isUpdating={[
              ...(toggleMutation.isPending ? [toggleMutation.variables!] : []),
              ...(deleteMutation.isPending ? [deleteMutation.variables!] : []),
            ]}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            emptyStateType={hasActiveFilters ? 'no-results' : 'no-tasks'}
            searchQuery={searchQuery}
          />
        </CardContent>
      </Card>

      {/* Task Form Modal */}
      <TaskForm
        mode={formMode}
        task={editingTask}
        userId={userId || ''}
        isOpen={isFormOpen}
        onClose={closeForm}
      />
    </div>
  );
}