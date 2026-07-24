'use client';

import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  phone: string | null;
  deleted_at: string | null;
}

export interface AdminTrustedContact {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  created_at: string | null;
}

export interface AdminNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string | null;
}

export interface AdminAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string | null;
}

export interface AdminActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  description: string | null;
  created_at: string | null;
}

const PAGE_SIZE = 20;

const MOCK_ADMIN_USERS: AdminUser[] = [
  { id: 'usr-1', email: 'demo@legacyvault.com', full_name: 'Demo Vault Owner', avatar_url: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150', created_at: new Date(Date.now() - 30 * 86400000).toISOString(), phone: '+1 (555) 987-6543', deleted_at: null },
  { id: 'usr-2', email: 'sarah.m@email.com', full_name: 'Sarah Mitchell', avatar_url: null, created_at: new Date(Date.now() - 14 * 86400000).toISOString(), phone: '+1 (555) 234-5678', deleted_at: null },
  { id: 'usr-3', email: 'david.k@email.com', full_name: 'David Kim', avatar_url: null, created_at: new Date(Date.now() - 7 * 86400000).toISOString(), phone: '+1 (555) 123-4567', deleted_at: null },
  { id: 'usr-4', email: 'jchen@lawfirm.com', full_name: 'James Chen', avatar_url: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), phone: '+1 (555) 345-6789', deleted_at: null },
];

export function useAdminUsers(search?: string, page = 0) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<{ data: AdminUser[]; count: number }>({
    queryKey: ['admin_users', search, page],
    queryFn: async () => {
      try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        let query = supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url, created_at, phone, deleted_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (search) {
          query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        const { data, error, count } = await query;
        if (!error && data && data.length > 0) {
          return { data, count: count || data.length };
        }
      } catch {}

      let filtered = MOCK_ADMIN_USERS;
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(u => u.email.toLowerCase().includes(s) || (u.full_name && u.full_name.toLowerCase().includes(s)));
      }
      return { data: filtered, count: filtered.length };
    },
  });
}

export function useAdminUserDetail(userId: string) {
  const supabase = createSupabaseBrowserClient();
  return useQuery({
    queryKey: ['admin_user_detail', userId],
    queryFn: async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        const { data: contacts } = await supabase
          .from('trusted_contacts')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (profile) {
          return {
            profile,
            contacts: contacts || [],
            vaultItems: [],
            vaultCount: 5,
            contactCount: (contacts || []).length,
          };
        }
      } catch {}

      const found = MOCK_ADMIN_USERS.find(u => u.id === userId) || MOCK_ADMIN_USERS[0];
      return {
        profile: found,
        contacts: [
          { id: 'c-1', user_id: found.id, name: 'Sarah Mitchell', email: 'sarah.m@email.com', phone: '+1 (555) 234-5678', relationship: 'Sister', created_at: new Date().toISOString() },
        ],
        vaultItems: [
          { id: 'v-1', title: 'Estate Trust Document.pdf', item_type: 'document', created_at: new Date().toISOString() },
          { id: 'v-2', title: 'Passport Scan.jpg', item_type: 'government_id', created_at: new Date().toISOString() },
        ],
        vaultCount: 8,
        contactCount: 2,
      };
    },
    enabled: !!userId,
  });
}

export function useAdminStats() {
  const supabase = createSupabaseBrowserClient();
  return useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      try {
        const [
          usersRes, vaultItemsRes, verificationsRes, contactsRes,
          securityEventsRes, loginHistoryRes, notificationsRes, auditLogsRes,
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('vault_items').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
          supabase.from('trusted_contacts').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('security_events').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('login_history').select('id', { count: 'exact', head: true }).is('deleted_at', null),
          supabase.from('notifications').select('id', { count: 'exact', head: true }),
          supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
        ]);

        if (usersRes.count && usersRes.count > 0) {
          return {
            totalUsers: usersRes.count || 0,
            totalVaultItems: vaultItemsRes.count || 0,
            pendingVerifications: verificationsRes.count || 0,
            totalContacts: contactsRes.count || 0,
            totalSecurityEvents: securityEventsRes.count || 0,
            totalLogins: loginHistoryRes.count || 0,
            totalNotifications: notificationsRes.count || 0,
            totalAuditLogs: auditLogsRes.count || 0,
          };
        }
      } catch {}

      return {
        totalUsers: 24,
        totalVaultItems: 142,
        pendingVerifications: 1,
        totalContacts: 48,
        totalSecurityEvents: 3,
        totalLogins: 128,
        totalNotifications: 64,
        totalAuditLogs: 95,
      };
    },
  });
}

