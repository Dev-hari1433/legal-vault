'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Users, FolderLock, Bell, TrendingUp,
  Clock, CheckCircle2, AlertCircle, FileText, Image as ImageIcon,
  KeyRound, Plus, Upload, UserPlus, FileSignature, Settings,
  Siren, HeartPulse, Wallet, IdCard,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { DashboardSkeleton } from '@/components/dashboard/skeletons';
import { CompletionDonut } from '@/components/dashboard/completion-donut';
import { ActivityBarChart } from '@/components/dashboard/activity-chart';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { useAuth } from '@/components/auth-provider';
import {
  useProfile,
  useEmergencyContacts,
  useTrustedMembers,
  useVaultSummary,
  useActivityLogs,
  useNotifications,
  useUnreadNotificationCount,
  useCompletionStats,
  useActivityChart,
} from '@/hooks/use-dashboard-data';

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const profileQ = useProfile();
  const contactsQ = useEmergencyContacts();
  const membersQ = useTrustedMembers();
  const vaultQ = useVaultSummary();
  const activityQ = useActivityLogs(8);
  const notificationsQ = useNotifications(5);
  const unreadQ = useUnreadNotificationCount();
  const completionQ = useCompletionStats();
  const chartQ = useActivityChart();

  if (authLoading) return <DashboardSkeleton />;

  const userName = profileQ.data?.full_name || user?.email?.split('@')[0] || 'there';
  const initials = getInitials(userName);
  const avatarUrl = profileQ.data?.avatar_url || user?.user_metadata?.avatar_url;

  const stats = [
    { label: 'Total Items', value: vaultQ.data?.total ?? 0, change: `${vaultQ.data?.documents ?? 0} docs`, icon: FolderLock, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Trusted Contacts', value: contactsQ.data?.length ?? 0, change: `${membersQ.data?.length ?? 0} active`, icon: Users, color: 'text-chart-2', bg: 'bg-chart-2/10' },
    { label: 'Notifications', value: unreadQ.data ?? 0, change: 'unread', icon: Bell, color: 'text-chart-3', bg: 'bg-chart-3/10' },
    { label: 'Completion', value: `${completionQ.data?.percentage ?? 0}%`, change: `${completionQ.data?.completed ?? 0}/${completionQ.data?.total ?? 0} sections`, icon: ShieldCheck, color: 'text-chart-5', bg: 'bg-chart-5/10' },
  ];

  const quickActions = [
    { label: 'Upload Document', icon: Upload, href: '/dashboard/document-vault', color: 'text-primary' },
    { label: 'Add Contact', icon: UserPlus, href: '/dashboard/emergency-contacts', color: 'text-chart-2' },
    { label: 'Edit Will', icon: FileSignature, href: '/dashboard/digital-will', color: 'text-chart-3' },
    { label: 'Add Asset', icon: Plus, href: '/dashboard/financial-assets', color: 'text-chart-5' },
  ];

  const vaultBreakdown = [
    { label: 'Documents', count: vaultQ.data?.documents ?? 0, icon: FileText, color: 'text-primary' },
    { label: 'Photos', count: vaultQ.data?.photos ?? 0, icon: ImageIcon, color: 'text-chart-2' },
    { label: 'Digital Assets', count: vaultQ.data?.digitalAssets ?? 0, icon: KeyRound, color: 'text-chart-3' },
  ];

  return (
    <div>
      <DashboardPageHeader
        title={`Welcome back, ${userName}`}
        description="Here's an overview of your digital legacy."
        action={
          <Button className="shadow-glow group" asChild>
            <Link href="/dashboard/digital-vault">
              Add to vault
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        }
      />

      {/* Welcome / Profile Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-chart-4/5 to-transparent border-primary/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{userName}</h2>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Profile Status:</span>
                <div className="flex items-center gap-2">
                  <Progress value={completionQ.data?.percentage ?? 0} className="h-2 w-32" />
                  <span className="font-medium text-sm">{completionQ.data?.percentage ?? 0}%</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/dashboard/profile">
                <Settings className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat: typeof stats[number], i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 hover:shadow-soft transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Timeline + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activities Timeline */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Recent Activities</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/audit-logs">View all</Link>
              </Button>
            </div>
            {activityQ.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ActivityTimeline activities={activityQ.data ?? []} />
            )}
          </Card>

          {/* Activity Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Weekly Activity</h2>
                <p className="text-sm text-muted-foreground">Actions over the last 7 days</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            {chartQ.isLoading ? (
              <div className="h-48 flex items-end justify-between gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-muted/50 rounded-t animate-pulse" style={{ height: `${30 + Math.random() * 60}%` }} />
                ))}
              </div>
            ) : (
              <ActivityBarChart data={chartQ.data ?? []} />
            )}
          </Card>
        </div>

        {/* Right Column — Completion + Notifications + Quick Actions */}
        <div className="space-y-6">
          {/* Completion Donut */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Vault Completion</h2>
            {completionQ.isLoading ? (
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded mt-4 animate-pulse" />
              </div>
            ) : (
              <>
                <CompletionDonut percentage={completionQ.data?.percentage ?? 0} />
                <div className="mt-5 space-y-2">
                  {completionQ.data?.sections.map((section: { key: string; label: string; count: number; target: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{section.label}</span>
                      <div className="flex items-center gap-2">
                        {section.count >= section.target ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : section.count > 0 ? (
                          <Clock className="h-4 w-4 text-warning" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                        <span className="text-xs text-muted-foreground w-8 text-right">{section.count}/{section.target}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <span className="text-sm text-muted-foreground">Digital Will</span>
                    <div className="flex items-center gap-2">
                      {completionQ.data?.will?.status === 'complete' || completionQ.data?.will?.status === 'finalized' ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : completionQ.data?.will?.status === 'draft' || completionQ.data?.will?.status === 'in_progress' ? (
                        <Clock className="h-4 w-4 text-warning" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                      <span className="text-xs text-muted-foreground capitalize">
                        {completionQ.data?.will?.status ?? 'not started'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadQ.data && unreadQ.data > 0 && (
                <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                  {unreadQ.data} new
                </Badge>
              )}
            </div>
            {notificationsQ.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notificationsQ.data && notificationsQ.data.length > 0 ? (
              <div className="space-y-3">
                {notificationsQ.data.map((n: { id: string; title: string; body: string | null; is_read: boolean | null; created_at: string }, i: number) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-3 p-2 rounded-lg ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${n.is_read ? 'bg-muted/60' : 'bg-primary/10'}`}>
                      <Bell className={`h-4 w-4 ${n.is_read ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-muted-foreground/60 mt-1">{formatTimeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action: typeof quickActions[number], i: number) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Link href={action.href}>
                    <div className="group rounded-xl border border-border/60 bg-card/50 p-4 hover:shadow-soft hover:border-primary/30 transition-all">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 transition-colors mb-3">
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <p className="text-sm font-medium">{action.label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row — Emergency Contacts + Trusted Members + Digital Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Emergency Contacts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Siren className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold">Emergency Contacts</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/emergency-contacts">View all</Link>
            </Button>
          </div>
          {contactsQ.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : contactsQ.data && contactsQ.data.length > 0 ? (
            <div className="space-y-3">
              {contactsQ.data.slice(0, 4).map((c: { id: string; name: string; email: string | null; phone: string | null; relationship: string | null; access_level: string | null; priority: string | null; status: string | null }, i: number) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                    <Siren className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.relationship || c.email || c.phone}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{c.priority || 'contact'}</Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Siren className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No contacts yet</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/emergency-contacts"><UserPlus className="mr-2 h-4 w-4" /> Add</Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Trusted Members */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-chart-2" />
              <h2 className="text-lg font-semibold">Trusted Members</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/trusted-family">View all</Link>
            </Button>
          </div>
          {membersQ.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : membersQ.data && membersQ.data.length > 0 ? (
            <div className="space-y-3">
              {membersQ.data.slice(0, 4).map((m: { id: string; name: string; email: string | null; relationship: string | null; access_level: string | null; status: string | null; priority: string | null }, i: number) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chart-2/10 shrink-0">
                    <Users className="h-4 w-4 text-chart-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.relationship || m.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">{m.access_level}</Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground mb-3">No members yet</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/trusted-family"><UserPlus className="mr-2 h-4 w-4" /> Add</Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Digital Vault Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderLock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Digital Vault</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/digital-vault">View all</Link>
            </Button>
          </div>
          {vaultQ.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {vaultBreakdown.map((item: typeof vaultBreakdown[number], i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                    <span className="text-lg font-bold">{item.count}</span>
                  </motion.div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Items</span>
                  <span className="text-2xl font-bold text-gradient">{vaultQ.data?.total ?? 0}</span>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
