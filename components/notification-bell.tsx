'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import {
  useNotifications, useUnreadCount, useMarkRead, useMarkAllRead,
  type NotificationItem,
} from '@/hooks/use-notifications';
import { useToast } from '@/hooks/use-toast';

const TYPE_ICONS: Record<string, string> = {
  welcome: 'Heart',
  login_alert: 'ShieldAlert',
  password_reset: 'KeyRound',
  trusted_member_added: 'UserPlus',
  emergency_reported: 'Siren',
  verification_started: 'FileSearch',
  verification_approved: 'CheckCircle2',
  verification_rejected: 'XCircle',
  data_released: 'Unlock',
  profile_updated: 'UserCog',
  document_uploaded: 'FileUp',
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const unreadCount = useUnreadCount();
  const { data: notifications } = useNotifications();
  const markReadMut = useMarkRead();
  const markAllReadMut = useMarkAllRead();

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllReadMut.mutateAsync(user.id);
    } catch {
      toast({ title: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const handleClickNotification = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await markReadMut.mutateAsync(id);
      } catch {
        // silent fail
      }
    }
  };

  const recent = (notifications || []).slice(0, 8);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && <Badge variant="default" className="text-xs">{unreadCount} new</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  recent.map((n: NotificationItem) => (
                    <Link
                      key={n.id}
                      href={n.action_url || '/dashboard/notifications'}
                      onClick={() => { handleClickNotification(n.id, n.is_read); setOpen(false); }}
                      className={`flex gap-3 p-4 border-b border-border/30 hover:bg-muted/30 transition-colors ${
                        !n.is_read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-[11px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-border/60">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm text-primary hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
