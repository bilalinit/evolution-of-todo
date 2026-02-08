/**
 * useTaskFilters Hook
 *
 * Manages filter and sort state for task organization features.
 * Provides centralized state management for search, filters, and sorting.
 */

import { useState, useCallback, useMemo } from 'react';
import { ActiveFilters, SortConfig, TaskStatus, PriorityLevel, Category } from '@/types/task';

export interface UseTaskFiltersReturn {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filter state
  filters: ActiveFilters;
  setFilters: (filters: ActiveFilters) => void;
  updateFilter: (key: keyof ActiveFilters, value: string) => void;
  clearFilters: () => void;

  // Sort state
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  updateSort: (field: SortConfig['field'], order: SortConfig['order']) => void;

  // Derived state
  hasActiveFilters: boolean;
  activeFilterCount: number;

  // Reset all state
  reset: () => void;
}

export function useTaskFilters(): UseTaskFiltersReturn {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState<ActiveFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    order: 'desc',
  });

  // Update individual filter
  const updateFilter = useCallback((key: keyof ActiveFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
    });
    setSearchQuery('');
  }, []);

  // Update sort configuration
  const updateSort = useCallback((field: SortConfig['field'], order: SortConfig['order']) => {
    setSortConfig({ field, order });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filters.status !== 'all' ||
      filters.priority !== 'all' ||
      filters.category !== 'all'
    );
  }, [searchQuery, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.category !== 'all') count++;
    return count;
  }, [searchQuery, filters]);

  // Reset all state
  const reset = useCallback(() => {
    setSearchQuery('');
    setFilters({
      status: 'all',
      priority: 'all',
      category: 'all',
    });
    setSortConfig({
      field: 'created_at',
      order: 'desc',
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    sortConfig,
    setSortConfig,
    updateSort,
    hasActiveFilters,
    activeFilterCount,
    reset,
  };
}