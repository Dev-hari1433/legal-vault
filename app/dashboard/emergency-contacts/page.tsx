'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Siren, Plus, Phone, Mail, MoreVertical, Trash2 } from 'lucide-react';
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

interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  priority: string;
  avatar?: string;
}

const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'Dr. Michael Reeves', relation: 'Primary Physician', phone: '+1 (555) 123-4567', email: 'mreeves@hospital.com', priority: 'Primary', avatar: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: '2', name: 'Sarah Mitchell', relation: 'Sister', phone: '+1 (555) 234-5678', email: 'sarah.m@email.com', priority: 'Secondary', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: '3', name: 'James Chen', relation: 'Estate Attorney', phone: '+1 (555) 345-6789', email: 'jchen@lawfirm.com', priority: 'Legal', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150' },
  { id: '4', name: 'Maria Santos', relation: 'Neighbor', phone: '+1 (555) 456-7890', email: 'maria.s@email.com', priority: 'Emergency', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150' },
];

const priorityColors: Record<string, string> = {
  Primary: 'bg-primary/10 text-primary',
  Secondary: 'bg-chart-2/10 text-chart-2',
  Legal: 'bg-chart-3/10 text-chart-3',
  Emergency: 'bg-destructive/10 text-destructive',
};

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState('Primary');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_emergency_contacts');
    if (raw) {
      try {
        setContacts(JSON.parse(raw));
        return;
      } catch {}
    }
    setContacts(INITIAL_CONTACTS);
    localStorage.setItem('legacy_emergency_contacts', JSON.stringify(INITIAL_CONTACTS));
  }, []);

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('legacy_emergency_contacts', JSON.stringify(newContacts));
  };

  const handleAddContact = () => {
    if (!name || !phone) return;
    const newC: Contact = {
      id: Date.now().toString(),
      name,
      relation: relation || 'Contact',
      phone,
      email: email || 'contact@example.com',
      priority: priority || 'Primary',
    };
    saveContacts([newC, ...contacts]);
    setShowAddDialog(false);
    setName('');
    setRelation('');
    setPhone('');
    setEmail('');
  };

  const handleDelete = (id: string) => {
    saveContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div>
      <DashboardPageHeader
        title="Emergency Contacts"
        description="People who should be contacted in case of an emergency."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        }
      />

      <Card className="p-6 mb-6 bg-gradient-to-br from-destructive/5 to-transparent border-destructive/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
            <Siren className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Emergency Ready</h3>
            <p className="text-sm text-muted-foreground">
              These contacts will be immediately accessible to first responders and your trusted family members. Keep this list updated.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact, i) => (
          <motion.div
            key={contact.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group p-5 hover:shadow-soft transition-all">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.relation}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(contact.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {contact.phone}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {contact.email}
                    </p>
                  </div>
                  <Badge className={`mt-3 ${priorityColors[contact.priority] || 'bg-primary/10 text-primary'}`} variant="secondary">
                    {contact.priority}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Emergency Contact</DialogTitle>
            <DialogDescription>Add a person who should be notified during an emergency.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="e.g. Sarah Jenkins" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Relationship</Label>
              <Input placeholder="e.g. Spouse, Brother, Doctor" value={relation} onChange={(e) => setRelation(e.target.value)} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input placeholder="e.g. +1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input placeholder="e.g. sarah@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddContact} disabled={!name || !phone}>Save Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
