'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, MoreVertical, Calendar, DollarSign } from 'lucide-react';
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

interface Subscription {
  id: string;
  name: string;
  category: string;
  cost: number;
  cycle: string;
  next: string;
  status: string;
}

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', category: 'Entertainment', cost: 15.99, cycle: 'Monthly', next: 'Feb 1, 2026', status: 'Active' },
  { id: '2', name: 'Spotify Premium', category: 'Music', cost: 9.99, cycle: 'Monthly', next: 'Feb 3, 2026', status: 'Active' },
  { id: '3', name: 'Amazon Prime', category: 'Shopping', cost: 139.00, cycle: 'Yearly', next: 'Aug 15, 2026', status: 'Active' },
  { id: '4', name: 'iCloud Storage', category: 'Cloud', cost: 2.99, cycle: 'Monthly', next: 'Feb 5, 2026', status: 'Active' },
  { id: '5', name: 'NY Times', category: 'News', cost: 17.00, cycle: 'Monthly', next: 'Feb 10, 2026', status: 'Active' },
  { id: '6', name: 'Gym Membership', category: 'Health', cost: 49.99, cycle: 'Monthly', next: 'Feb 12, 2026', status: 'Active' },
  { id: '7', name: 'Adobe Creative Cloud', category: 'Software', cost: 54.99, cycle: 'Monthly', next: 'Feb 8, 2026', status: 'Active' },
  { id: '8', name: 'LinkedIn Premium', category: 'Professional', cost: 39.99, cycle: 'Monthly', next: 'Feb 20, 2026', status: 'Cancelled' },
];

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [cycle, setCycle] = useState('Monthly');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_subscriptions');
    if (raw) {
      try {
        setSubs(JSON.parse(raw));
        return;
      } catch {}
    }
    setSubs(INITIAL_SUBSCRIPTIONS);
    localStorage.setItem('legacy_subscriptions', JSON.stringify(INITIAL_SUBSCRIPTIONS));
  }, []);

  const saveSubs = (newSubs: Subscription[]) => {
    setSubs(newSubs);
    localStorage.setItem('legacy_subscriptions', JSON.stringify(newSubs));
  };

  const handleAddSub = () => {
    if (!name || !cost) return;
    const newS: Subscription = {
      id: Date.now().toString(),
      name,
      category: category || 'General',
      cost: parseFloat(cost) || 9.99,
      cycle: cycle || 'Monthly',
      next: 'Next month',
      status: 'Active',
    };
    saveSubs([newS, ...subs]);
    setShowAddDialog(false);
    setName('');
    setCategory('');
    setCost('');
  };

  const handleDelete = (id: string) => {
    saveSubs(subs.filter((s) => s.id !== id));
  };

  const monthlyTotal = subs
    .filter(s => s.status === 'Active')
    .reduce((sum, s) => sum + (s.cycle === 'Monthly' ? s.cost : s.cost / 12), 0);

  return (
    <div>
      <DashboardPageHeader
        title="Subscriptions"
        description="Track recurring payments and manage your subscriptions."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Subscription
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Subscriptions', value: subs.filter(s => s.status === 'Active').length.toString(), icon: CreditCard, color: 'text-primary' },
          { label: 'Monthly Cost', value: `$${monthlyTotal.toFixed(2)}`, icon: DollarSign, color: 'text-chart-2' },
          { label: 'Yearly Cost', value: `$${(monthlyTotal * 12).toFixed(0)}`, icon: Calendar, color: 'text-chart-3' },
          { label: 'Cancelled', value: subs.filter(s => s.status === 'Cancelled').length.toString(), icon: CreditCard, color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subs.map((sub, i) => (
          <motion.div
            key={sub.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="group p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{sub.name}</p>
                    <p className="text-xs text-muted-foreground">{sub.category}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(sub.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Cancel & Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">${sub.cost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{sub.cycle}</p>
                </div>
                <div className="text-right">
                  <Badge className={sub.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'} variant="secondary">
                    {sub.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Next: {sub.next}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Subscription</DialogTitle>
            <DialogDescription>Track a new recurring streaming service or utility payment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Subscription Name</Label>
              <Input placeholder="e.g. Netflix, Spotify, Gym" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Input placeholder="Entertainment, Software, Health..." value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Cost ($)</Label>
                <Input placeholder="e.g. 14.99" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
              <div>
                <Label>Billing Cycle</Label>
                <Input placeholder="Monthly / Yearly" value={cycle} onChange={(e) => setCycle(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSub} disabled={!name || !cost}>Save Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
