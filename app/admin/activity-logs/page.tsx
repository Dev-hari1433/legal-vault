'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminShell } from '@/components/admin-shell';
import { useAdminActivityLogs, PAGE_SIZE, type AdminActivityLog } from '@/hooks/use-admin';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminActivityLogsPage() {
  const [page, setPage] = useState(0);
  const logsQ = useAdminActivityLogs(page);
  const totalPages = Math.ceil((logsQ.data?.count || 0) / PAGE_SIZE);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground mt-1">User activity across the platform.</p>
      </div>

      {logsQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : (logsQ.data?.data || []).length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No activity logs</h3>
          <p className="text-sm text-muted-foreground mt-1">No user activity has been recorded yet.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border/40">
              {(logsQ.data?.data || []).map((log: AdminActivityLog, i: number) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/10 shrink-0">
                    <Activity className="h-4 w-4 text-chart-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    {log.description && <p className="text-xs text-muted-foreground truncate">{log.description}</p>}
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      User: {log.user_id?.slice(0, 8) || 'system'}...
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(log.created_at)}</span>
                </motion.div>
              ))}
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages} ({logsQ.data?.count} total)</p>
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
