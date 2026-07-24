'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Plus, Trash2, MoreVertical, Globe, Lock } from 'lucide-react';
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

interface SocialAcc {
  id: string;
  platform: string;
  handle: string;
  followers: string;
  status: string;
}

const INITIAL_SOCIALS: SocialAcc[] = [
  { id: '1', platform: 'Facebook', handle: '@jane.doe', followers: '1.2K', status: 'Active' },
  { id: '2', platform: 'Instagram', handle: '@jane.doe.photos', followers: '3.4K', status: 'Active' },
  { id: '3', platform: 'Twitter / X', handle: '@janed', followers: '890', status: 'Active' },
  { id: '4', platform: 'LinkedIn', handle: 'Jane Doe', followers: '2.1K', status: 'Active' },
  { id: '5', platform: 'YouTube', handle: '@JaneDoeChannel', followers: '5.6K', status: 'Active' },
  { id: '6', platform: 'TikTok', handle: '@jane.doe', followers: '12K', status: 'Active' },
  { id: '7', platform: 'Pinterest', handle: '@janedoe', followers: '450', status: 'Active' },
  { id: '8', platform: 'Reddit', handle: 'u/janedoe123', followers: '230', status: 'Inactive' },
];

export default function SocialAccountsPage() {
  const [socials, setSocials] = useState<SocialAcc[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [platform, setPlatform] = useState('');
  const [handle, setHandle] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('legacy_social_accounts');
    if (raw) {
      try {
        setSocials(JSON.parse(raw));
        return;
      } catch {}
    }
    setSocials(INITIAL_SOCIALS);
    localStorage.setItem('legacy_social_accounts', JSON.stringify(INITIAL_SOCIALS));
  }, []);

  const saveSocials = (newS: SocialAcc[]) => {
    setSocials(newS);
    localStorage.setItem('legacy_social_accounts', JSON.stringify(newS));
  };

  const handleAddSocial = () => {
    if (!platform || !handle) return;
    const newSoc: SocialAcc = {
      id: Date.now().toString(),
      platform,
      handle: handle.startsWith('@') || handle.startsWith('u/') ? handle : `@${handle}`,
      followers: '0',
      status: 'Active',
    };
    saveSocials([newSoc, ...socials]);
    setShowAddDialog(false);
    setPlatform('');
    setHandle('');
  };

  const handleDelete = (id: string) => {
    saveSocials(socials.filter((s) => s.id !== id));
  };

  return (
    <div>
      <DashboardPageHeader
        title="Social Accounts"
        description="Document your social media accounts for memorialization and access."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        }
      />

      <Card className="p-6 mb-6 bg-gradient-to-br from-chart-4/5 to-transparent border-chart-4/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10 shrink-0">
            <Globe className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Memorialization Instructions</h3>
            <p className="text-sm text-muted-foreground">
              Specify what should happen to your social accounts — memorialize, delete, or transfer access. Your trusted contacts will receive these instructions.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {socials.map((account, i) => (
          <motion.div
            key={account.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="group p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm shrink-0">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{account.platform}</p>
                    <p className="text-xs text-muted-foreground">{account.handle}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(account.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{account.followers} followers</span>
                </div>
                <Badge className={account.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'} variant="secondary">
                  {account.status}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Memorialization set
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Social Account</DialogTitle>
            <DialogDescription>Add a social media profile for estate management.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Platform Name</Label>
              <Input placeholder="e.g. Facebook, Instagram, Twitter, LinkedIn" value={platform} onChange={(e) => setPlatform(e.target.value)} />
            </div>
            <div>
              <Label>Username / Handle</Label>
              <Input placeholder="e.g. @janedoe" value={handle} onChange={(e) => setHandle(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSocial} disabled={!platform || !handle}>Save Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
