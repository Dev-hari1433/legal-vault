'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Heart, ShieldAlert, KeyRound, UserPlus, Siren,
  FileSearch, CheckCircle2, XCircle, Unlock, UserCog, FileUp,
  CheckCheck, Loader2, Inbox,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  useNotifications, useMarkRead, useMarkAllRead, type NotificationItem,
} from '@/hooks/use-notifications';

const ICON_MAP: Record<string, typeof Bell> = {
  welcome: Heart,
  login_alert: ShieldAlert,
  password_reset: KeyRound,
  trusted_member_added: UserPlus,
  emergency_reported: Siren,
  verification_started: FileSearch,
  verification_approved: CheckCircle2,
  verification_rejected: XCircle,
  data_released: Unlock,
  profile_updated: UserCog,
  document_uploaded: FileUp,
};

const COLOR_MAP: Record<string, string> = {
  welcome: 'text-rose-600 bg-rose-500/10',
  login_alert: 'text-amber-600 bg-amber-500/10',
  password_reset: 'text-orange-600 bg-orange-500/10',
  trusted_member_added: 'text-blue-600 bg-blue-500/10',
  emergency_reported: 'text-red-600 bg-red-500/10',
  verification_started: 'text-blue-600 bg-blue-500/10',
  verification_approved: 'text-green-600 bg-green-500/10',
  verification_rejected: 'text-destructive bg-destructive/10',
  data_released: 'text-purple-600 bg-purple-500/10',
  profile_updated: 'text-slate-600 bg-slate-500/10',
  document_uploaded: 'text-teal-600 bg-teal-500/10',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NotificationHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: notifications, isLoading } = useNotifications();
  const markReadMut = useMarkRead();
  const markAllReadMut = useMarkAllRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllReadMut.mutateAsync(user.id);
      toast({ title: 'All notifications marked as read' });
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markReadMut.mutateAsync(id);
    } catch {
      // silent
    }
  };

  const filtered = (notifications || []).filter((n: NotificationItem) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = (notifications || []).filter((n: NotificationItem) => !n.is_read).length;

  return (
    <div>
      <DashboardPageHeader
        title="Notifications"
        description="Your complete notification history."
        action={
          unreadCount > 0 ? (
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          All ({notifications?.length ?? 0})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === 'unread' ? 'You are all caught up.' : 'Notifications will appear here as you use LegacyVault.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border/30">
            {filtered.map((n: NotificationItem, i: number) => {
              const Icon = ICON_MAP[n.type] || Bell;
              const colorClass = COLOR_MAP[n.type] || 'text-muted-foreground bg-muted/50';
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className={`flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    {n.body && <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                      Mark read
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
