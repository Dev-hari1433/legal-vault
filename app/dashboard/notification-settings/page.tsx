'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Mail, MessageSquare, Shield, Calendar, Save, Loader2,
  Smartphone, Globe, Heart, ShieldAlert, KeyRound, UserPlus,
  Siren, FileSearch, CheckCircle2, XCircle, Unlock, UserCog, FileUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  useNotificationPreferences, useSaveNotificationPreferences,
} from '@/hooks/use-notifications';

type EventKey =
  | 'welcome' | 'login_alert' | 'password_reset' | 'trusted_member_added'
  | 'emergency_reported' | 'verification_started' | 'verification_approved'
  | 'verification_rejected' | 'data_released' | 'profile_updated' | 'document_uploaded';

type Channel = 'in_app' | 'email' | 'push' | 'sms';

const EVENTS: { key: EventKey; label: string; desc: string; icon: typeof Bell }[] = [
  { key: 'welcome', label: 'Welcome', desc: 'Account setup and onboarding', icon: Heart },
  { key: 'login_alert', label: 'Login Alert', desc: 'New login from a device or location', icon: ShieldAlert },
  { key: 'password_reset', label: 'Password Reset', desc: 'Password was changed or reset', icon: KeyRound },
  { key: 'trusted_member_added', label: 'Trusted Member Added', desc: 'A new trusted contact was added', icon: UserPlus },
  { key: 'emergency_reported', label: 'Emergency Reported', desc: 'A death verification request was submitted', icon: Siren },
  { key: 'verification_started', label: 'Verification Started', desc: 'Admin began reviewing a verification', icon: FileSearch },
  { key: 'verification_approved', label: 'Verification Approved', desc: 'Death verification was approved', icon: CheckCircle2 },
  { key: 'verification_rejected', label: 'Verification Rejected', desc: 'Death verification was rejected', icon: XCircle },
  { key: 'data_released', label: 'Data Released', desc: 'Authorized data was released to family', icon: Unlock },
  { key: 'profile_updated', label: 'Profile Updated', desc: 'Profile information was changed', icon: UserCog },
  { key: 'document_uploaded', label: 'Document Uploaded', desc: 'A new file was uploaded to the vault', icon: FileUp },
];

const CHANNELS: { key: Channel; label: string; icon: typeof Bell }[] = [
  { key: 'in_app', label: 'In-App', icon: Bell },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'push', label: 'Push', icon: Smartphone },
  { key: 'sms', label: 'SMS', icon: MessageSquare },
];

const DEFAULTS: Record<string, boolean> = {
  'welcome.in_app': true, 'welcome.email': true,
  'login_alert.in_app': true, 'login_alert.email': true,
  'password_reset.in_app': true, 'password_reset.email': true,
  'trusted_member_added.in_app': true, 'trusted_member_added.email': true,
  'emergency_reported.in_app': true, 'emergency_reported.email': true, 'emergency_reported.push': true, 'emergency_reported.sms': true,
  'verification_started.in_app': true, 'verification_started.email': true,
  'verification_approved.in_app': true, 'verification_approved.email': true, 'verification_approved.push': true, 'verification_approved.sms': true,
  'verification_rejected.in_app': true, 'verification_rejected.email': true,
  'data_released.in_app': true, 'data_released.email': true, 'data_released.push': true, 'data_released.sms': true,
  'profile_updated.in_app': true,
  'document_uploaded.in_app': true,
};

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const prefsQ = useNotificationPreferences(user?.id);
  const saveMut = useSaveNotificationPreferences();

  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (prefsQ.data) {
      setPrefs({ ...DEFAULTS, ...prefsQ.data });
    }
  }, [prefsQ.data]);

  const toggle = (event: EventKey, channel: Channel, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [`${event}.${channel}`]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveMut.mutateAsync({ userId: user.id, preferences: prefs });
      setDirty(false);
      toast({ title: 'Preferences saved', description: 'Your notification settings have been updated.' });
    } catch (err) {
      toast({ title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  return (
    <div>
      <DashboardPageHeader
        title="Notification Settings"
        description="Choose how and when you want to be notified across all channels."
        action={
          <Button onClick={handleSave} disabled={!dirty || saveMut.isPending} className="shadow-glow">
            {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Preferences
          </Button>
        }
      />

      {/* Channel legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {CHANNELS.map((ch: { key: Channel; label: string; icon: typeof Bell }) => (
          <div key={ch.key} className="flex items-center gap-2 text-sm text-muted-foreground">
            <ch.icon className="h-4 w-4" /> {ch.label}
          </div>
        ))}
      </div>

      {prefsQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border/30">
            {EVENTS.map((event: { key: EventKey; label: string; desc: string; icon: typeof Bell }) => {
              const Icon = event.icon;
              return (
                <div key={event.key} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <Label className="font-medium">{event.label}</Label>
                      <p className="text-sm text-muted-foreground">{event.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 sm:gap-6 pl-13 sm:pl-0">
                    {CHANNELS.map((ch: { key: Channel; label: string; icon: typeof Bell }) => {
                      const key = `${event.key}.${ch.key}`;
                      const checked = prefs[key] || false;
                      return (
                        <div key={ch.key} className="flex flex-col items-center gap-1">
                          <Switch
                            checked={checked}
                            onCheckedChange={(v) => toggle(event.key, ch.key, v)}
                            aria-label={`${ch.label} for ${event.label}`}
                          />
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <ch.icon className="h-3 w-3" /> {ch.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {dirty && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-4">
          <p className="text-sm text-warning">You have unsaved changes.</p>
          <Button size="sm" onClick={handleSave} disabled={saveMut.isPending}>
            {saveMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Now
          </Button>
        </div>
      )}
    </div>
  );
}
