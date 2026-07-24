'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Eye, X, Loader2, Mail, Phone, MapPin,
  ShieldCheck, KeyRound, FileText, Calendar, ArrowRight,
  ChevronLeft, ChevronRight, UserCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { AdminShell } from '@/components/admin-shell';
import {
  useAdminUsers, useAdminUserDetail, PAGE_SIZE,
  type AdminUser,
} from '@/hooks/use-admin';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const usersQ = useAdminUsers(search, page);
  const detailQ = useAdminUserDetail(selectedUserId || '');

  const totalPages = Math.ceil((usersQ.data?.count || 0) / PAGE_SIZE);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1">Search, view, and manage all platform users.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-10"
        />
      </div>

      {/* Users table */}
      {usersQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : (usersQ.data?.data || []).length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No users found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? 'Try a different search term.' : 'No users have registered yet.'}
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="divide-y divide-border/40">
              {(usersQ.data?.data || []).map((user: AdminUser, i: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.2) }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                    <AvatarFallback>
                      {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.full_name || 'Unnamed user'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-xs font-medium">{formatDate(user.created_at)}</p>
                  </div>
                  <Badge variant={user.deleted_at ? 'destructive' : 'secondary'} className="shrink-0">
                    {user.deleted_at ? 'Deleted' : 'Active'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setSelectedUserId(user.id)} className="shrink-0">
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                  </Button>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages} ({usersQ.data?.count} total)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User detail dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => { if (!open) setSelectedUserId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailQ.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : detailQ.data ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={detailQ.data.profile?.avatar_url || undefined} alt={detailQ.data.profile?.full_name} />
                    <AvatarFallback className="text-xl">
                      <UserCircle className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{detailQ.data.profile?.full_name || 'Unnamed user'}</DialogTitle>
                    <DialogDescription>{detailQ.data.profile?.email}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Profile info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoRow icon={Mail} label="Email" value={detailQ.data.profile?.email} />
                  <InfoRow icon={Phone} label="Phone" value={detailQ.data.profile?.phone} />
                  <InfoRow icon={Calendar} label="Joined" value={formatDate(detailQ.data.profile?.created_at || null)} />
                  <InfoRow icon={MapPin} label="Address" value={detailQ.data.profile?.address || '—'} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <ShieldCheck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{detailQ.data.vaultCount}</p>
                      <p className="text-xs text-muted-foreground">Vault Items</p>
                    </div>
                  </Card>
                  <Card className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{detailQ.data.contactCount}</p>
                      <p className="text-xs text-muted-foreground">Trusted Contacts</p>
                    </div>
                  </Card>
                </div>

                <Separator />

                {/* Trusted contacts */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Trusted Contacts</h3>
                  {detailQ.data.contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No trusted contacts added.</p>
                  ) : (
                    <div className="space-y-2">
                      {detailQ.data.contacts.map((contact: { id: string; name: string; email: string | null; phone: string | null; relationship: string | null }) => (
                        <div key={contact.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{(contact.name || 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{contact.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {contact.relationship || ''} {contact.relationship && contact.email ? ' · ' : ''}{contact.email || ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent vault items */}
                {detailQ.data.vaultItems.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold mb-3">Recent Vault Items</h3>
                      <div className="space-y-2">
                        {detailQ.data.vaultItems.map((item: { id: string; title: string; item_type: string; created_at: string | null }) => (
                          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <p className="text-xs text-muted-foreground">{item.item_type}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}
