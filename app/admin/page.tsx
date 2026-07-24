'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, ShieldCheck, AlertTriangle, Activity, FileText, Bell,
  TrendingUp, TrendingDown, CheckCircle2, Loader2, HardDrive,
  KeyRound, ScrollText, Eye, BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminShell } from '@/components/admin-shell';
import { useAdminStats, useAdminVerificationStats } from '@/hooks/use-admin';

export default function AdminDashboardPage() {
  const statsQ = useAdminStats();
  const verificationQ = useAdminVerificationStats();

  const stats = [
    { label: 'Total Users', value: statsQ.data?.totalUsers ?? '—', icon: Users, color: 'text-primary', href: '/admin/users' },
    { label: 'Vault Items', value: statsQ.data?.totalVaultItems ?? '—', icon: ShieldCheck, color: 'text-chart-3', href: '/admin/analytics' },
    { label: 'Pending Verifications', value: statsQ.data?.pendingVerifications ?? '—', icon: AlertTriangle, color: 'text-warning', href: '/admin/verifications' },
    { label: 'Security Events', value: statsQ.data?.totalSecurityEvents ?? '—', icon: Activity, color: 'text-chart-5', href: '/admin/alerts' },
  ];

  const secondaryStats = [
    { label: 'Trusted Contacts', value: statsQ.data?.totalContacts ?? '—', icon: KeyRound },
    { label: 'Total Logins', value: statsQ.data?.totalLogins ?? '—', icon: Activity },
    { label: 'Notifications Sent', value: statsQ.data?.totalNotifications ?? '—', icon: Bell },
    { label: 'Audit Logs', value: statsQ.data?.totalAuditLogs ?? '—', icon: ScrollText },
  ];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform-wide statistics and management tools.</p>
      </div>

      {statsQ.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat: { label: string; value: number | string; icon: typeof Users; color: string; href: string }, i: number) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={stat.href}>
                  <Card className="p-5 hover:shadow-soft transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60">
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {secondaryStats.map((stat: { label: string; value: number | string; icon: typeof Users }, i: number) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Verification Queue</h2>
                <Link href="/admin/verifications" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-warning/5 border border-warning/20 p-4">
                  <AlertTriangle className="h-6 w-6 text-warning mb-2" />
                  <p className="text-2xl font-bold text-warning">{verificationQ.data?.pending ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-success/5 border border-success/20 p-4">
                  <CheckCircle2 className="h-6 w-6 text-success mb-2" />
                  <p className="text-2xl font-bold text-success">{verificationQ.data?.approved ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                  <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
                  <p className="text-2xl font-bold text-destructive">{verificationQ.data?.rejected ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">System Health</h2>
              <div className="space-y-4">
                {[
                  { label: 'Database', value: 'Operational', status: 'healthy' },
                  { label: 'Storage', value: 'Operational', status: 'healthy' },
                  { label: 'Auth Service', value: 'Operational', status: 'healthy' },
                  { label: 'Edge Functions', value: 'Operational', status: 'healthy' },
                ].map((item: { label: string; value: string; status: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.value}</span>
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-success/5 border border-success/20 p-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold text-sm">All systems operational</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { href: '/admin/users', label: 'Manage Users', icon: Users },
              { href: '/admin/verifications', label: 'Review Requests', icon: ShieldCheck },
              { href: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
              { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
              { href: '/admin/reports', label: 'Reports', icon: FileText },
            ].map((action: { href: string; label: string; icon: typeof Users }) => (
              <Link key={action.href} href={action.href}>
                <Card className="p-4 flex flex-col items-center text-center hover:shadow-soft transition-shadow cursor-pointer">
                  <action.icon className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </AdminShell>
  );
}
