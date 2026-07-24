'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderLock, FileText, Image as ImageIcon, Video, CreditCard, IdCard,
  Wallet, Heart, ShieldCheck, Cloud, Bitcoin, KeyRound, Plus, Search,
  Lock, Trash2, RotateCcw, Star, Download, Eye, EyeOff, X, Folder,
  Loader2, ChevronDown, ArrowUpDown, MoreVertical, AlertCircle,
  Fingerprint, File, Upload, ArrowLeft, Grid3x3, List, Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  useVaultFolders, useVaultItems, useCreateFolder, useCreateVaultItem,
  useSoftDeleteItem, useRestoreItem, usePermanentDeleteItem, useToggleStar,
  uploadVaultFile, type VaultItem,
} from '@/hooks/use-vault';
import { setVaultPassphrase, isVaultUnlocked, encryptJSON, decryptJSON } from '@/lib/crypto';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type ItemType =
  | 'password' | 'document' | 'photo' | 'video' | 'government_id'
  | 'insurance' | 'medical_report' | 'financial_document' | 'legal_document'
  | 'cloud_link' | 'crypto_wallet';

interface ItemTypeConfig {
  label: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
  hasFile: boolean;
  hasSensitiveData: boolean;
  sensitiveFields?: { key: string; label: string; placeholder: string; type?: 'text' | 'password' }[];
}

