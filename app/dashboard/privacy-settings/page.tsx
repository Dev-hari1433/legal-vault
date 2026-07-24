'use client';

import { motion } from 'framer-motion';
import { Lock, Shield, Eye, Key, Smartphone, Fingerprint, Globe, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/dashboard-page-header';

export default function PrivacySettingsPage() {
  return (
    <div>
      <DashboardPageHeader
        title="Privacy Settings"
        description="Control your data, access, and security preferences."
        action={
          <Button className="shadow-glow"><Save className="mr-2 h-4 w-4" /> Save Settings</Button>
        }
      />

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Vault Security</h3>
              <p className="text-sm text-muted-foreground">Control who can access your vault and how.</p>
            </div>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Two-factor authentication', desc: 'Require a second verification method at login', on: true },
              { label: 'Biometric unlock', desc: 'Use fingerprint or face recognition on mobile', on: true },
              { label: 'Auto-lock vault', desc: 'Automatically lock vault after 15 minutes of inactivity', on: true },
              { label: 'Inactivity trigger', desc: 'Release vault to trusted contacts after 90 days of no login', on: true },
              { label: 'IP restrictions', desc: 'Only allow access from known IP addresses', on: false },
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Data Visibility</h3>
              <p className="text-sm text-muted-foreground">Control what information is visible to others.</p>
            </div>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Profile visibility', desc: 'Allow trusted contacts to see your profile photo and name', on: true },
              { label: 'Online status', desc: 'Show when you were last active on LegacyVault', on: false },
              { label: 'Activity feed', desc: 'Share recent activity with trusted family members', on: true },
              { label: 'Searchable', desc: 'Allow trusted contacts to find you by email', on: true },
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Encryption & Keys</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Master password</Label>
                  <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Recovery key</Label>
                  <p className="text-sm text-muted-foreground">Downloaded and stored</p>
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Encryption level</Label>
                  <p className="text-sm text-muted-foreground">256-bit AES</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">Max</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Data & Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Marketing emails</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional content</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Data export</Label>
                  <p className="text-sm text-muted-foreground">Download all your data</p>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-destructive">Delete account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your vault</p>
                </div>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30">Delete</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
