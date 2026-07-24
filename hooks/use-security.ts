'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface LoginHistoryItem {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  location: string | null;
  success: boolean;
  created_at: string | null;
}

export interface SecurityEventItem {
  id: string;
  user_id: string;
  event_type: string;
  severity: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string | null;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: string;
  death_certificate_url: string | null;
  government_id_url: string | null;
  submitted_at: string | null;
  reviewer_id: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  released_at: string | null;
  created_at: string | null;
}

export interface AccessGrant {
  id: string;
  user_id: string;
  contact_id: string;
  category: string;
  is_granted: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface TrustedContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
}

const MOCK_CONTACTS: TrustedContact[] = [
  { id: 'c-1', name: 'Sarah Mitchell', email: 'sarah.m@email.com', phone: '+1 (555) 234-5678', relationship: 'Sister' },
  { id: 'c-2', name: 'David Kim', email: 'david.k@email.com', phone: '+1 (555) 123-4567', relationship: 'Spouse' },
  { id: 'c-3', name: 'James Chen', email: 'jchen@lawfirm.com', phone: '+1 (555) 345-6789', relationship: 'Attorney' },
];

const MOCK_GRANTS: AccessGrant[] = [
  { id: 'g-1', user_id: 'usr-1', contact_id: 'c-1', category: 'profile', is_granted: true, created_at: new Date().toISOString(), updated_at: null },
  { id: 'g-2', user_id: 'usr-1', contact_id: 'c-1', category: 'photos', is_granted: true, created_at: new Date().toISOString(), updated_at: null },
  { id: 'g-3', user_id: 'usr-1', contact_id: 'c-2', category: 'digital_vault', is_granted: true, created_at: new Date().toISOString(), updated_at: null },
  { id: 'g-4', user_id: 'usr-1', contact_id: 'c-3', category: 'digital_will', is_granted: true, created_at: new Date().toISOString(), updated_at: null },
];

const MOCK_VERIFICATIONS: VerificationRequest[] = [
  { id: 'vr-1', user_id: 'usr-1', status: 'approved', death_certificate_url: 'cert.pdf', government_id_url: 'id.pdf', submitted_at: '2026-01-10T10:00:00Z', reviewer_id: 'admin-1', reviewed_at: '2026-01-11T12:00:00Z', review_notes: 'Certificate verified with state registry.', released_at: '2026-01-11T12:05:00Z', created_at: '2026-01-10T10:00:00Z' },
];

export function useLoginHistory() {
  const supabase = createSupabaseBrowserClient();
  return useQuery<LoginHistoryItem[]>({
    queryKey: ['login_history'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('login_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) return data;
      } catch {}
      return [
        { id: 'lh-1', user_id: 'demo', ip_address: '192.168.1.1', user_agent: 'Chrome/Windows', device_type: 'Desktop', location: 'San Francisco, CA', success: true, created_at: new Date().toISOString() },
        { id: 'lh-2', user_id: 'demo', ip_address: '192.168.1.1', user_agent: 'Chrome/Windows', device_type: 'Desktop', location: 'San Francisco, CA', success: true, created_at: new Date(Date.now() - 86400000).toISOString() },
      ];
    },
  });
}

export function useSecurityEvents() {
  const supabase = createSupabaseBrowserClient();
  return useQuery<SecurityEventItem[]>({
    queryKey: ['security_events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('security_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) return data;
      } catch {}
      return [
        { id: 'se-1', user_id: 'demo', event_type: 'Vault Access', severity: 'low', ip_address: '192.168.1.1', user_agent: 'Chrome/Windows', created_at: new Date().toISOString() },
      ];
    },
  });
}

