'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, MoreVertical, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Instruction {
  id: string;
  title: string;
  priority: string;
  status: string;
  desc: string;
}

const INITIAL_INSTRUCTIONS: Instruction[] = [
  { id: '1', title: 'Contact my attorney James Chen', priority: 'High', status: 'Completed', desc: 'He has my full will and estate documents. Phone: +1 (555) 345-6789' },
  { id: '2', title: 'Notify my sister Sarah first', priority: 'High', status: 'Active', desc: 'She is my primary emotional support contact. Phone: +1 (555) 234-5678' },
  { id: '3', title: 'Access my Digital Vault', priority: 'High', status: 'Active', desc: 'All passwords and account access are in LegacyVault. Recovery key is in the safe deposit box.' },
  { id: '4', title: 'Cancel my subscriptions', priority: 'Medium', status: 'Active', desc: 'See the Subscriptions page for a full list. Cancel Netflix, Spotify, and gym membership.' },
  { id: '5', title: 'Memorialize my social media', priority: 'Medium', status: 'Active', desc: 'Facebook and Instagram should be memorialized. See Social Accounts page for details.' },
  { id: '6', title: 'Distribute photos to family', priority: 'Low', status: 'Active', desc: 'Share the Family Memories album with all trusted family members.' },
  { id: '7', title: 'Pay outstanding bills', priority: 'Medium', status: 'Completed', desc: 'Check my bank account for any autopay bills that need to be settled.' },
];

export default function EmergencyInstructionsPage() {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('High');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_instructions');
    if (raw) {
      try {
        setInstructions(JSON.parse(raw));
        return;
      } catch {}
    }
    setInstructions(INITIAL_INSTRUCTIONS);
    localStorage.setItem('legacy_instructions', JSON.stringify(INITIAL_INSTRUCTIONS));
  }, []);

  const saveInstructions = (newI: Instruction[]) => {
    setInstructions(newI);
    localStorage.setItem('legacy_instructions', JSON.stringify(newI));
  };

  const handleAddInstruction = () => {
    if (!title) return;
    const newInst: Instruction = {
      id: Date.now().toString(),
      title,
      priority: priority || 'High',
      status: 'Active',
      desc: desc || 'Instruction for trusted contacts.',
    };
    saveInstructions([newInst, ...instructions]);
    setShowAddDialog(false);
    setTitle('');
    setDesc('');
  };

  const handleDelete = (id: string) => {
    saveInstructions(instructions.filter((i) => i.id !== id));
  };

  const toggleStatus = (id: string) => {
    const updated = instructions.map((item) => {
      if (item.id === id) {
        return { ...item, status: item.status === 'Completed' ? 'Active' : 'Completed' };
      }
      return item;
    });
    saveInstructions(updated);
  };

  return (
    <div>
      <DashboardPageHeader
        title="Emergency Instructions"
        description="Leave clear, step-by-step guidance for your trusted contacts."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Instruction
          </Button>
        }
      />

      <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">How it works</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted contacts will see these instructions when they access your vault. Order them by priority — the most important steps should be at the top.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {instructions.map((inst, i) => (
          <motion.div
            key={inst.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="group p-5 hover:shadow-soft transition-all">
              <div className="flex items-start gap-4">
                <button onClick={() => toggleStatus(inst.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                  {inst.status === 'Completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className={`font-semibold ${inst.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {inst.title}
                    </p>
                    <Badge className={inst.priority === 'High' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'} variant="secondary">
                      {inst.priority}
                    </Badge>
                    <Badge className={inst.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'} variant="secondary">
                      {inst.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{inst.desc}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(inst.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Emergency Instruction</DialogTitle>
            <DialogDescription>Create a step-by-step guidance item for your family or lawyer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Instruction Title</Label>
              <Input placeholder="e.g. Notify attorney, Cancel subscriptions..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Priority Level</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
            <div>
              <Label>Description / Detailed Steps</Label>
              <Textarea placeholder="Explain what needs to be done..." value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddInstruction} disabled={!title}>Save Instruction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
