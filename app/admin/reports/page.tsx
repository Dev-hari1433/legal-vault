'use client';

import { motion } from 'framer-motion';
import {
  FileText, Download, HardDrive, Database, Loader2,
  Users, ShieldCheck, Activity, Bell, CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminShell } from '@/components/admin-shell';
import { useAdminStats, useAdminStorageMonitoring } from '@/hooks/use-admin';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AdminReportsPage() {
  const statsQ = useAdminStats();
  const storageQ = useAdminStorageMonitoring();

  const handleExportReport = (type: string) => {
    const stats = statsQ.data;
    if (!stats) return;
    const lines = [
      `LegacyVault ${type} Report`,
      `Generated: ${new Date().toISOString()}`,
      '',
      type === 'summary' ? 'Platform Summary' : '',
      `Total Users,${stats.totalUsers}`,
      `Total Vault Items,${stats.totalVaultItems}`,
      `Total Trusted Contacts,${stats.totalContacts}`,
      `Pending Verifications,${stats.pendingVerifications}`,
      `Total Logins,${stats.totalLogins}`,
      `Total Notifications,${stats.totalNotifications}`,
      `Total Security Events,${stats.totalSecurityEvents}`,
      `Total Audit Logs,${stats.totalAuditLogs}`,
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports & Storage</h1>
        <p className="text-muted-foreground mt-1">Generate reports and monitor storage usage.</p>
      </div>

      {/* Export Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Export Reports</h3>
              <p className="text-sm text-muted-foreground">Download platform data as CSV.</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Summary Report', desc: 'Key platform metrics overview', type: 'summary' },
              { label: 'User Report', desc: 'All registered users', type: 'users' },
              { label: 'Security Report', desc: 'Security events and audit logs', type: 'security' },
              { label: 'Activity Report', desc: 'User activity breakdown', type: 'activity' },
            ].map((report: { label: string; desc: string; type: string }) => (
              <div key={report.type} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-sm font-medium">{report.label}</p>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExportReport(report.type)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Export
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Database Monitoring */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/10">
              <Database className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <h3 className="font-semibold">Database Monitoring</h3>
              <p className="text-sm text-muted-foreground">Table row counts and health.</p>
            </div>
          </div>
          {statsQ.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { label: 'Profiles', value: statsQ.data?.totalUsers ?? 0, icon: Users, color: 'text-primary' },
                { label: 'Vault Items', value: statsQ.data?.totalVaultItems ?? 0, icon: ShieldCheck, color: 'text-chart-3' },
                { label: 'Trusted Contacts', value: statsQ.data?.totalContacts ?? 0, icon: Users, color: 'text-chart-4' },
                { label: 'Login History', value: statsQ.data?.totalLogins ?? 0, icon: Activity, color: 'text-chart-2' },
                { label: 'Notifications', value: statsQ.data?.totalNotifications ?? 0, icon: Bell, color: 'text-chart-5' },
                { label: 'Security Events', value: statsQ.data?.totalSecurityEvents ?? 0, icon: Activity, color: 'text-chart-5' },
                { label: 'Audit Logs', value: statsQ.data?.totalAuditLogs ?? 0, icon: FileText, color: 'text-chart-4' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-2">
                    <row.icon className={`h-4 w-4 ${row.color}`} />
                    <span className="text-sm">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Storage Monitoring */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
            <HardDrive className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <h3 className="font-semibold">Storage Monitoring</h3>
            <p className="text-sm text-muted-foreground">Supabase Storage bucket usage.</p>
          </div>
        </div>
        {storageQ.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (storageQ.data || []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No storage buckets found.</p>
        ) : (
          <div className="space-y-3">
            {(storageQ.data || []).map((bucket: { id: string; name: string; public: boolean; fileCount: number; totalSize: number }) => (
              <motion.div
                key={bucket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 rounded-lg border border-border/60 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{bucket.name}</p>
                  <p className="text-xs text-muted-foreground">{bucket.fileCount} files · {formatBytes(bucket.totalSize)}</p>
                </div>
                <Badge variant={bucket.public ? 'default' : 'secondary'} className="shrink-0">
                  {bucket.public ? 'Public' : 'Private'}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
