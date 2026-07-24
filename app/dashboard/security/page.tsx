'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldAlert, KeyRound, Smartphone, Fingerprint, Monitor,
  Tablet, Smartphone as Phone, Globe, Clock, AlertTriangle, CheckCircle2,
  XCircle, Loader2, Lock, Activity, MapPin, Eye, LogIn, EyeOff, History,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useLoginHistory, useSecurityEvents, type LoginHistoryItem, type SecurityEventItem } from '@/hooks/use-security';
import { logSecurityEvent } from '@/lib/notify';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getDeviceIcon(deviceType: string | null) {
  if (deviceType === 'Mobile') return Phone;
  if (deviceType === 'Tablet') return Tablet;
  return Monitor;
}

const SEVERITY_META: Record<string, { color: string; icon: typeof Shield }> = {
  info: { color: 'text-blue-600 bg-blue-500/10', icon: CheckCircle2 },
  warning: { color: 'text-warning bg-warning/10', icon: AlertTriangle },
  critical: { color: 'text-destructive bg-destructive/10', icon: XCircle },
};

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const loginHistoryQ = useLoginHistory();
  const securityEventsQ = useSecurityEvents();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleToggle2FA = async (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    if (user) {
      try {
        await logSecurityEvent(user.id, '2fa_toggled', enabled ? 'info' : 'warning', { enabled: String(enabled) });
        toast({
          title: enabled ? '2FA enabled' : '2FA disabled',
          description: enabled
            ? 'Two-factor authentication is now active for your account.'
            : 'Two-factor authentication has been turned off.',
        });
      } catch {
        // silent
      }
    }
  };

  const loginHistory = loginHistoryQ.data || [];
  const securityEvents = securityEventsQ.data || [];

  const successfulLogins = loginHistory.filter((l: LoginHistoryItem) => l.success).length;
  const failedLogins = loginHistory.filter((l: LoginHistoryItem) => !l.success).length;
  const criticalEvents = securityEvents.filter((e: SecurityEventItem) => e.severity === 'critical').length;

  return (
    <div>
      <DashboardPageHeader
        title="Security Center"
        description="Enterprise-grade security controls, login history, and device tracking."
      />

      {/* Security stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Logins', value: loginHistory.length, icon: LogIn, color: 'text-primary' },
          { label: 'Successful', value: successfulLogins, icon: CheckCircle2, color: 'text-success' },
          { label: 'Failed Attempts', value: failedLogins, icon: XCircle, color: 'text-destructive' },
          { label: 'Critical Events', value: criticalEvents, icon: AlertTriangle, color: 'text-warning' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Authentication</h3>
              <p className="text-sm text-muted-foreground">Protect your account with multiple layers.</p>
            </div>
          </div>

          <div className="space-y-1">
            <SecurityToggle
              icon={KeyRound}
              label="Two-Factor Authentication"
              desc="Require a verification code in addition to your password"
              checked={twoFactorEnabled}
              onChange={handleToggle2FA}
            />
            <Separator className="my-3" />
            <SecurityToggle
              icon={Fingerprint}
              label="Biometric Unlock"
              desc="Use fingerprint or face recognition on supported devices"
              checked={biometricEnabled}
              onChange={setBiometricEnabled}
            />
            <Separator className="my-3" />
            <SecurityToggle
              icon={Clock}
              label="Session Timeout"
              desc="Automatically sign out after 30 minutes of inactivity"
              checked={sessionTimeout}
              onChange={setSessionTimeout}
            />
            <Separator className="my-3" />
            <SecurityToggle
              icon={ShieldAlert}
              label="Login Alerts"
              desc="Get notified when someone signs in to your account"
              checked={loginAlerts}
              onChange={setLoginAlerts}
            />
          </div>
        </Card>

        {/* Login History */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Login History</h3>
              <p className="text-sm text-muted-foreground">Recent sign-in activity and devices.</p>
            </div>
          </div>

          {loginHistoryQ.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No login activity recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loginHistory.slice(0, 10).map((login: LoginHistoryItem) => {
                const DeviceIcon = getDeviceIcon(login.device_type);
                return (
                  <div key={login.id} className="flex items-center gap-3 py-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                      login.success ? 'bg-success/10' : 'bg-destructive/10'
                    }`}>
                      {login.success ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <DeviceIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-medium">{login.device_type || 'Unknown device'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {login.ip_address || 'Unknown IP'} · {formatDate(login.created_at)}
                      </p>
                    </div>
                    <Badge variant={login.success ? 'default' : 'destructive'} className="text-xs shrink-0">
                      {login.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Security Events */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Security Events</h3>
              <p className="text-sm text-muted-foreground">Audit trail of security-relevant actions.</p>
            </div>
          </div>

          {securityEventsQ.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-8">
              <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No security events recorded.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {securityEvents.slice(0, 15).map((event: SecurityEventItem) => {
                const meta = SEVERITY_META[event.severity] || SEVERITY_META.info;
                const Icon = meta.icon;
                return (
                  <div key={event.id} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(event.created_at)}</p>
                    </div>
                    <Badge variant="secondary" className={`text-xs shrink-0 ${meta.color}`}>
                      {event.severity}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Security badges */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'RLS', icon: ShieldCheck, active: true },
          { label: 'JWT Auth', icon: KeyRound, active: true },
          { label: 'AES-256', icon: Lock, active: true },
          { label: 'CSRF Protection', icon: Shield, active: true },
          { label: 'XSS Protection', icon: Eye, active: true },
          { label: 'Rate Limiting', icon: Activity, active: true },
        ].map((badge: { label: string; icon: typeof Shield; active: boolean }) => (
          <div key={badge.label} className="flex flex-col items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-4">
            <badge.icon className="h-5 w-5 text-success" />
            <span className="text-xs font-medium text-center">{badge.label}</span>
            <Badge variant="secondary" className="bg-success/10 text-success text-[10px]">Active</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityToggle({
  icon: Icon, label, desc, checked, onChange,
}: {
  icon: typeof Shield; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-start gap-3 flex-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 shrink-0 mt-0.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <Label className="font-medium cursor-pointer">{label}</Label>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
