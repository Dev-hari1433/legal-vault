'use client';

import { motion } from 'framer-motion';
import {
  Settings, ShieldCheck, Users, Bell, Database, HardDrive,
  KeyRound, Lock, CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AdminShell } from '@/components/admin-shell';

export default function AdminSettingsPage() {
  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Platform configuration and security policies.</p>
      </div>

      <div className="space-y-6">
        {/* Security Policies */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <ShieldCheck className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">Security Policies</h3>
              <p className="text-sm text-muted-foreground">Platform-wide security configuration.</p>
            </div>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Require 2FA for all users', desc: 'Force two-factor authentication for every account', on: false },
              { label: 'Email verification on signup', desc: 'Require email confirmation before account access', on: true },
              { label: 'Rate limiting on auth endpoints', desc: 'Limit login attempts to prevent brute force attacks', on: true },
              { label: 'IP logging', desc: 'Log IP addresses for all login events', on: true },
              { label: 'Device tracking', desc: 'Track and display device information for sessions', on: true },
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Role-Based Access Control */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Role-Based Access Control</h3>
              <p className="text-sm text-muted-foreground">Admin roles and permissions.</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { role: 'Super Admin', desc: 'Full access to all features and settings', permissions: ['All permissions'] },
              { role: 'Admin', desc: 'Manage users, verifications, and reports', permissions: ['Users', 'Verifications', 'Reports'] },
              { role: 'Reviewer', desc: 'Review verification requests only', permissions: ['Verifications'] },
            ].map((role, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 p-4">
                <div>
                  <p className="text-sm font-medium">{role.role}</p>
                  <p className="text-xs text-muted-foreground">{role.desc}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {role.permissions.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Security Features */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Lock className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold">Active Security Features</h3>
              <p className="text-sm text-muted-foreground">Enterprise security protections currently enforced.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              'RLS Policies', 'JWT Auth', 'AES-256 Encryption',
              'CSRF Protection', 'XSS Protection', 'Rate Limiting',
              'Session Timeout', 'Audit Logging', 'IP Tracking',
              'Device Tracking', 'Secure Storage', 'HTTPS Enforced',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span className="text-xs font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
