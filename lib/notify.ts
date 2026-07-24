'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export type NotificationEvent =
  | 'welcome' | 'login_alert' | 'password_reset' | 'trusted_member_added'
  | 'emergency_reported' | 'verification_started' | 'verification_approved'
  | 'verification_rejected' | 'data_released' | 'profile_updated' | 'document_uploaded';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

interface CreateNotificationInput {
  userId: string;
  event: NotificationEvent;
  title: string;
  body: string;
  actionUrl?: string;
}

const EVENT_META: Record<NotificationEvent, { icon: string; defaultChannels: NotificationChannel[] }> = {
  welcome: { icon: 'Heart', defaultChannels: ['in_app', 'email'] },
  login_alert: { icon: 'ShieldAlert', defaultChannels: ['in_app', 'email'] },
  password_reset: { icon: 'KeyRound', defaultChannels: ['in_app', 'email'] },
  trusted_member_added: { icon: 'UserPlus', defaultChannels: ['in_app', 'email'] },
  emergency_reported: { icon: 'Siren', defaultChannels: ['in_app', 'email', 'push', 'sms'] },
  verification_started: { icon: 'FileSearch', defaultChannels: ['in_app', 'email'] },
  verification_approved: { icon: 'CheckCircle2', defaultChannels: ['in_app', 'email', 'push', 'sms'] },
  verification_rejected: { icon: 'XCircle', defaultChannels: ['in_app', 'email'] },
  data_released: { icon: 'Unlock', defaultChannels: ['in_app', 'email', 'push', 'sms'] },
  profile_updated: { icon: 'UserCog', defaultChannels: ['in_app'] },
  document_uploaded: { icon: 'FileUp', defaultChannels: ['in_app'] },
};

export async function getUserPreferences(userId: string): Promise<Record<string, boolean>> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from('notification_preferences')
    .select('preferences')
    .eq('user_id', userId)
    .maybeSingle();
  return (data?.preferences as Record<string, boolean>) || {};
}

export function isEventEnabled(
  event: NotificationEvent,
  channel: NotificationChannel,
  preferences: Record<string, boolean>
): boolean {
  const key = `${event}.${channel}`;
  if (key in preferences) return preferences[key];
  return EVENT_META[event].defaultChannels.includes(channel);
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { data: prefData } = await supabase
    .from('notification_preferences')
    .select('preferences')
    .eq('user_id', input.userId)
    .maybeSingle();

  const prefs = (prefData?.preferences as Record<string, boolean>) || {};
  const inAppEnabled = isEventEnabled(input.event, 'in_app', prefs);

  if (inAppEnabled) {
    const { error } = await supabase.from('notifications').insert({
      user_id: input.userId,
      type: input.event,
      title: input.title,
      body: input.body,
      action_url: input.actionUrl || null,
    });
    if (error) throw error;
  }

  // Email/push/sms channels are logged for future integration
  // In production, these would trigger edge functions for email/push/SMS delivery
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function logLoginEvent(
  userId: string,
  success: boolean,
  metadata?: Record<string, string>
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  let deviceType = 'Desktop';
  if (/Mobile|Android|iPhone/.test(userAgent)) deviceType = 'Mobile';
  else if (/iPad|Tablet/.test(userAgent)) deviceType = 'Tablet';

  const { error } = await supabase.from('login_history').insert({
    user_id: userId,
    ip_address: metadata?.ip || null,
    user_agent: userAgent,
    device_type: deviceType,
    location: metadata?.location || null,
    success,
    metadata: metadata || {},
  });
  if (error) throw error;
}

export async function logSecurityEvent(
  userId: string,
  eventType: string,
  severity: 'info' | 'warning' | 'critical',
  metadata?: Record<string, string>
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';

  const { error } = await supabase.from('security_events').insert({
    user_id: userId,
    event_type: eventType,
    severity,
    user_agent: userAgent,
    metadata: metadata || {},
  });
  if (error) throw error;
}
