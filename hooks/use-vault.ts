'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { encryptJSON } from '@/lib/crypto';

export interface VaultItem {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  item_type: string;
  encrypted_data: string | null;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  tags: string[] | null;
  is_starred: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface VaultFolder {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  parent_folder_id: string | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface CreateVaultItemInput {
  title: string;
  item_type: string;
  folder_id?: string | null;
  sensitiveData?: Record<string, string>;
  fileUrl?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  thumbnailUrl?: string | null;
  notes?: string;
  tags?: string[];
}

const INITIAL_FOLDERS: VaultFolder[] = [
  { id: 'f-1', user_id: '00000000-0000-0000-0000-000000000000', name: 'Personal Records', icon: 'folder', parent_folder_id: null, sort_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: 'f-2', user_id: '00000000-0000-0000-0000-000000000000', name: 'Financial & Taxes', icon: 'folder', parent_folder_id: null, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
  { id: 'f-3', user_id: '00000000-0000-0000-0000-000000000000', name: 'Legal & Wills', icon: 'folder', parent_folder_id: null, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), deleted_at: null },
];

const INITIAL_ITEMS: VaultItem[] = [
  {
    id: 'item-1',
    user_id: '00000000-0000-0000-0000-000000000000',
    folder_id: 'f-1',
    title: 'Primary Email & Recovery Key',
    item_type: 'password',
    encrypted_data: JSON.stringify({ username: 'demo@legacyvault.com', password: 'SuperSecretPassword2026!' }),
    file_url: null,
    file_size: null,
    mime_type: null,
    thumbnail_url: null,
    notes: 'Master credentials for recovery email',
    tags: ['Personal', 'Critical'],
    is_starred: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
  {
    id: 'item-2',
    user_id: '00000000-0000-0000-0000-000000000000',
    folder_id: 'f-3',
    title: 'House Deed & Title Insurance',
    item_type: 'legal_document',
    encrypted_data: null,
    file_url: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=800',
    file_size: 2450000,
    mime_type: 'image/jpeg',
    thumbnail_url: 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=300',
    notes: 'Scanned property deed document',
    tags: ['Legal', 'Real Estate'],
    is_starred: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  },
];

function getLocalFolders(): VaultFolder[] {
  if (typeof window === 'undefined') return INITIAL_FOLDERS;
  const raw = localStorage.getItem('legacy_vault_folders');
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  localStorage.setItem('legacy_vault_folders', JSON.stringify(INITIAL_FOLDERS));
  return INITIAL_FOLDERS;
}

function saveLocalFolders(folders: VaultFolder[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('legacy_vault_folders', JSON.stringify(folders));
  }
}

function getLocalItems(): VaultItem[] {
  if (typeof window === 'undefined') return INITIAL_ITEMS;
  const raw = localStorage.getItem('legacy_vault_items');
  if (raw) {
    try { return JSON.parse(raw); } catch {}
  }
  localStorage.setItem('legacy_vault_items', JSON.stringify(INITIAL_ITEMS));
  return INITIAL_ITEMS;
}

function saveLocalItems(items: VaultItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('legacy_vault_items', JSON.stringify(items));
  }
}

export function useVaultFolders() {
  const supabase = createSupabaseBrowserClient();
  return useQuery<VaultFolder[]>({
    queryKey: ['vault_folders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('vault_folders')
          .select('*')
          .is('deleted_at', null)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) return data;
      } catch {}
      return getLocalFolders().filter((f) => !f.deleted_at);
    },
  });
}

