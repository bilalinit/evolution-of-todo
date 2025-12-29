/**
 * Demo Task API - Mock Data for Testing
 *
 * Provides mock task data and operations for testing without a backend.
 * This allows you to test the full UI functionality immediately.
 */

import { Task, TaskFilters } from '@/types/task';
import { TaskListResponse, TaskDetailResponse, CreateTaskRequest, UpdateTaskRequest } from './types';

// Mock data storage
let mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the todo app",
    completed: false,
    priority: "high",
    category: "work",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_id: "demo-user-123"
  },
  {
    id: "task-2",
    title: "Buy groceries",
    description: "Milk, eggs, bread, and fresh vegetables",
    completed: true,
    priority: "low",
    category: "shopping",
    due_date: new Date().toISOString().split('T')[0], // Today
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user_id: "demo-user-123"
  },
  {
    id: "task-3",
    title: "Morning workout",
    description: "30 minutes cardio and strength training",
    completed: false,
    priority: "medium",
    category: "health",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user_id: "demo-user-123"
  },
  {
    id: "task-4",
    title: "Call mom",
    description: "Check in and catch up over the weekend",
    completed: false,
    priority: "medium",
    category: "personal",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    user_id: "demo-user-123"
  },
  {
    id: "task-5",
    title: "Plan weekend trip",
    description: "Research destinations and book accommodation",
    completed: false,
    priority: "low",
    category: "other",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    user_id: "demo-user-123"
  }
];

// Helper function to simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all tasks with filters
 */
export async function getTasks(userId: string, filters?: TaskFilters): Promise<TaskListResponse> {
  await delay(); // Simulate network delay

  let filteredTasks = [...mockTasks];

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    filteredTasks = filteredTasks.filter(task =>
      filters.status === 'completed' ? task.completed : !task.completed
    );
  }

  if (filters?.priority && filters.priority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
  }

  if (filters?.category && filters.category !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.category === filters.category);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filteredTasks = filteredTasks.filter(task =>
      task.title.toLowerCase().includes(search) ||
      (task.description && task.description.toLowerCase().includes(search))
    );
  }

  // Apply sorting
  if (filters?.sort_by) {
    filteredTasks.sort((a, b) => {
      let aVal: any = a[filters.sort_by as keyof Task];
      let bVal: any = b[filters.sort_by as keyof Task];

      // Handle dates
      if (filters.sort_by === 'due_date' || filters.sort_by === 'created_at') {
        aVal = aVal ? new Date(aVal as string).getTime() : 0;
        bVal = bVal ? new Date(bVal as string).getTime() : 0;
      }

      // Handle priority sorting
      if (filters.sort_by === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aVal = priorityOrder[a.priority];
        bVal = priorityOrder[b.priority];
      }

      if (filters.order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }

  const completed_count = filteredTasks.filter(t => t.completed).length;
  const pending_count = filteredTasks.filter(t => !t.completed).length;

  return {
    tasks: filteredTasks,
    total: filteredTasks.length,
    completed_count,
    pending_count
  };
}

/**
 * Get a single task by ID
 */
export async function getTask(userId: string, taskId: string): Promise<TaskDetailResponse> {
  await delay();

  const task = mockTasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  return { task };
}

/**
 * Create a new task
 */
export async function createTask(userId: string, data: CreateTaskRequest): Promise<TaskDetailResponse> {
  await delay();

  const newTask: Task = {
    id: `task-${Date.now()}`,
    ...data,
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: userId
  };

  mockTasks.unshift(newTask); // Add to beginning

  return { task: newTask };
}

/**
 * Update an existing task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: UpdateTaskRequest
): Promise<TaskDetailResponse> {
  await delay();

  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const updatedTask: Task = {
    ...mockTasks[taskIndex],
    ...data,
    updated_at: new Date().toISOString(),
  };

  mockTasks[taskIndex] = updatedTask;

  return { task: updatedTask };
}

/**
 * Delete a task
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  await delay();

  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  mockTasks.splice(taskIndex, 1);
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(
  userId: string,
  taskId: string
): Promise<TaskDetailResponse> {
  await delay();

  const taskIndex = mockTasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const task = mockTasks[taskIndex];
  const updatedTask: Task = {
    ...task,
    completed: !task.completed,
    updated_at: new Date().toISOString(),
  };

  mockTasks[taskIndex] = updatedTask;

  return { task: updatedTask };
}

/**
 * Reset mock data (useful for testing)
 */
export function resetMockTasks(): void {
  mockTasks = [
    {
      id: "task-1",
      title: "Complete project documentation",
      description: "Write comprehensive documentation for the todo app",
      completed: false,
      priority: "high",
      category: "work",
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user_id: "demo-user-123"
    },
    {
      id: "task-2",
      title: "Buy groceries",
      description: "Milk, eggs, bread, and fresh vegetables",
      completed: true,
      priority: "low",
      category: "shopping",
      due_date: new Date().toISOString().split('T')[0],
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user_id: "demo-user-123"
    },
    {
      id: "task-3",
      title: "Morning workout",
      description: "30 minutes cardio and strength training",
      completed: false,
      priority: "medium",
      category: "health",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      user_id: "demo-user-123"
    }
  ];
}

/**
 * Get user profile and stats (demo)
 */
export async function getProfile(userId: string): Promise<any> {
  await delay();

  return {
    user: {
      id: userId,
      email: "demo@example.com",
      name: "Demo User",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    stats: {
      total_tasks: mockTasks.length,
      completed_tasks: mockTasks.filter(t => t.completed).length,
      pending_tasks: mockTasks.filter(t => !t.completed).length,
    }
  };
}

/**
 * Update user profile (demo)
 */
export async function updateProfile(userId: string, data: { name: string }): Promise<any> {
  await delay();

  return {
    user: {
      id: userId,
      email: "demo@example.com",
      name: data.name,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  };
}

/**
 * Change password (demo)
 */
export async function changePassword(userId: string, data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}): Promise<any> {
  await delay();

  return { message: "Password changed successfully" };
}