'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle, Loader2, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminShell } from '@/components/admin-shell';
import { useSecurityEvents } from '@/hooks/use-security';
import type { SecurityEventItem } from '@/hooks/use-security';

const SEVERITY_META: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  info: { color: 'text-blue-600 bg-blue-500/10', icon: CheckCircle2 },
  warning: { color: 'text-warning bg-warning/10', icon: AlertTriangle },
  critical: { color: 'text-destructive bg-destructive/10', icon: XCircle },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminAlertsPage() {
  const eventsQ = useSecurityEvents();
  const events = eventsQ.data || [];

  const critical = events.filter((e: SecurityEventItem) => e.severity === 'critical');
  const warnings = events.filter((e: SecurityEventItem) => e.severity === 'warning');
  const info = events.filter((e: SecurityEventItem) => e.severity === 'info');

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Security Alerts</h1>
        <p className="text-muted-foreground mt-1">Monitor security events across the platform.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <XCircle className="h-5 w-5 text-destructive mb-2" />
          <p className="text-2xl font-bold">{critical.length}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </Card>
        <Card className="p-4">
          <AlertTriangle className="h-5 w-5 text-warning mb-2" />
          <p className="text-2xl font-bold">{warnings.length}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </Card>
        <Card className="p-4">
          <CheckCircle2 className="h-5 w-5 text-success mb-2" />
          <p className="text-2xl font-bold">{info.length}</p>
          <p className="text-xs text-muted-foreground">Info</p>
        </Card>
      </div>

      {eventsQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : events.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-success mb-3" />
          <h3 className="text-lg font-semibold">No security alerts</h3>
          <p className="text-sm text-muted-foreground mt-1">All clear — no security events detected.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border/40">
            {events.slice(0, 50).map((event: SecurityEventItem, i: number) => {
              const meta = SEVERITY_META[event.severity] || SEVERITY_META.info;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">User: {event.user_id.slice(0, 8)}...</p>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 text-xs ${meta.color}`}>{event.severity}</Badge>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(event.created_at)}</span>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </AdminShell>
  );
}
