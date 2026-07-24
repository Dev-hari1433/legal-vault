'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText, Loader2, ChevronLeft, ChevronRight, Download,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminShell } from '@/components/admin-shell';
import { useAdminAuditLogs, PAGE_SIZE, type AdminAuditLog } from '@/hooks/use-admin';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(0);
  const logsQ = useAdminAuditLogs(page);
  const totalPages = Math.ceil((logsQ.data?.count || 0) / PAGE_SIZE);

  const handleExport = () => {
    const logs = logsQ.data?.data || [];
    if (logs.length === 0) return;
    const csv = ['Timestamp,User ID,Action,Entity Type,Entity ID'];
    for (const l of logs) {
      csv.push(`${l.created_at || ''},${l.user_id || ''},"${l.action}",${l.entity_type || ''},${l.entity_id || ''}`);
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Complete audit trail of all platform activity.</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={!logsQ.data?.data?.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {logsQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : (logsQ.data?.data || []).length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <ScrollText className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No audit logs</h3>
          <p className="text-sm text-muted-foreground mt-1">No audit events have been recorded yet.</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border/40">
              {(logsQ.data?.data || []).map((log: AdminAuditLog, i: number) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                    <ScrollText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.entity_type ? `${log.entity_type} · ` : ''}User: {log.user_id?.slice(0, 8) || 'system'}...
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
