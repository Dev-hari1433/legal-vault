'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText, Download, CheckCircle2, AlertCircle, Lock,
  Eye, Edit, Trash2, Upload, LogIn, UserPlus, Loader2,
  ShieldCheck, Activity, FileText, Bell,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import {
  useQuery, useQueryClient,
} from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string | null;
}

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string | null;
  description: string | null;
  created_at: string | null;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  created_at: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function useAuditLogs() {
  return useQuery({
    queryKey: ['audit_logs_combined'],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const [auditRes, activityRes, securityRes] = await Promise.all([
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('security_events').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      type CombinedEntry = {
        id: string;
        action: string;
        detail: string;
        type: string;
        created_at: string | null;
        source: 'audit' | 'activity' | 'security';
        severity?: string;
      };

      const combined: CombinedEntry[] = [];

      for (const log of (auditRes.data || []) as AuditLog[]) {
        combined.push({
          id: log.id,
          action: log.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          detail: log.entity_type ? `Entity: ${log.entity_type}` : 'Audit event',
          type: 'auth',
          created_at: log.created_at,
          source: 'audit',
        });
      }
      for (const log of (activityRes.data || []) as ActivityLog[]) {
        combined.push({
          id: log.id,
          action: log.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          detail: log.description || 'Activity logged',
          type: 'action',
          created_at: log.created_at,
          source: 'activity',
        });
      }
      for (const log of (securityRes.data || []) as SecurityEvent[]) {
        combined.push({
          id: log.id,
          action: log.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          detail: `Security event · ${log.severity}`,
          type: 'security',
          created_at: log.created_at,
          source: 'security',
          severity: log.severity,
        });
      }

      combined.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return combined;
    },
  });
}

const TYPE_META: Record<string, { color: string; bg: string; icon: typeof ScrollText }> = {
  auth: { color: 'text-primary', bg: 'bg-primary/10', icon: LogIn },
  action: { color: 'text-chart-2', bg: 'bg-chart-2/10', icon: Activity },
  view: { color: 'text-chart-3', bg: 'bg-chart-3/10', icon: Eye },
  security: { color: 'text-chart-5', bg: 'bg-chart-5/10', icon: ShieldCheck },
};

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useAuditLogs();
  const [filter, setFilter] = useState<'all' | 'auth' | 'action' | 'security'>('all');

  const filtered = (logs || []).filter((l: { type: string }) => filter === 'all' || l.type === filter);

  const counts = useMemo(() => {
    const c = { total: logs?.length || 0, auth: 0, action: 0, security: 0 };
    for (const l of logs || []) {
      if (l.type === 'auth') c.auth++;
      else if (l.type === 'action') c.action++;
      else if (l.type === 'security') c.security++;
    }
    return c;
  }, [logs]);

  const handleExport = () => {
    if (!logs || logs.length === 0) return;
    const csv = ['Timestamp,Action,Type,Detail,Source'];
    for (const l of logs) {
      csv.push(`${l.created_at || ''},"${l.action}",${l.type},"${l.detail}",${l.source}`);
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <DashboardPageHeader
        title="Audit Logs"
        description="A complete history of activity in your vault."
        action={
          <Button variant="outline" onClick={handleExport} disabled={!logs || logs.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: counts.total, color: 'text-primary', icon: ScrollText },
          { label: 'Auth Events', value: counts.auth, color: 'text-primary', icon: LogIn },
          { label: 'Activity', value: counts.action, color: 'text-chart-2', icon: Activity },
          { label: 'Security', value: counts.security, color: 'text-chart-5', icon: ShieldCheck },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'auth', 'action', 'security'] as const).map((f: 'all' | 'auth' | 'action' | 'security') => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <ScrollText className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No audit logs recorded yet.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border/40">
            {filtered.slice(0, 50).map((log: { id: string; action: string; detail: string; type: string; created_at: string | null; source: string; severity?: string }, i: number) => {
              const meta = TYPE_META[log.type] || TYPE_META.action;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={`${log.source}-${log.id}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg} shrink-0`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{log.source}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