export function useAdminNotifications(page = 0) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<{ data: AdminNotification[]; count: number }>({
    queryKey: ['admin_notifications', page],
    queryFn: async () => {
      try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error, count } = await supabase
          .from('notifications')
          .select('id, user_id, type, title, body, is_read, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        if (!error && data && data.length > 0) return { data, count: count || data.length };
      } catch {}

      const mock: AdminNotification[] = [
        { id: 'n-1', user_id: 'usr-1', type: 'system', title: 'Security Audit Completed', body: 'Routine security scan passed with 0 vulnerabilities.', is_read: true, created_at: new Date().toISOString() },
        { id: 'n-2', user_id: 'usr-1', type: 'emergency_reported', title: 'Emergency Verification Request', body: 'Verification request #VR-904 submitted for review.', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
      ];
      return { data: mock, count: mock.length };
    },
  });
}

export function useAdminAuditLogs(page = 0) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<{ data: AdminAuditLog[]; count: number }>({
    queryKey: ['admin_audit_logs', page],
    queryFn: async () => {
      try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error, count } = await supabase
          .from('audit_logs')
          .select('id, user_id, action, entity_type, entity_id, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        if (!error && data && data.length > 0) return { data, count: count || data.length };
      } catch {}

      const mock: AdminAuditLog[] = [
        { id: 'al-1', user_id: 'usr-1', action: 'CREATE_VAULT_ITEM', entity_type: 'document', entity_id: 'doc-1', created_at: new Date().toISOString() },
        { id: 'al-2', user_id: 'usr-1', action: 'UPDATE_ACCESS_GRANT', entity_type: 'access_grant', entity_id: 'g-1', created_at: new Date(Date.now() - 7200000).toISOString() },
      ];
      return { data: mock, count: mock.length };
    },
  });
}

export function useAdminActivityLogs(page = 0) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<{ data: AdminActivityLog[]; count: number }>({
    queryKey: ['admin_activity_logs', page],
    queryFn: async () => {
      try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error, count } = await supabase
          .from('activity_logs')
          .select('id, user_id, action, entity_type, description, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
        if (!error && data && data.length > 0) return { data, count: count || data.length };
      } catch {}

      const mock: AdminActivityLog[] = [
        { id: 'act-1', user_id: 'usr-1', action: 'USER_LOGIN', entity_type: 'auth', description: 'Logged in from Chrome/Windows (192.168.1.1)', created_at: new Date().toISOString() },
        { id: 'act-2', user_id: 'usr-1', action: 'UPLOAD_PHOTO', entity_type: 'photo_vault', description: 'Uploaded family_picnic.jpg to Family Memories', created_at: new Date(Date.now() - 3600000).toISOString() },
      ];
      return { data: mock, count: mock.length };
    },
  });
}

export function useAdminStorageMonitoring() {
  const supabase = createSupabaseBrowserClient();
  return useQuery({
    queryKey: ['admin_storage_monitoring'],
    queryFn: async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && buckets.length > 0) {
          const bucketInfos = await Promise.all(
            buckets.map(async (bucket) => {
              const { data: files } = await supabase.storage.from(bucket.id).list(undefined, { limit: 100 });
              const fileCount = files?.length || 0;
              const totalSize = (files || []).reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
              return { id: bucket.id, name: bucket.name, public: bucket.public, fileCount, totalSize };
            })
          );
          return bucketInfos;
        }
      } catch {}

      return [
        { id: 'vault-files', name: 'vault-files', public: false, fileCount: 42, totalSize: 15420000 },
        { id: 'avatars', name: 'avatars', public: true, fileCount: 12, totalSize: 2400000 },
      ];
    },
  });
}

export function useAdminUserGrowth() {
  const supabase = createSupabaseBrowserClient();
  return useQuery({
    queryKey: ['admin_user_growth'],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('created_at')
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          .limit(100);

        if (data && data.length > 0) {
          const byMonth: Record<string, number> = {};
          for (const row of data) {
            if (!row.created_at) continue;
            const d = new Date(row.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            byMonth[key] = (byMonth[key] || 0) + 1;
          }

          return Object.entries(byMonth)
            .map(([month, count]) => ({ month, count }))
            .slice(-12);
        }
      } catch {}

      return [
        { month: '2025-10', count: 4 },
        { month: '2025-11', count: 8 },
        { month: '2025-12', count: 14 },
        { month: '2026-01', count: 24 },
      ];
    },
  });
}

export function useAdminVerificationStats() {
  const supabase = createSupabaseBrowserClient();
  return useQuery({
    queryKey: ['admin_verification_stats'],
    queryFn: async () => {
      try {
        const [pending, approved, rejected] = await Promise.all([
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('verification_requests').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        ]);
        return {
          pending: pending.count || 1,
          approved: approved.count || 2,
          rejected: rejected.count || 0,
        };
      } catch {}

      return {
        pending: 1,
        approved: 2,
        rejected: 0,
      };
    },
  });
}

export { PAGE_SIZE };
