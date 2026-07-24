'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, MoreVertical, Trash2, Shield, Clock, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  access: string;
  status: string;
  delay: string;
  avatar?: string;
}

const INITIAL_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Sarah Mitchell', relation: 'Sister', email: 'sarah.m@email.com', access: 'Full Vault', status: 'Active', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150', delay: 'Immediate' },
  { id: '2', name: 'David Kim', relation: 'Spouse', email: 'david.k@email.com', access: 'Full Vault', status: 'Active', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', delay: 'Immediate' },
  { id: '3', name: 'Marcus Williams', relation: 'Son', email: 'marcus.w@email.com', access: 'Photos & Documents', status: 'Pending', avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150', delay: '30 days' },
  { id: '4', name: 'Elena Rossi', relation: 'Mother', email: 'elena.r@email.com', access: 'Medical Only', status: 'Active', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150', delay: 'Immediate' },
  { id: '5', name: 'James Chen', relation: 'Attorney', email: 'jchen@lawfirm.com', access: 'Digital Will', status: 'Active', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150', delay: 'Upon verification' },
];

export default function TrustedFamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');
  const [access, setAccess] = useState('Full Vault');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_trusted_family');
    if (raw) {
      try {
        setMembers(JSON.parse(raw));
        return;
      } catch {}
    }
    setMembers(INITIAL_MEMBERS);
    localStorage.setItem('legacy_trusted_family', JSON.stringify(INITIAL_MEMBERS));
  }, []);

  const saveMembers = (newM: FamilyMember[]) => {
    setMembers(newM);
    localStorage.setItem('legacy_trusted_family', JSON.stringify(newM));
  };

  const handleAddMember = () => {
    if (!name || !email) return;
    const newMem: FamilyMember = {
      id: Date.now().toString(),
      name,
      relation: relation || 'Family',
      email,
      access: access || 'Full Vault',
      status: 'Active',
      delay: 'Immediate',
    };
    saveMembers([newMem, ...members]);
    setShowAddDialog(false);
    setName('');
    setRelation('');
    setEmail('');
  };

  const handleDelete = (id: string) => {
    saveMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div>
      <DashboardPageHeader
        title="Trusted Family Members"
        description="Manage who can access your vault and what they can see."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Members', value: members.length.toString(), icon: Users, color: 'text-primary' },
          { label: 'Active', value: members.filter(m => m.status === 'Active').length.toString(), icon: Shield, color: 'text-success' },
          { label: 'Pending', value: members.filter(m => m.status === 'Pending').length.toString(), icon: Clock, color: 'text-warning' },
          { label: 'Avg. Access Level', value: '70%', icon: Eye, color: 'text-chart-4' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        {members.map((member, i) => (
          <motion.div
            key={member.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group p-5 hover:shadow-soft transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.relation} · {member.email}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.access}</Badge>
                    <Badge className={member.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'} variant="secondary">
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Access: {member.delay}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
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
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogDescription>Grant vault access or emergency notification rights to a relative.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="e.g. David Kim" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input placeholder="e.g. Spouse, Son, Sister" value={relation} onChange={(e) => setRelation(e.target.value)} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input placeholder="e.g. david@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Access Permission</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={access}
                onChange={(e) => setAccess(e.target.value)}
              >
                <option value="Full Vault">Full Vault Access</option>
                <option value="Photos & Documents">Photos & Documents Only</option>
                <option value="Medical Only">Medical Records Only</option>
                <option value="Digital Will">Digital Will Only</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!name || !email}>Save Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
