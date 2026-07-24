'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/notify';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string | null;
}

export function useNotifications() {
  const supabase = createSupabaseBrowserClient();
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });
}

export function useUnreadCount() {
  const { data } = useNotifications();
  return data?.filter((n: NotificationItem) => !n.is_read).length ?? 0;
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await markNotificationRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await markAllNotificationsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useNotificationPreferences(userId?: string) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<Record<string, boolean>>({
    queryKey: ['notification_preferences', userId],
    queryFn: async () => {
      if (!userId) return {};
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return (data?.preferences as Record<string, boolean>) || {};
    },
    enabled: !!userId,
  });
}

export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, preferences }: { userId: string; preferences: Record<string, boolean> }) => {
      const supabase = createSupabaseBrowserClient();
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update({ preferences })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({ user_id: userId, preferences });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
    },
  });
}
