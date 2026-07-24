'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Plus, Trash2, MoreVertical, Shield, FileText } from 'lucide-react';
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

interface Policy {
  id: string;
  type: string;
  provider: string;
  policyNo: string;
  coverage: string;
  premium: string;
  status: string;
  beneficiary: string;
}

const INITIAL_POLICIES: Policy[] = [
  { id: '1', type: 'Life Insurance', provider: 'MetLife', policyNo: 'ML-2024-789456', coverage: '$500,000', premium: '$85/mo', status: 'Active', beneficiary: 'David Kim' },
  { id: '2', type: 'Health Insurance', provider: 'Blue Cross Blue Shield', policyNo: 'BCBS-554123', coverage: '$1M lifetime', premium: '$420/mo', status: 'Active', beneficiary: 'Self' },
  { id: '3', type: 'Auto Insurance', provider: 'Geico', policyNo: 'GEICO-998473', coverage: '$250K/$500K', premium: '$110/mo', status: 'Active', beneficiary: 'Self' },
  { id: '4', type: 'Home Insurance', provider: 'State Farm', policyNo: 'SF-445678', coverage: '$750,000', premium: '$145/mo', status: 'Active', beneficiary: 'Self' },
  { id: '5', type: 'Disability Insurance', provider: 'Northwestern Mutual', policyNo: 'NM-332100', coverage: '$4,000/mo', premium: '$65/mo', status: 'Active', beneficiary: 'Self' },
  { id: '6', type: 'Long-term Care', provider: 'Genworth', policyNo: 'GW-776543', coverage: '$200/day', premium: '$180/mo', status: 'Lapsed', beneficiary: 'Self' },
];

export default function InsuranceDetailsPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [type, setType] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNo, setPolicyNo] = useState('');
  const [coverage, setCoverage] = useState('');
  const [premium, setPremium] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_insurance_policies');
    if (raw) {
      try {
        setPolicies(JSON.parse(raw));
        return;
      } catch {}
    }
    setPolicies(INITIAL_POLICIES);
    localStorage.setItem('legacy_insurance_policies', JSON.stringify(INITIAL_POLICIES));
  }, []);

  const savePolicies = (newP: Policy[]) => {
    setPolicies(newP);
    localStorage.setItem('legacy_insurance_policies', JSON.stringify(newP));
  };

  const handleAddPolicy = () => {
    if (!type || !provider) return;
    const newPol: Policy = {
      id: Date.now().toString(),
      type,
      provider,
      policyNo: policyNo || `POL-${Math.floor(Math.random() * 899999 + 100000)}`,
      coverage: coverage || '$100,000',
      premium: premium || '$50/mo',
      status: 'Active',
      beneficiary: 'Self',
    };
    savePolicies([newPol, ...policies]);
    setShowAddDialog(false);
    setType('');
    setProvider('');
    setPolicyNo('');
    setCoverage('');
    setPremium('');
  };

  const handleDelete = (id: string) => {
    savePolicies(policies.filter((p) => p.id !== id));
  };

  return (
    <div>
      <DashboardPageHeader
        title="Insurance Details"
        description="Track your insurance policies and coverage information."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Policy
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Policies', value: policies.length.toString(), icon: Shield, color: 'text-primary' },
          { label: 'Active', value: policies.filter(p => p.status === 'Active').length.toString(), icon: Shield, color: 'text-success' },
          { label: 'Monthly Premiums', value: '$1,005', icon: Building2, color: 'text-chart-3' },
          { label: 'Total Coverage', value: '$2.5M+', icon: FileText, color: 'text-chart-2' },
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

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="text-left p-4 text-sm font-semibold">Type</th>
                <th className="text-left p-4 text-sm font-semibold">Provider</th>
                <th className="text-left p-4 text-sm font-semibold hidden sm:table-cell">Policy #</th>
                <th className="text-left p-4 text-sm font-semibold hidden md:table-cell">Coverage</th>
                <th className="text-left p-4 text-sm font-semibold hidden lg:table-cell">Premium</th>
                <th className="text-left p-4 text-sm font-semibold">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy, i) => (
                <motion.tr
                  key={policy.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{policy.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{policy.provider}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{policy.policyNo}</td>
                  <td className="p-4 text-sm hidden md:table-cell">{policy.coverage}</td>
                  <td className="p-4 text-sm hidden lg:table-cell">{policy.premium}</td>
                  <td className="p-4">
                    <Badge className={policy.status === 'Active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'} variant="secondary">
                      {policy.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(policy.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Insurance Policy</DialogTitle>
            <DialogDescription>Record a new health, life, home, or auto insurance policy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Policy Type</Label>
              <Input placeholder="Life, Health, Auto, Home..." value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <Label>Provider / Company</Label>
              <Input placeholder="e.g. Geico, MetLife, Blue Cross" value={provider} onChange={(e) => setProvider(e.target.value)} />
            </div>
            <div>
              <Label>Policy Number</Label>
              <Input placeholder="e.g. POL-998877" value={policyNo} onChange={(e) => setPolicyNo(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Coverage Amount</Label>
                <Input placeholder="e.g. $500,000" value={coverage} onChange={(e) => setCoverage(e.target.value)} />
              </div>
              <div>
                <Label>Monthly Premium</Label>
                <Input placeholder="e.g. $85/mo" value={premium} onChange={(e) => setPremium(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPolicy} disabled={!type || !provider}>Save Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