const ITEM_TYPES: Record<ItemType, ItemTypeConfig> = {
  password: {
    label: 'Password', icon: KeyRound, color: 'text-amber-600', bgColor: 'bg-amber-500/10',
    hasFile: false, hasSensitiveData: true,
    sensitiveFields: [
      { key: 'username', label: 'Username / Email', placeholder: 'john@example.com', type: 'text' },
      { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
      { key: 'url', label: 'Website URL', placeholder: 'https://example.com', type: 'text' },
    ],
  },
  document: {
    label: 'Document', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-500/10',
    hasFile: true, hasSensitiveData: false,
  },
  photo: {
    label: 'Photo', icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-500/10',
    hasFile: true, hasSensitiveData: false,
  },
  video: {
    label: 'Video', icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-500/10',
    hasFile: true, hasSensitiveData: false,
  },
  government_id: {
    label: 'Government ID', icon: IdCard, color: 'text-cyan-600', bgColor: 'bg-cyan-500/10',
    hasFile: true, hasSensitiveData: false,
  },
  insurance: {
    label: 'Insurance', icon: ShieldCheck, color: 'text-teal-600', bgColor: 'bg-teal-500/10',
    hasFile: true, hasSensitiveData: true,
    sensitiveFields: [
      { key: 'policy_number', label: 'Policy Number', placeholder: 'POL-12345', type: 'text' },
      { key: 'provider', label: 'Provider', placeholder: 'Allstate', type: 'text' },
    ],
  },
  medical_report: {
    label: 'Medical Report', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-500/10',
    hasFile: true, hasSensitiveData: false,
  },
  financial_document: {
    label: 'Financial Document', icon: CreditCard, color: 'text-indigo-600', bgColor: 'bg-indigo-500/10',
    hasFile: true, hasSensitiveData: true,
    sensitiveFields: [
      { key: 'account_number', label: 'Account Number', placeholder: '****1234', type: 'text' },
      { key: 'institution', label: 'Institution', placeholder: 'Chase Bank', type: 'text' },
    ],
  },
  legal_document: {
    label: 'Legal Document', icon: File, color: 'text-slate-600', bgColor: 'bg-slate-500/10',
    hasFile: true, hasSensitiveData: false,
  },
  cloud_link: {
    label: 'Cloud Link', icon: Cloud, color: 'text-sky-600', bgColor: 'bg-sky-500/10',
    hasFile: false, hasSensitiveData: true,
    sensitiveFields: [
      { key: 'url', label: 'Cloud URL', placeholder: 'https://drive.google.com/...', type: 'text' },
      { key: 'credentials', label: 'Access Credentials', placeholder: 'email + password', type: 'password' },
    ],
  },
  crypto_wallet: {
    label: 'Crypto Wallet', icon: Bitcoin, color: 'text-orange-600', bgColor: 'bg-orange-500/10',
    hasFile: false, hasSensitiveData: true,
    sensitiveFields: [
      { key: 'wallet_address', label: 'Wallet Address', placeholder: '0x...', type: 'text' },
      { key: 'seed_phrase', label: 'Seed Phrase', placeholder: 'word word word...', type: 'password' },
      { key: 'private_key', label: 'Private Key', placeholder: '••••••••', type: 'password' },
    ],
  },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title_az', label: 'Title (A-Z)' },
  { value: 'title_za', label: 'Title (Z-A)' },
  { value: 'largest', label: 'Largest File' },
] as const;

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DigitalVaultPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [unlocked, setUnlocked] = useState(isVaultUnlocked());
  const [passphrase, setPassphrase] = useState('');
  const [passphraseError, setPassphraseError] = useState('');

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['value']>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewItem, setPreviewItem] = useState<VaultItem | null>(null);
  const [decryptedData, setDecryptedData] = useState<Record<string, string> | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState<Record<string, boolean>>({});

  // Add dialog form state
  const [addType, setAddType] = useState<ItemType>('password');
  const [addTitle, setAddTitle] = useState('');
  const [addFolder, setAddFolder] = useState<string>('none');
  const [addNotes, setAddNotes] = useState('');
  const [addTags, setAddTags] = useState('');
  const [sensitiveFields, setSensitiveFields] = useState<Record<string, string>>({});
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const foldersQ = useVaultFolders();
  const itemsQ = useVaultItems(showTrash ? undefined : activeFolder, showTrash);
  const createFolderMut = useCreateFolder();
  const createItemMut = useCreateVaultItem();
  const softDeleteMut = useSoftDeleteItem();
  const restoreMut = useRestoreItem();
  const permanentDeleteMut = usePermanentDeleteItem();
  const toggleStarMut = useToggleStar();

  const handleUnlock = () => {
    if (passphrase.length < 4) {
      setPassphraseError('Passphrase must be at least 4 characters');
      return;
    }
    setVaultPassphrase(passphrase);
    setUnlocked(true);
    setPassphrase('');
    setPassphraseError('');
  };

  const filteredItems = useMemo(() => {
    if (!itemsQ.data) return [];
    let items = itemsQ.data;

    if (typeFilter !== 'all') {
      items = items.filter((i: VaultItem) => i.item_type === typeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i: VaultItem) =>
          i.title.toLowerCase().includes(q) ||
          (i.notes && i.notes.toLowerCase().includes(q)) ||
          (i.tags && i.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    const sorted = [...items];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case 'title_az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_za':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'largest':
        sorted.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
        break;
    }
    return sorted;
  }, [itemsQ.data, typeFilter, searchQuery, sortBy]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!itemsQ.data) return counts;
    for (const item of itemsQ.data) {
      if (item.deleted_at) continue;
      const fid = item.folder_id || '__none';
      counts[fid] = (counts[fid] || 0) + 1;
    }

    return counts;
  }, [itemsQ.data]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!itemsQ.data) return counts;
    for (const item of itemsQ.data) {
      if (item.deleted_at) continue;
      counts[item.item_type] = (counts[item.item_type] || 0) + 1;
    }

    return counts;
  }, [itemsQ.data]);

  const resetAddForm = () => {
    setAddType('password');
    setAddTitle('');
    setAddFolder('none');
    setAddNotes('');
    setAddTags('');
    setSensitiveFields({});
    setUploadFile(null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolderMut.mutateAsync(newFolderName.trim());
      setNewFolderName('');
      setShowFolderDialog(false);
      toast({ title: 'Folder created', description: `"${newFolderName}" is ready.` });
    } catch (err) {
      toast({ title: 'Failed to create folder', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleSaveItem = async () => {
    if (!addTitle.trim()) {
      toast({ title: 'Title required', description: 'Please enter a name for this item.', variant: 'destructive' });
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      let fileUrl: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;
      let thumbnailUrl: string | null = null;

      if (ITEM_TYPES[addType].hasFile && uploadFile) {
        setUploading(true);
        const result = await uploadVaultFile(user.id, uploadFile);
        fileUrl = result.url;
        fileSize = result.size;
        mimeType = result.mime;
        if (result.mime.startsWith('image/')) {
          thumbnailUrl = result.url;
        }
        setUploading(false);
      }

      const sensitiveData: Record<string, string> = {};
      if (ITEM_TYPES[addType].sensitiveFields) {
        for (const field of ITEM_TYPES[addType].sensitiveFields!) {
          if (sensitiveFields[field.key]?.trim()) {
            sensitiveData[field.key] = sensitiveFields[field.key].trim();
          }
        }
      }

      const tags = addTags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean);

      await createItemMut.mutateAsync({
        title: addTitle.trim(),
        item_type: addType,
        folder_id: addFolder === 'none' ? null : addFolder,
        sensitiveData: Object.keys(sensitiveData).length > 0 ? sensitiveData : undefined,
        fileUrl,
        fileSize,
        mimeType,
        thumbnailUrl,
        notes: addNotes.trim() || undefined,
        tags,
      });

      toast({ title: 'Item saved', description: `"${addTitle}" has been added to your vault.` });
      resetAddForm();
      setShowAddDialog(false);
    } catch (err) {
      toast({ title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handlePreview = useCallback(async (item: VaultItem) => {
    setPreviewItem(item);
    setDecryptedData(null);
    if (item.encrypted_data) {
      setDecrypting(true);
      try {
        const data = await decryptJSON(item.encrypted_data);
        setDecryptedData(data);
      } catch {
        toast({ title: 'Decryption failed', description: 'Could not decrypt this item. Check your passphrase.', variant: 'destructive' });
      } finally {
        setDecrypting(false);
      }
    }
  }, [toast]);

  const handleSoftDelete = async (id: string, title: string) => {
    try {
      await softDeleteMut.mutateAsync(id);
      toast({ title: 'Moved to recycle bin', description: `"${title}" has been moved to the recycle bin.` });
    } catch (err) {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreMut.mutateAsync(id);
      toast({ title: 'Item restored', description: 'The item has been restored from the recycle bin.' });
    } catch (err) {
      toast({ title: 'Restore failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    try {
      await permanentDeleteMut.mutateAsync(id);
      toast({ title: 'Permanently deleted', description: `"${title}" has been permanently removed.` });
      if (previewItem?.id === id) setPreviewItem(null);
    } catch (err) {
      toast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleToggleStar = async (id: string, current: boolean) => {
    try {
      await toggleStarMut.mutateAsync({ id, starred: !current });
    } catch (err) {
      toast({ title: 'Failed to update', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleDownload = async (item: VaultItem) => {
    if (!item.file_url) return;
    try {
      const response = await fetch(item.file_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Download failed', description: 'Could not download the file.', variant: 'destructive' });
    }
  };

  // ===== LOCK SCREEN =====
  if (!unlocked) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <FolderLock className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Unlock Your Vault</h1>
              <p className="text-sm text-muted-foreground mt-2 mb-6">
                Enter your passphrase to decrypt and access your stored items.
              </p>
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passphrase">Vault Passphrase</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="passphrase"
                      type="password"
                      value={passphrase}
                      onChange={(e) => {
                        setPassphrase(e.target.value);
                        setPassphraseError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                      className="pl-10"
                      placeholder="Enter your passphrase"
                      autoFocus
                    />
                  </div>
                  {passphraseError && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {passphraseError}
                    </p>
                  )}
                </div>
                <Button onClick={handleUnlock} className="w-full shadow-glow" size="lg">
                  <Lock className="mr-2 h-4 w-4" /> Unlock Vault
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  256-bit AES-GCM encryption
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ===== MAIN VAULT UI =====
  return (
    <div>
      <DashboardPageHeader
        title="Digital Vault"
        description="Your encrypted storage for all important digital assets."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFolderDialog(true)}>
              <Folder className="mr-2 h-4 w-4" /> New Folder
            </Button>
            <Button className="shadow-glow" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* ===== SIDEBAR ===== */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-1">
              <SidebarItem
                icon={FolderLock}
                label="All Items"
                count={itemsQ.data?.filter((i: VaultItem) => !i.deleted_at).length ?? 0}
                active={!showTrash && activeFolder === null}
                onClick={() => { setActiveFolder(null); setShowTrash(false); }}
              />
              <SidebarItem
                icon={Star}
                label="Starred"
                count={itemsQ.data?.filter((i: VaultItem) => !i.deleted_at && i.is_starred).length ?? 0}
                active={!showTrash && activeFolder === '__starred'}
                onClick={() => { setActiveFolder('__starred' as any); setShowTrash(false); }}
              />
              <Separator className="my-2" />
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground">Folders</div>
              {foldersQ.isLoading ? (
                <div className="space-y-1 px-3">
                  {[1, 2, 3].map((i: number) => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : foldersQ.data && foldersQ.data.length > 0 ? (
                foldersQ.data.map((folder: { id: string; name: string }) => (
                  <SidebarItem
                    key={folder.id}
                    icon={Folder}
                    label={folder.name}
                    count={folderCounts[folder.id] ?? 0}
                    active={!showTrash && activeFolder === folder.id}
                    onClick={() => { setActiveFolder(folder.id); setShowTrash(false); }}
                  />
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">No folders yet</p>
              )}
              <Separator className="my-2" />
              <SidebarItem
                icon={Trash2}
                label="Recycle Bin"
                count={itemsQ.data?.filter((i: VaultItem) => i.deleted_at).length ?? 0}
                active={showTrash}
                onClick={() => { setShowTrash(true); setActiveFolder(null); }}
                danger
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              Encrypted with AES-256-GCM
            </div>
            <div className="space-y-2">
              {Object.entries(ITEM_TYPES).map(([key, cfg]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <cfg.icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    <span className="text-muted-foreground">{cfg.label}</span>
                  </div>
                  <span className="font-medium">{typeCounts[key] ?? 0}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="space-y-4">
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, notes, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ItemType | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(ITEM_TYPES).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt: { value: string; label: string }) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          {(activeFolder || showTrash) && (
            <div className="flex items-center gap-2 text-sm">
              <Button variant="ghost" size="sm" onClick={() => { setActiveFolder(null); setShowTrash(false); }}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> All Items
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">
                {showTrash ? 'Recycle Bin' : activeFolder === '__starred' ? 'Starred' : foldersQ.data?.find((f: { id: string; name: string }) => f.id === activeFolder)?.name}
              </span>
            </div>
          )}

          {/* Items */}
          {itemsQ.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_: unknown, i: number) => (
                <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState showTrash={showTrash} onAdd={() => setShowAddDialog(true)} />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={i}
                  onPreview={() => handlePreview(item)}
                  onDelete={() => handleSoftDelete(item.id, item.title)}
                  onStar={() => handleToggleStar(item.id, item.is_starred)}
                  onDownload={() => handleDownload(item)}
                  onRestore={() => handleRestore(item.id)}
                  onPermanentDelete={() => handlePermanentDelete(item.id, item.title)}
                  showTrash={showTrash}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="divide-y divide-border/40">
                {filteredItems.map((item, i) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    index={i}
                    onPreview={() => handlePreview(item)}
                    onDelete={() => handleSoftDelete(item.id, item.title)}
                    onStar={() => handleToggleStar(item.id, item.is_starred)}
                    onDownload={() => handleDownload(item)}
                    onRestore={() => handleRestore(item.id)}
                    onPermanentDelete={() => handlePermanentDelete(item.id, item.title)}
                    showTrash={showTrash}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ===== ADD ITEM DIALOG ===== */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetAddForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vault Item</DialogTitle>
            <DialogDescription>Choose a type and fill in the details. Sensitive data is encrypted before saving.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Type Selection */}
            <div>
              <Label className="mb-2 block">Item Type</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {Object.entries(ITEM_TYPES).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => { setAddType(key as ItemType); setSensitiveFields({}); }}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                      addType === key
                        ? 'border-primary bg-primary/5 shadow-soft'
                        : 'border-border/60 hover:border-primary/30'
                    }`}
                  >
                    <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                    <span className="text-[11px] text-center leading-tight">{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add_title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="add_title"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  placeholder="My Bank Account"
                />
              </div>
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select value={addFolder} onValueChange={setAddFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="No folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No folder</SelectItem>
                    {foldersQ.data?.map((f: { id: string; name: string }) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sensitive Fields */}
            {ITEM_TYPES[addType].sensitiveFields && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Lock className="h-4 w-4 text-success" />
                  <span className="font-medium">Encrypted Fields</span>
                </div>
                {ITEM_TYPES[addType].sensitiveFields!.map((field: { key: string; label: string; placeholder: string; type?: 'text' | 'password' }) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label htmlFor={`field_${field.key}`}>{field.label}</Label>
                    <div className="relative">
                      <Input
                        id={`field_${field.key}`}
                        type={field.type === 'password' ? (showPasswordFields[field.key] ? 'text' : 'password') : 'text'}
                        value={sensitiveFields[field.key] || ''}
                        onChange={(e) => setSensitiveFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className={field.type === 'password' ? 'pr-10' : ''}
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPasswordFields((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPasswordFields[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload */}
            {ITEM_TYPES[addType].hasFile && (
              <div className="space-y-2">
                <Label>File Upload</Label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 p-6 cursor-pointer hover:border-primary/40 transition-colors">
                  {uploadFile ? (
                    <>
                      <Check className="h-6 w-6 text-success" />
                      <span className="text-sm font-medium">{uploadFile.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(uploadFile.size)}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload a file</span>
                      <span className="text-xs text-muted-foreground">Max 50 MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 50 * 1024 * 1024) {
                          toast({ title: 'File too large', description: 'Max file size is 50 MB.', variant: 'destructive' });
                          return;
                        }
                        setUploadFile(f);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {/* Notes + Tags */}
            <div className="space-y-2">
              <Label htmlFor="add_notes">Notes</Label>
              <Textarea
                id="add_notes"
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                placeholder="Optional notes about this item..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_tags">Tags</Label>
              <Input
                id="add_tags"
                value={addTags}
                onChange={(e) => setAddTags(e.target.value)}
                placeholder="comma, separated, tags"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetAddForm(); }}>Cancel</Button>
            <Button onClick={handleSaveItem} disabled={saving || uploading}>
              {saving || uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save to Vault'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== FOLDER DIALOG ===== */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="folder_name">Folder Name</Label>
            <Input
              id="folder_name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Important Documents"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || createFolderMut.isPending}>
              {createFolderMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PREVIEW DIALOG ===== */}
      <Dialog open={!!previewItem} onOpenChange={(open) => { if (!open) { setPreviewItem(null); setDecryptedData(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {previewItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const cfg = ITEM_TYPES[previewItem.item_type as ItemType] || ITEM_TYPES.document;
                    const Icon = cfg.icon;
                    return (
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.bgColor}`}>
                        <Icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                    );
                  })()}
                  <div>
                    <DialogTitle>{previewItem.title}</DialogTitle>
                    <DialogDescription>
                      {ITEM_TYPES[previewItem.item_type as ItemType]?.label || 'Item'} · {formatDate(previewItem.created_at)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* File preview */}
                {previewItem.file_url && previewItem.mime_type?.startsWith('image/') && (
                  <div className="rounded-lg overflow-hidden border border-border/60">
                    <img src={previewItem.file_url} alt={previewItem.title} className="w-full h-auto max-h-[400px] object-contain bg-muted/30" />
                  </div>
                )}
                {previewItem.file_url && previewItem.mime_type?.startsWith('video/') && (
                  <div className="rounded-lg overflow-hidden border border-border/60">
                    <video src={previewItem.file_url} controls className="w-full max-h-[400px]" />
                  </div>
                )}
                {previewItem.file_url && !previewItem.mime_type?.startsWith('image/') && !previewItem.mime_type?.startsWith('video/') && (
                  <div className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                    <File className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{previewItem.title}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(previewItem.file_size)} · {previewItem.mime_type}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(previewItem)}>
                      <Download className="mr-2 h-3.5 w-3.5" /> Download
                    </Button>
                  </div>
                )}

                {/* Decrypted sensitive data */}
                {previewItem.encrypted_data && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-success" />
                      <span className="font-medium">Encrypted Data</span>
                    </div>
                    {decrypting ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Decrypting...
                      </div>
                    ) : decryptedData ? (
                      <div className="space-y-2 rounded-lg border border-border/60 p-4 bg-muted/30">
                        {ITEM_TYPES[previewItem.item_type as ItemType]?.sensitiveFields?.map((field: { key: string; label: string; placeholder: string; type?: 'text' | 'password' }) => (
                          decryptedData[field.key] && (
                            <div key={field.key} className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground">{field.label}</span>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm font-mono bg-background px-2 py-1 rounded border border-border/60">
                                  {field.type === 'password' && !showPasswordFields[field.key]
                                    ? '•'.repeat(Math.min(decryptedData[field.key].length, 20))
                                    : decryptedData[field.key]}
                                </code>
                                <div className="flex gap-1">
                                  {field.type === 'password' && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7"
                                      onClick={() => setShowPasswordFields((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                                    >
                                      {showPasswordFields[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </Button>
                                  )}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      navigator.clipboard.writeText(decryptedData[field.key]);
                                      toast({ title: 'Copied', description: `${field.label} copied to clipboard.` });
                                    }}
                                  >
                                    <File className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Notes */}
                {previewItem.notes && (
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Notes</span>
                    <p className="text-sm text-muted-foreground rounded-lg border border-border/60 p-3 bg-muted/30">{previewItem.notes}</p>
                  </div>
                )}

                {/* Tags */}
                {previewItem.tags && previewItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {previewItem.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <Separator />
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>Created: {formatDate(previewItem.created_at)}</div>
                  <div>Size: {formatFileSize(previewItem.file_size)}</div>
                </div>
              </div>

              <DialogFooter>
                {showTrash ? (
                  <>
                    <Button variant="outline" onClick={() => handleRestore(previewItem.id)}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Restore
                    </Button>
                    <Button variant="destructive" onClick={() => handlePermanentDelete(previewItem.id, previewItem.title)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Forever
                    </Button>
                  </>
                ) : (
                  <>
                    {previewItem.file_url && (
                      <Button variant="outline" onClick={() => handleDownload(previewItem)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => { handleSoftDelete(previewItem.id, previewItem.title); setPreviewItem(null); }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Move to Recycle Bin
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

function SidebarItem({
  icon: Icon, label, count, active, onClick, danger,
}: {
  icon: typeof FolderLock; label: string; count: number; active: boolean; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? danger
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
          : 'hover:bg-muted/50 text-foreground'
      }`}
    >
      <Icon className={`h-4 w-4 ${danger && active ? 'text-destructive' : ''}`} />
      <span className="flex-1 text-left truncate">{label}</span>
      {count > 0 && (
        <span className={`text-xs ${active ? 'font-semibold' : 'text-muted-foreground'}`}>{count}</span>
      )}
    </button>
  );
}

function ItemCard({
  item, index, onPreview, onDelete, onStar, onDownload, onRestore, onPermanentDelete, showTrash,
}: {
  item: VaultItem; index: number; onPreview: () => void; onDelete: () => void; onStar: () => void;
  onDownload: () => void; onRestore: () => void; onPermanentDelete: () => void; showTrash: boolean;
}) {
  const cfg = ITEM_TYPES[item.item_type as ItemType] || ITEM_TYPES.document;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Card className="group relative p-4 hover:shadow-soft transition-all cursor-pointer overflow-hidden" >
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {!showTrash && (
            <button
              onClick={(e) => { e.stopPropagation(); onStar(); }}
              className="rounded-full p-1 hover:bg-muted/60 transition-colors"
            >
              <Star className={`h-3.5 w-3.5 ${item.is_starred ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="rounded-full p-1 hover:bg-muted/60 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onPreview}><Eye className="mr-2 h-3.5 w-3.5" /> Preview</DropdownMenuItem>
              {item.file_url && <DropdownMenuItem onClick={onDownload}><Download className="mr-2 h-3.5 w-3.5" /> Download</DropdownMenuItem>}
              {showTrash ? (
                <>
                  <DropdownMenuItem onClick={onRestore}><RotateCcw className="mr-2 h-3.5 w-3.5" /> Restore</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={onPermanentDelete}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Forever</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="text-destructive" onClick={onDelete}><Trash2 className="mr-2 h-3.5 w-3.5" /> Move to Recycle Bin</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div onClick={onPreview}>
          {/* Thumbnail or Icon */}
          <div className={`mb-3 flex h-20 items-center justify-center rounded-lg ${cfg.bgColor} overflow-hidden`}>
            {item.thumbnail_url ? (
              <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <Icon className={`h-8 w-8 ${cfg.color}`} />
            )}
          </div>

          <h3 className="text-sm font-medium truncate pr-6">{item.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatFileSize(item.file_size)}</span>
            <span>{formatDate(item.created_at)}</span>
          </div>

          {item.encrypted_data && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs text-success">
              <Lock className="h-3 w-3" /> Encrypted
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function ItemRow({
  item, index, onPreview, onDelete, onStar, onDownload, onRestore, onPermanentDelete, showTrash,
}: {
  item: VaultItem; index: number; onPreview: () => void; onDelete: () => void; onStar: () => void;
  onDownload: () => void; onRestore: () => void; onPermanentDelete: () => void; showTrash: boolean;
}) {
  const cfg = ITEM_TYPES[item.item_type as ItemType] || ITEM_TYPES.document;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.2) }}
      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
    >
      <button onClick={onPreview} className="flex flex-1 items-center gap-3 min-w-0 text-left">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.bgColor} shrink-0 overflow-hidden`}>
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <Icon className={`h-5 w-5 ${cfg.color}`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{item.title}</p>
            {item.encrypted_data && <Lock className="h-3 w-3 text-success shrink-0" />}
            {item.is_starred && !showTrash && <Star className="h-3 w-3 fill-warning text-warning shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground">{cfg.label} · {formatFileSize(item.file_size)} · {formatDate(item.created_at)}</p>
        </div>
      </button>

      <div className="flex items-center gap-1">
        {!showTrash && (
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onStar}>
            <Star className={`h-3.5 w-3.5 ${item.is_starred ? 'fill-warning text-warning' : ''}`} />
          </Button>
        )}
        {item.file_url && (
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDownload}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPreview}><Eye className="mr-2 h-3.5 w-3.5" /> Preview</DropdownMenuItem>
            {showTrash ? (
              <>
                <DropdownMenuItem onClick={onRestore}><RotateCcw className="mr-2 h-3.5 w-3.5" /> Restore</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={onPermanentDelete}><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Forever</DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="text-destructive" onClick={onDelete}><Trash2 className="mr-2 h-3.5 w-3.5" /> Move to Recycle Bin</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

function EmptyState({ showTrash, onAdd }: { showTrash: boolean; onAdd: () => void }) {
  return (
    <Card className="p-12 flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
        {showTrash ? <Trash2 className="h-8 w-8 text-muted-foreground" /> : <FolderLock className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold">{showTrash ? 'Recycle bin is empty' : 'Your vault is empty'}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {showTrash
          ? 'Deleted items will appear here. You can restore them or permanently delete them.'
          : 'Start adding passwords, documents, photos, and other important items to your secure vault.'}
      </p>
      {!showTrash && (
        <Button className="mt-4 shadow-glow" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Your First Item
        </Button>
      )}
    </Card>
  );
}
