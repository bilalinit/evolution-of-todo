/**
 * useProfile Hook
 *
 * React Query hooks for profile management operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '@/lib/api/tasks';
import { UserProfileResponse } from '@/lib/api/types';
import { toast } from 'sonner';

/**
 * Hook to fetch user profile and statistics
 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId) as Promise<UserProfileResponse>,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: !!userId,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => updateProfile(userId, data),
    onSuccess: (response) => {
      // Update the profile cache
      queryClient.setQueryData(['profile', userId], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user: {
            ...oldData.user,
            name: response.user.name,
          },
        };
      });

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });

      toast.success('Profile updated successfully', {
        description: 'Your profile information has been saved.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to update profile', {
        description: error.message || 'Please try again.',
      });
    },
  });
}

/**
 * Hook to change user password
 */
export function useChangePassword(userId: string) {
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      confirm_password: string;
    }) => changePassword(userId, data),
    onSuccess: () => {
      toast.success('Password updated successfully', {
        description: 'Your password has been changed.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to change password', {
        description: error.message || 'Please check your current password and try again.',
      });
    },
  });
}