export function useVaultItems(folderId?: string | null, includeTrash?: boolean) {
  const supabase = createSupabaseBrowserClient();
  return useQuery<VaultItem[]>({
    queryKey: ['vault_items', folderId ?? 'all', includeTrash ?? false],
    queryFn: async () => {
      try {
        let query = supabase
          .from('vault_items')
          .select('*')
          .order('is_starred', { ascending: false })
          .order('created_at', { ascending: false });

        if (includeTrash) {
          query = query.not('deleted_at', 'is', null);
        } else {
          query = query.is('deleted_at', null);
          if (folderId === null) {
            query = query.is('folder_id', null);
          } else if (folderId) {
            query = query.eq('folder_id', folderId);
          }
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch {}

      const localItems = getLocalItems();
      return localItems.filter((item) => {
        if (includeTrash) {
          return item.deleted_at !== null;
        }
        if (item.deleted_at !== null) return false;
        if (folderId === null) return item.folder_id === null;
        if (folderId) return item.folder_id === folderId;
        return true;
      });
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const newFolder: VaultFolder = {
        id: `f-${Date.now()}`,
        user_id: '00000000-0000-0000-0000-000000000000',
        name,
        icon: 'folder',
        parent_folder_id: null,
        sort_order: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('vault_folders')
          .insert({ name })
          .select()
          .single();
        if (!error && data) {
          const current = getLocalFolders();
          saveLocalFolders([data, ...current]);
          return data;
        }
      } catch {}

      const current = getLocalFolders();
      const updated = [newFolder, ...current];
      saveLocalFolders(updated);
      return newFolder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_folders'] });
    },
  });
}

export function useCreateVaultItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateVaultItemInput) => {
      let encryptedData: string | null = null;
      if (input.sensitiveData && Object.keys(input.sensitiveData).length > 0) {
        encryptedData = await encryptJSON(input.sensitiveData);
      }

      const newItem: VaultItem = {
        id: `item-${Date.now()}`,
        user_id: '00000000-0000-0000-0000-000000000000',
        folder_id: input.folder_id ?? null,
        title: input.title,
        item_type: input.item_type,
        encrypted_data: encryptedData,
        file_url: input.fileUrl ?? null,
        file_size: input.fileSize ?? null,
        mime_type: input.mimeType ?? null,
        thumbnail_url: input.thumbnailUrl ?? null,
        notes: input.notes ?? null,
        tags: input.tags ?? [],
        is_starred: false,
        sort_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('vault_items')
          .insert({
            title: input.title,
            item_type: input.item_type,
            folder_id: input.folder_id ?? null,
            encrypted_data: encryptedData,
            file_url: input.fileUrl ?? null,
            file_size: input.fileSize ?? null,
            mime_type: input.mimeType ?? null,
            thumbnail_url: input.thumbnailUrl ?? null,
            notes: input.notes ?? null,
            tags: input.tags ?? [],
          })
          .select()
          .single();
        if (!error && data) {
          const current = getLocalItems();
          saveLocalItems([data, ...current]);
          return data;
        }
      } catch {}

      const current = getLocalItems();
      saveLocalItems([newItem, ...current]);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_items'] });
    },
  });
}

export function useSoftDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase
          .from('vault_items')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
      } catch {}

      const current = getLocalItems();
      const updated = current.map((item) =>
        item.id === id ? { ...item, deleted_at: new Date().toISOString() } : item
      );
      saveLocalItems(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_items'] });
    },
  });
}

export function useRestoreItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase
          .from('vault_items')
          .update({ deleted_at: null })
          .eq('id', id);
      } catch {}

      const current = getLocalItems();
      const updated = current.map((item) =>
        item.id === id ? { ...item, deleted_at: null } : item
      );
      saveLocalItems(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_items'] });
    },
  });
}

export function usePermanentDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase
          .from('vault_items')
          .delete()
          .eq('id', id);
      } catch {}

      const current = getLocalItems();
      const updated = current.filter((item) => item.id !== id);
      saveLocalItems(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_items'] });
    },
  });
}

export function useToggleStar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, starred }: { id: string; starred: boolean }) => {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase
          .from('vault_items')
          .update({ is_starred: starred })
          .eq('id', id);
      } catch {}

      const current = getLocalItems();
      const updated = current.map((item) =>
        item.id === id ? { ...item, is_starred: starred } : item
      );
      saveLocalItems(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_items'] });
    },
  });
}

export function useMoveItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      try {
        const supabase = createSupabaseBrowserClient();
        await supabase
          .from('vault_items')
          .update({ folder_id: folderId })
          .eq('id', id);
      } catch {}

      const current = getLocalItems();
      const updated = current.map((item) =>
        item.id === id ? { ...item, folder_id: folderId } : item
      );
      saveLocalItems(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault_items'] });
    },
  });
}

export async function uploadVaultFile(userId: string, file: File): Promise<{ url: string; size: number; mime: string }> {
  try {
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from('vault-files')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (!error) {
      const { data: urlData } = supabase.storage.from('vault-files').getPublicUrl(fileName);
      return { url: urlData.publicUrl, size: file.size, mime: file.type };
    }
  } catch {}

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string, size: file.size, mime: file.type });
    };
    reader.onerror = () => reject(new Error('Failed to convert uploaded file locally'));
    reader.readAsDataURL(file);
  });
}
