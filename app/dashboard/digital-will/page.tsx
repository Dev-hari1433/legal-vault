'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, CheckCircle2, Clock, AlertCircle, Download, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/dashboard-page-header';

const sections = [
  { name: 'Personal Declaration', status: 'complete', progress: 100 },
  { name: 'Asset Distribution', status: 'complete', progress: 100 },
  { name: 'Guardian Appointment', status: 'in-progress', progress: 65 },
  { name: 'Digital Asset Instructions', status: 'in-progress', progress: 40 },
  { name: 'Funeral Wishes', status: 'not-started', progress: 0 },
  { name: 'Witness Signatures', status: 'not-started', progress: 0 },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  complete: { icon: CheckCircle2, color: 'text-success', label: 'Complete' },
  'in-progress': { icon: Clock, color: 'text-warning', label: 'In Progress' },
  'not-started': { icon: AlertCircle, color: 'text-muted-foreground', label: 'Not Started' },
};

export default function DigitalWillPage() {
  const [activeSection, setActiveSection] = useState('Personal Declaration');
  const [fullName, setFullName] = useState('Jane Elizabeth Doe');
  const [dob, setDob] = useState('1985-03-15');
  const [pob, setPob] = useState('San Francisco, CA');
  const [address, setAddress] = useState('100 Security Plaza, San Francisco, CA 94101');
  const [declaration, setDeclaration] = useState(
    'I, Jane Elizabeth Doe, being of sound mind and body, declare this to be my last will and testament. I revoke all previous wills and codicils made by me. I appoint my spouse, David Kim, as the executor of my estate.'
  );

  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('legacy_digital_will');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.dob) setDob(parsed.dob);
        if (parsed.pob) setPob(parsed.pob);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.declaration) setDeclaration(parsed.declaration);
      } catch {}
    }
  }, []);

  const handleSave = () => {
    const data = { fullName, dob, pob, address, declaration, updatedAt: new Date().toISOString() };
    localStorage.setItem('legacy_digital_will', JSON.stringify(data));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleExport = () => {
    const content = `LAST WILL AND TESTAMENT\n\nName: ${fullName}\nDOB: ${dob}\nPlace of Birth: ${pob}\nAddress: ${address}\n\nDECLARATION:\n${declaration}\n\nUpdated: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Digital_Will_${fullName.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div>
      <DashboardPageHeader
        title="Digital Will"
        description="Document your final wishes with our guided, legally-aligned templates."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Draft</Button>
          </div>
        }
      />

      {savedMessage && (
        <div className="mb-4 rounded-xl bg-success/10 border border-success/30 p-3 text-sm text-success font-medium">
          ✓ Digital Will section saved to local vault successfully!
        </div>
      )}

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Will Completion</h2>
          <Badge variant="secondary" className="bg-warning/10 text-warning">65% Complete</Badge>
        </div>
        <Progress value={65} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          Complete all sections to finalize your digital will. We recommend reviewing with an attorney.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {sections.map((section, i) => {
            const config = statusConfig[section.status];
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setActiveSection(section.name)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    activeSection === section.name
                      ? 'border-primary bg-primary/5 shadow-soft'
                      : 'border-border/60 bg-card/50 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <config.icon className={`h-5 w-5 ${config.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{section.name}</p>
                      <p className="text-xs text-muted-foreground">{config.label} · {section.progress}%</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{activeSection}</h2>
                <p className="text-sm text-muted-foreground">Fill in the details below</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Legal Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pob">Place of Birth</Label>
                  <Input id="pob" value={pob} onChange={(e) => setPob(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Current Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="declaration">Declaration Statement</Label>
                <Textarea
                  id="declaration"
                  rows={4}
                  value={declaration}
                  onChange={(e) => setDeclaration(e.target.value)}
                />
              </div>
              <Button className="w-full shadow-glow" size="lg" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save Section
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
