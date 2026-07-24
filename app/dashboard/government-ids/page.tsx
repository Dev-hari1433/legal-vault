'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IdCard, Plus, Edit, Trash2, MoreVertical, ShieldCheck, Clock, Download, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GovID {
  id: string;
  type: string;
  number: string;
  issuer: string;
  issueDate: string;
  expiry: string;
  status: string;
  verified: boolean;
  fileUrl?: string;
}

const INITIAL_IDS: GovID[] = [
  { id: '1', type: 'Passport', number: '•••••• 7841', issuer: 'US Department of State', issueDate: 'Mar 2022', expiry: 'Mar 2032', status: 'Valid', verified: true },
  { id: '2', type: 'Driver License', number: '•••••• 4521', issuer: 'California DMV', issueDate: 'Jan 2021', expiry: 'Jan 2026', status: 'Valid', verified: true },
  { id: '3', type: 'Social Security Card', number: '•••-••-4421', issuer: 'SSA', issueDate: '—', expiry: 'Never', status: 'Valid', verified: true },
  { id: '4', type: 'Birth Certificate', number: 'BC-998472', issuer: 'State of California', issueDate: 'Mar 1985', expiry: 'Never', status: 'Valid', verified: false },
  { id: '5', type: 'Medicare Card', number: '•••-••-••••-A', issuer: 'CMS', issueDate: 'Jan 2023', expiry: '—', status: 'Valid', verified: true },
  { id: '6', type: 'Voter Registration', number: 'VR-445127', issuer: 'California SOS', issueDate: 'Sep 2020', expiry: '—', status: 'Valid', verified: false },
];

export default function GovernmentIDsPage() {
  const [ids, setIds] = useState<GovID[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [type, setType] = useState('');
  const [number, setNumber] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('legacy_gov_ids');
    if (raw) {
      try {
        setIds(JSON.parse(raw));
        return;
      } catch {}
    }
    setIds(INITIAL_IDS);
    localStorage.setItem('legacy_gov_ids', JSON.stringify(INITIAL_IDS));
  }, []);

  const saveIds = (newIds: GovID[]) => {
    setIds(newIds);
    localStorage.setItem('legacy_gov_ids', JSON.stringify(newIds));
  };

  const handleAddId = () => {
    if (!type || !number) return;
    let fileUrl = undefined;
    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
    }
    const newIdObj: GovID = {
      id: Date.now().toString(),
      type,
      number,
      issuer: issuer || 'State Department',
      issueDate: issueDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      expiry: expiry || 'Never',
      status: 'Valid',
      verified: true,
      fileUrl,
    };
    saveIds([newIdObj, ...ids]);
    setShowAddDialog(false);
    setType('');
    setNumber('');
    setIssuer('');
    setIssueDate('');
    setExpiry('');
    setSelectedFile(null);
  };

  const handleDelete = (id: string) => {
    saveIds(ids.filter((item) => item.id !== id));
  };

  return (
    <div>
      <DashboardPageHeader
        title="Government IDs"
        description="Securely store copies of your identification documents."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add ID
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ids.map((id, i) => (
          <motion.div
            key={id.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <IdCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  {id.verified ? (
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-warning/10 text-warning">
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {id.fileUrl && (
                        <DropdownMenuItem asChild>
                          <a href={id.fileUrl} target="_blank" rel="noreferrer">
                            <Download className="mr-2 h-4 w-4" /> View Document
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(id.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="font-semibold mb-1">{id.type}</p>
              <p className="text-sm text-muted-foreground mb-3">{id.number}</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Issuer:</span> {id.issuer}</p>
                <p><span className="font-medium text-foreground">Issued:</span> {id.issueDate}</p>
                <p><span className="font-medium text-foreground">Expires:</span> {id.expiry}</p>
              </div>
              <Badge className="mt-3 bg-success/10 text-success" variant="secondary">{id.status}</Badge>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Government ID</DialogTitle>
            <DialogDescription>Store a copy of an identity card or passport document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Document Type</Label>
              <Input placeholder="Passport, Driver's License, National ID..." value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <Label>Document / ID Number</Label>
              <Input placeholder="e.g. A987654321" value={number} onChange={(e) => setNumber(e.target.value)} />
            </div>
            <div>
              <Label>Issuing Authority / State</Label>
              <Input placeholder="e.g. Department of State, DMV" value={issuer} onChange={(e) => setIssuer(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Issue Date</Label>
                <Input placeholder="e.g. Mar 2023" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input placeholder="e.g. Mar 2033" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Attach ID Scan / Photo (Optional)</Label>
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddId} disabled={!type || !number}>Save ID</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
