'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, Trash2, MoreVertical, TrendingUp, Landmark, PieChart, DollarSign } from 'lucide-react';
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

interface Account {
  id: string;
  name: string;
  type: string;
  institution: string;
  balance: string;
  number: string;
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Chase Checking', type: 'Bank Account', institution: 'Chase Bank', balance: '$24,580', number: '•••• 4521' },
  { id: '2', name: 'Fidelity Brokerage', type: 'Investment', institution: 'Fidelity', balance: '$187,200', number: '•••• 8830' },
  { id: '3', name: 'Vanguard 401(k)', type: 'Retirement', institution: 'Vanguard', balance: '$342,100', number: '•••• 2245' },
  { id: '4', name: 'Marcus Savings', type: 'Savings', institution: 'Goldman Sachs', balance: '$52,000', number: '•••• 7712' },
  { id: '5', name: 'Rental Property', type: 'Real Estate', institution: '—', balance: '$450,000', number: '123 Oak St' },
  { id: '6', name: 'Tesla Stock', type: 'Stock', institution: 'Robinhood', balance: '$18,750', number: 'TSLA × 75' },
  { id: '7', name: 'Crypto Wallet', type: 'Cryptocurrency', institution: 'Coinbase', balance: '$12,300', number: '0x7a...3f2b' },
  { id: '8', name: 'Art Collection', type: 'Personal Property', institution: '—', balance: '$35,000', number: '5 pieces' },
];

export default function FinancialAssetsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [number, setNumber] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_financial_accounts');
    if (raw) {
      try {
        setAccounts(JSON.parse(raw));
        return;
      } catch {}
    }
    setAccounts(INITIAL_ACCOUNTS);
    localStorage.setItem('legacy_financial_accounts', JSON.stringify(INITIAL_ACCOUNTS));
  }, []);

  const saveAccounts = (newAccs: Account[]) => {
    setAccounts(newAccs);
    localStorage.setItem('legacy_financial_accounts', JSON.stringify(newAccs));
  };

  const handleAddAsset = () => {
    if (!name || !balance) return;
    const newAcc: Account = {
      id: Date.now().toString(),
      name,
      type: type || 'Bank Account',
      institution: institution || 'Bank',
      balance: balance.startsWith('$') ? balance : `$${balance}`,
      number: number || `•••• ${Math.floor(Math.random() * 8999 + 1000)}`,
    };
    saveAccounts([newAcc, ...accounts]);
    setShowAddDialog(false);
    setName('');
    setType('');
    setInstitution('');
    setBalance('');
    setNumber('');
  };

  const handleDelete = (id: string) => {
    saveAccounts(accounts.filter((a) => a.id !== id));
  };

  const total = accounts.reduce((sum, a) => {
    const val = parseFloat(a.balance.replace(/[$,]/g, ''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div>
      <DashboardPageHeader
        title="Financial Assets"
        description="Track your accounts, investments, and property."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Net Worth', value: `$${(total / 1000).toFixed(0)}K`, icon: Wallet, color: 'text-primary' },
          { label: 'Total Accounts', value: accounts.length.toString(), icon: Landmark, color: 'text-chart-2' },
          { label: 'Investments', value: '$548K', icon: TrendingUp, color: 'text-chart-3' },
          { label: 'Real Estate', value: '$450K', icon: DollarSign, color: 'text-chart-4' },
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
        {accounts.map((account, i) => (
          <motion.div
            key={account.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="group p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(account.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="font-semibold">{account.name}</p>
              <p className="text-sm text-muted-foreground mb-3">{account.type}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-bold">{account.balance}</p>
                  <p className="text-xs text-muted-foreground">{account.number}</p>
                </div>
                {account.institution !== '—' && (
                  <p className="text-xs text-muted-foreground">{account.institution}</p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Financial Asset</DialogTitle>
            <DialogDescription>Track a bank account, stock, real estate, or investment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Asset Name</Label>
              <Input placeholder="e.g. Chase Savings, Rental Property" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Asset Type</Label>
              <Input placeholder="Bank Account, Stock, Real Estate..." value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <Label>Financial Institution / Location</Label>
              <Input placeholder="e.g. Chase Bank, Fidelity, Vanguard" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Value / Balance ($)</Label>
                <Input placeholder="e.g. $25,000" value={balance} onChange={(e) => setBalance(e.target.value)} />
              </div>
              <div>
                <Label>Account / Tag #</Label>
                <Input placeholder="e.g. •••• 1234" value={number} onChange={(e) => setNumber(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddAsset} disabled={!name || !balance}>Save Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