export function useVerificationRequests(allUsers = false) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<VerificationRequest[]>({
    queryKey: ['verification_requests', allUsers],
    queryFn: async () => {
      try {
        let query = supabase
          .from('verification_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (!allUsers) {
          query = query.is('deleted_at', null);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch {}

      const raw = typeof window !== 'undefined' ? localStorage.getItem('legacy_verifications') : null;
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
      return MOCK_VERIFICATIONS;
    },
  });
}

export function useAccessGrants() {
  const supabase = createSupabaseBrowserClient();
  return useQuery<AccessGrant[]>({
    queryKey: ['access_grants'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('access_grants')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch {}

      const raw = typeof window !== 'undefined' ? localStorage.getItem('legacy_access_grants') : null;
      if (raw) {
        try { return JSON.parse(raw); } catch {}
      }
      return MOCK_GRANTS;
    },
  });
}

export function useTrustedContacts() {
  const supabase = createSupabaseBrowserClient();
  return useQuery<TrustedContact[]>({
    queryKey: ['trusted_contacts_for_grants'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('trusted_contacts')
          .select('id, name, email, phone, relationship')
          .is('deleted_at', null)
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch {}

      const raw = typeof window !== 'undefined' ? localStorage.getItem('legacy_trusted_family') : null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          return parsed.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone || '+1 (555) 000-0000',
            relationship: m.relation || m.relationship,
          }));
        } catch {}
      }
      return MOCK_CONTACTS;
    },
  });
}

const CATEGORIES = [
  'profile', 'medical', 'insurance', 'financial', 'government_ids',
  'digital_vault', 'photos', 'documents', 'passwords', 'digital_will',
  'emergency_instructions',
] as const;

export { CATEGORIES };

export function useSaveAccessGrants() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      contactId,
      grants,
    }: {
      userId: string;
      contactId: string;
      grants: Record<string, boolean>;
    }) => {
      const currentRaw = typeof window !== 'undefined' ? localStorage.getItem('legacy_access_grants') : null;
      let currentGrants: AccessGrant[] = currentRaw ? JSON.parse(currentRaw) : MOCK_GRANTS;

      for (const category of CATEGORIES) {
        const isGranted = grants[category] || false;
        const idx = currentGrants.findIndex(g => g.contact_id === contactId && g.category === category);
        if (idx >= 0) {
          currentGrants[idx].is_granted = isGranted;
        } else {
          currentGrants.push({
            id: `g-${Date.now()}-${category}`,
            user_id: userId,
            contact_id: contactId,
            category,
            is_granted: isGranted,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('legacy_access_grants', JSON.stringify(currentGrants));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access_grants'] });
    },
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      deathCertificateUrl,
      governmentIdUrl,
    }: {
      userId: string;
      deathCertificateUrl: string;
      governmentIdUrl: string;
    }) => {
      const newReq: VerificationRequest = {
        id: `vr-${Date.now()}`,
        user_id: userId,
        status: 'pending',
        death_certificate_url: deathCertificateUrl,
        government_id_url: governmentIdUrl,
        submitted_at: new Date().toISOString(),
        reviewer_id: null,
        reviewed_at: null,
        review_notes: null,
        released_at: null,
        created_at: new Date().toISOString(),
      };

      const raw = typeof window !== 'undefined' ? localStorage.getItem('legacy_verifications') : null;
      const list: VerificationRequest[] = raw ? JSON.parse(raw) : MOCK_VERIFICATIONS;
      const updated = [newReq, ...list];
      if (typeof window !== 'undefined') {
        localStorage.setItem('legacy_verifications', JSON.stringify(updated));
      }
      return newReq;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification_requests'] });
    },
  });
}

export function useReviewVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      reviewerId,
      reviewNotes,
    }: {
      requestId: string;
      status: string;
      reviewerId: string;
      reviewNotes?: string;
    }) => {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('legacy_verifications') : null;
      let list: VerificationRequest[] = raw ? JSON.parse(raw) : MOCK_VERIFICATIONS;
      list = list.map((item) => {
        if (item.id === requestId) {
          return {
            ...item,
            status,
            reviewer_id: reviewerId,
            reviewed_at: new Date().toISOString(),
            review_notes: reviewNotes || item.review_notes,
            released_at: status === 'approved' ? new Date().toISOString() : item.released_at,
          };
        }
        return item;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('legacy_verifications', JSON.stringify(list));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification_requests'] });
    },
  });
}

export async function uploadVerificationFile(userId: string, file: File): Promise<string> {
  return URL.createObjectURL(file);
}
