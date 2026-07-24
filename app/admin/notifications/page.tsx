'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminShell } from '@/components/admin-shell';
import { useAdminNotifications, PAGE_SIZE, type AdminNotification } from '@/hooks/use-admin';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(0);
  const notificationsQ = useAdminNotifications(page);
  const totalPages = Math.ceil((notificationsQ.data?.count || 0) / PAGE_SIZE);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notification Management</h1>
        <p className="text-muted-foreground mt-1">All notifications sent across the platform.</p>
      </div>

      {notificationsQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : (notificationsQ.data?.data || []).length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">No notifications have been sent yet.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border/40">
              {(notificationsQ.data?.data || []).map((n: AdminNotification, i: number) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${n.is_read ? 'bg-muted/50' : 'bg-primary/10'}`}>
                    <Bell className={`h-4 w-4 ${n.is_read ? 'text-muted-foreground' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.is_read ? 'font-medium' : 'font-semibold'}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      User: {n.user_id.slice(0, 8)}... · {formatDate(n.created_at)}
                    </p>
                  </div>
                  <Badge variant={n.is_read ? 'secondary' : 'default'} className="shrink-0 text-xs">
                    {n.is_read ? 'Read' : 'Unread'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages} ({notificationsQ.data?.count} total)</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
