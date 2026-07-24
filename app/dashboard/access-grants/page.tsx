'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, User, Heart, Building2, Wallet, IdCard,
  FolderLock, Image, FileText, KeyRound, ScrollText, Bell,
  Check, Loader2, AlertCircle, Users, Save, Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  useAccessGrants, useTrustedContacts, useSaveAccessGrants, CATEGORIES,
  type TrustedContact,
} from '@/hooks/use-security';

const CATEGORY_META: Record<string, { label: string; icon: typeof User; color: string }> = {
  profile: { label: 'Profile', icon: User, color: 'text-blue-600' },
  medical: { label: 'Medical Information', icon: Heart, color: 'text-rose-600' },
  insurance: { label: 'Insurance', icon: Building2, color: 'text-teal-600' },
  financial: { label: 'Financial Assets', icon: Wallet, color: 'text-indigo-600' },
  government_ids: { label: 'Government IDs', icon: IdCard, color: 'text-cyan-600' },
  digital_vault: { label: 'Digital Vault', icon: FolderLock, color: 'text-amber-600' },
  photos: { label: 'Photos', icon: Image, color: 'text-green-600' },
  documents: { label: 'Documents', icon: FileText, color: 'text-slate-600' },
  passwords: { label: 'Passwords', icon: KeyRound, color: 'text-orange-600' },
  digital_will: { label: 'Digital Will', icon: ScrollText, color: 'text-purple-600' },
  emergency_instructions: { label: 'Emergency Instructions', icon: Bell, color: 'text-red-600' },
};

export default function AccessGrantsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const grantsQ = useAccessGrants();
  const contactsQ = useTrustedContacts();
  const saveMut = useSaveAccessGrants();

  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, boolean>>>({});
  const [savingContactId, setSavingContactId] = useState<string | null>(null);

  const contacts = contactsQ.data || [];

  const getEffectiveGrants = (contactId: string): Record<string, boolean> => {
    const saved: Record<string, boolean> = {};
    for (const g of grantsQ.data || []) {
      if (g.contact_id === contactId) {
        saved[g.category] = g.is_granted;
      }
    }
    return { ...saved, ...(pendingChanges[contactId] || {}) };
  };

  const toggleGrant = (contactId: string, category: string, value: boolean) => {
    setPendingChanges((prev) => ({
      ...prev,
      [contactId]: { ...(prev[contactId] || {}), [category]: value },
    }));
  };

  const hasChanges = (contactId: string): boolean => {
    return !!pendingChanges[contactId] && Object.keys(pendingChanges[contactId]).length > 0;
  };

  const handleSave = async (contactId: string) => {
    if (!user) return;
    const grants = getEffectiveGrants(contactId);
    setSavingContactId(contactId);
    try {
      await saveMut.mutateAsync({ userId: user.id, contactId, grants });
      setPendingChanges((prev) => {
        const next = { ...prev };
        delete next[contactId];
        return next;
      });
      const contactName = contacts.find((c: TrustedContact) => c.id === contactId)?.name || 'contact';
      toast({ title: 'Access grants saved', description: `Permissions for ${contactName} have been updated.` });
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSavingContactId(null);
    }
  };

  const grantCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const contact of contacts) {
      const grants = getEffectiveGrants(contact.id);
      counts[contact.id] = CATEGORIES.filter((c: string) => grants[c]).length;
    }
    return counts;
  }, [grantsQ.data, pendingChanges, contacts]);

  if (contactsQ.isLoading) {
    return (
      <div>
        <DashboardPageHeader title="Access Grants" description="Define which trusted member can access each category after verification." />
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div>
        <DashboardPageHeader title="Access Grants" description="Define which trusted member can access each category after verification." />
        <Card className="p-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No trusted contacts yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Add trusted family members first, then return here to define which information categories each person can access.
          </p>
          <Button className="mt-4" onClick={() => (window.location.href = '/dashboard/trusted-family')}>
            <Users className="mr-2 h-4 w-4" /> Add Trusted Contacts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        title="Access Grants"
        description="Define which trusted member can access each category after death verification is approved."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Contact list */}
        <div className="space-y-2">
          {contacts.map((contact: TrustedContact, i: number) => {
            const grants = getEffectiveGrants(contact.id);
            const count = grantCounts[contact.id] || 0;
            const isActive = selectedContactId === contact.id;
            return (
              <motion.div key={contact.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card
                  className={`p-4 cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-soft'}`}
                  onClick={() => setSelectedContactId(contact.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.relationship || contact.email || 'No details'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={count > 0 ? 'default' : 'secondary'} className={count > 0 ? 'bg-primary/10 text-primary' : ''}>
                        {count}/{CATEGORIES.length}
                      </Badge>
                      {hasChanges(contact.id) && (
                        <span className="text-xs text-warning">unsaved</span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Grant matrix */}
        <div>
          {!selectedContactId ? (
            <Card className="p-12 flex flex-col items-center text-center">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">Select a contact</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a trusted contact from the left to configure their data access permissions.
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              {(() => {
                const contact = contacts.find((c: TrustedContact) => c.id === selectedContactId)!;
                const grants = getEffectiveGrants(selectedContactId);
                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold">{contact.name}</h2>
                          <p className="text-sm text-muted-foreground">
                            {contact.relationship || 'Trusted contact'} · {contact.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSave(selectedContactId)}
                        disabled={!hasChanges(selectedContactId) || savingContactId === selectedContactId}
                      >
                        {savingContactId === selectedContactId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </div>

                    <div className="rounded-lg bg-muted/30 border border-border/40 p-4 mb-6 flex items-start gap-3">
                      <Lock className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        These permissions take effect only after death verification is approved by an administrator.
                        Until then, this contact cannot access any of your data.
                      </p>
                    </div>

                    <div className="space-y-1">
                      {CATEGORIES.map((category, i) => {
                        const meta = CATEGORY_META[category];
                        const Icon = meta.icon;
                        const isGranted = grants[category] || false;
                        return (
                          <div key={category}>
                            {i > 0 && <Separator className="my-3" />}
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50`}>
                                  <Icon className={`h-4 w-4 ${meta.color}`} />
                                </div>
                                <div>
                                  <Label className="font-medium cursor-pointer">{meta.label}</Label>
                                  <p className="text-xs text-muted-foreground">
                                    {isGranted ? 'Access granted after verification' : 'No access'}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={isGranted}
                                onCheckedChange={(checked) => toggleGrant(selectedContactId, category, checked)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {hasChanges(selectedContactId) && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-warning">
                        <AlertCircle className="h-4 w-4" />
                        You have unsaved changes. Click Save to apply.
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
