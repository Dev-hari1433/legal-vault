'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Plus, Search, MoreVertical, Download, Trash2,
  File, FileCheck, FileSignature, Lock, Upload, Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocItem {
  id: string;
  name: string;
  category: string;
  size: string;
  date: string;
  verified: boolean;
  fileDataUrl?: string;
}

const INITIAL_DOCUMENTS: DocItem[] = [
  { id: '1', name: 'Last Will & Testament.pdf', category: 'Legal', size: '2.4 MB', date: 'Jan 15, 2026', verified: true },
  { id: '2', name: 'Birth Certificate.pdf', category: 'Personal', size: '1.2 MB', date: 'Jan 12, 2026', verified: true },
  { id: '3', name: 'Marriage Certificate.pdf', category: 'Personal', size: '890 KB', date: 'Jan 10, 2026', verified: true },
  { id: '4', name: 'Property Deed.pdf', category: 'Property', size: '3.1 MB', date: 'Jan 5, 2026', verified: false },
  { id: '5', name: 'Tax Return 2024.pdf', category: 'Financial', size: '1.8 MB', date: 'Dec 28, 2025', verified: false },
  { id: '6', name: 'Power of Attorney.pdf', category: 'Legal', size: '1.5 MB', date: 'Dec 20, 2025', verified: true },
  { id: '7', name: 'Medical Records.pdf', category: 'Medical', size: '4.2 MB', date: 'Dec 15, 2025', verified: false },
  { id: '8', name: 'Insurance Policy.pdf', category: 'Insurance', size: '2.1 MB', date: 'Dec 10, 2025', verified: true },
];

const categories = ['All', 'Legal', 'Personal', 'Financial', 'Medical', 'Insurance', 'Property'];

export default function DocumentVaultPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Legal');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('legacy_document_vault');
    if (raw) {
      try {
        setDocuments(JSON.parse(raw));
        return;
      } catch {}
    }
    setDocuments(INITIAL_DOCUMENTS);
    localStorage.setItem('legacy_document_vault', JSON.stringify(INITIAL_DOCUMENTS));
  }, []);

  const saveDocs = (newDocs: DocItem[]) => {
    setDocuments(newDocs);
    localStorage.setItem('legacy_document_vault', JSON.stringify(newDocs));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name);
      }
    }
  };

  const handleUpload = () => {
    if (!docName) return;

    let fileDataUrl = undefined;
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newDoc: DocItem = {
          id: Date.now().toString(),
          name: docName.endsWith('.pdf') || docName.includes('.') ? docName : `${docName}.pdf`,
          category: docCategory,
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          verified: true,
          fileDataUrl: url,
        };
        saveDocs([newDoc, ...documents]);
        resetForm();
      };
      reader.readAsDataURL(selectedFile);
      return;
    }

    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: docName.endsWith('.pdf') || docName.includes('.') ? docName : `${docName}.pdf`,
      category: docCategory,
      size: '1.5 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: true,
    };
    saveDocs([newDoc, ...documents]);
    resetForm();
  };

  const resetForm = () => {
    setShowUploadDialog(false);
    setDocName('');
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    saveDocs(documents.filter((d) => d.id !== id));
  };

  const filtered = documents.filter((d) => {
    const matchesCat = activeCategory === 'All' || d.category === activeCategory;
    const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div>
      <DashboardPageHeader
        title="Document Vault"
        description="Store, organize, and share your important documents securely."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => (
          <motion.div
            key={doc.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="group p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {doc.fileDataUrl ? (
                      <DropdownMenuItem asChild>
                        <a href={doc.fileDataUrl} download={doc.name}>
                          <Download className="mr-2 h-4 w-4" /> Download File
                        </a>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => alert(`Downloading sample ${doc.name}`)}>
                        <Download className="mr-2 h-4 w-4" /> Download Sample
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="font-medium text-sm mb-1 truncate">{doc.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{doc.category}</span>
                <span>·</span>
                <span>{doc.size}</span>
                <span>·</span>
                <span>{doc.date}</span>
              </div>
              {doc.verified && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-success">
                  <Lock className="h-3 w-3" /> Verified & Encrypted
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Store a file securely in your Document Vault.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Document Category</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Document Title</Label>
              <Input placeholder="e.g. Passport_Scan.pdf, House_Deed.pdf" value={docName} onChange={(e) => setDocName(e.target.value)} />
            </div>
            <div>
              <Label>Select File</Label>
              <Input type="file" onChange={handleFileChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!docName}>Upload to Vault</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
