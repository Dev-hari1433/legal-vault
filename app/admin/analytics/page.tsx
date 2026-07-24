'use client';

import { motion } from 'framer-motion';
import {
  BarChart3, Users, ShieldCheck, Activity, Bell, TrendingUp,
  Loader2, CheckCircle2, AlertTriangle, FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AdminShell } from '@/components/admin-shell';
import { useAdminStats, useAdminUserGrowth, useAdminVerificationStats } from '@/hooks/use-admin';

export default function AdminAnalyticsPage() {
  const statsQ = useAdminStats();
  const growthQ = useAdminUserGrowth();
  const verificationQ = useAdminVerificationStats();

  const maxGrowth = Math.max(...(growthQ.data || []).map((g: { month: string; count: number }) => g.count), 1);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform growth, engagement, and verification metrics.</p>
      </div>

      {statsQ.isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: statsQ.data?.totalUsers ?? 0, icon: Users, color: 'text-primary' },
              { label: 'Vault Items', value: statsQ.data?.totalVaultItems ?? 0, icon: ShieldCheck, color: 'text-chart-3' },
              { label: 'Total Logins', value: statsQ.data?.totalLogins ?? 0, icon: Activity, color: 'text-chart-2' },
              { label: 'Notifications', value: statsQ.data?.totalNotifications ?? 0, icon: Bell, color: 'text-chart-4' },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 mb-3">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* User Growth Chart */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">User Growth</h2>
            </div>
            {growthQ.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (growthQ.data || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No growth data available yet.</p>
            ) : (
              <div className="flex items-end justify-between gap-2 h-48">
                {(growthQ.data || []).map((g: { month: string; count: number }, i: number) => (
                  <div key={g.month} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(g.count / maxGrowth) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="w-full rounded-t-lg bg-primary/80 min-h-[4px] relative group"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {g.count}
                      </div>
                    </motion.div>
                    <span className="text-[10px] text-muted-foreground">{g.month}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verification Stats */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h2 className="text-lg font-semibold">Verification Status</h2>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Pending Review', value: verificationQ.data?.pending ?? 0, color: 'bg-warning', text: 'text-warning' },
                  { label: 'Approved', value: verificationQ.data?.approved ?? 0, color: 'bg-success', text: 'text-success' },
                  { label: 'Rejected', value: verificationQ.data?.rejected ?? 0, color: 'bg-destructive', text: 'text-destructive' },
                ].map((item: { label: string; value: number; color: string; text: string }) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`text-sm font-bold ${item.text}`}>{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((item.value / Math.max(verificationQ.data ? (verificationQ.data.pending + verificationQ.data.approved + verificationQ.data.rejected) : 1, 1)) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Stats */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">System Activity</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Security Events', value: statsQ.data?.totalSecurityEvents ?? 0, icon: AlertTriangle, color: 'text-chart-5' },
                  { label: 'Audit Log Entries', value: statsQ.data?.totalAuditLogs ?? 0, icon: FileText, color: 'text-chart-4' },
                  { label: 'Trusted Contacts', value: statsQ.data?.totalContacts ?? 0, icon: Users, color: 'text-primary' },
                  { label: 'Pending Verifications', value: statsQ.data?.pendingVerifications ?? 0, icon: ShieldCheck, color: 'text-warning' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </AdminShell>
  );
}
