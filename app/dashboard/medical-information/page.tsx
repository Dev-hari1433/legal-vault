'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Plus, Pill, AlertTriangle, Droplet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';

interface Allergy { name: string; severity: string; reaction: string; }
interface Condition { name: string; diagnosed: string; severity: string; notes: string; }
interface Medication { name: string; dosage: string; frequency: string; prescribed: string; }

const INITIAL_ALLERGIES: Allergy[] = [
  { name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
  { name: 'Shellfish', severity: 'Moderate', reaction: 'Hives, swelling' },
  { name: 'Latex', severity: 'Mild', reaction: 'Skin rash' },
];

const INITIAL_CONDITIONS: Condition[] = [
  { name: 'Type 2 Diabetes', diagnosed: '2018', severity: 'Moderate', notes: 'Managed with diet and Metformin' },
  { name: 'Hypertension', diagnosed: '2020', severity: 'Mild', notes: 'Controlled with Lisinopril' },
  { name: 'Asthma', diagnosed: '2005', severity: 'Mild', notes: 'Uses rescue inhaler as needed' },
];

const INITIAL_MEDICATIONS: Medication[] = [
  { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribed: 'Dr. Reeves' },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', prescribed: 'Dr. Reeves' },
  { name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', prescribed: 'Dr. Reeves' },
];

export default function MedicalInformationPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [bloodType, setBloodType] = useState('A+');
  const [height, setHeight] = useState('5\'6" (168 cm)');
  const [weight, setWeight] = useState('140 lbs (64 kg)');
  const [organ, setOrgan] = useState('Yes — Registered');
  const [notes, setNotes] = useState('Pacemaker implanted in 2021 (Medtronic). MRI conditional.');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [recordCategory, setRecordCategory] = useState<'allergy' | 'condition' | 'medication'>('allergy');
  const [recordName, setRecordName] = useState('');
  const [recordDetail, setRecordDetail] = useState('');
  const [recordSeverity, setRecordSeverity] = useState('Moderate');

  useEffect(() => {
    const rawA = localStorage.getItem('legacy_allergies');
    const rawC = localStorage.getItem('legacy_conditions');
    const rawM = localStorage.getItem('legacy_medications');

    if (rawA) try { setAllergies(JSON.parse(rawA)); } catch {} else setAllergies(INITIAL_ALLERGIES);
    if (rawC) try { setConditions(JSON.parse(rawC)); } catch {} else setConditions(INITIAL_CONDITIONS);
    if (rawM) try { setMedications(JSON.parse(rawM)); } catch {} else setMedications(INITIAL_MEDICATIONS);
  }, []);

  const handleAddRecord = () => {
    if (!recordName) return;
    if (recordCategory === 'allergy') {
      const updated = [{ name: recordName, severity: recordSeverity, reaction: recordDetail || 'Reaction noted' }, ...allergies];
      setAllergies(updated);
      localStorage.setItem('legacy_allergies', JSON.stringify(updated));
    } else if (recordCategory === 'condition') {
      const updated = [{ name: recordName, diagnosed: '2026', severity: recordSeverity, notes: recordDetail || 'Medical condition' }, ...conditions];
      setConditions(updated);
      localStorage.setItem('legacy_conditions', JSON.stringify(updated));
    } else {
      const updated = [{ name: recordName, dosage: recordDetail || 'As prescribed', frequency: 'Daily', prescribed: 'Doctor' }, ...medications];
      setMedications(updated);
      localStorage.setItem('legacy_medications', JSON.stringify(updated));
    }
    setShowAddDialog(false);
    setRecordName('');
    setRecordDetail('');
  };

  return (
    <div>
      <DashboardPageHeader
        title="Medical Information"
        description="Critical health information for emergencies and caregivers."
        action={
          <Button className="shadow-glow" size="lg" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Record
          </Button>
        }
      />

      <Card className="p-6 mb-6 bg-gradient-to-br from-destructive/5 to-transparent border-destructive/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Critical: Allergies & Conditions</h3>
            <p className="text-sm text-muted-foreground">
              This information is visible to first responders. Keep it updated — it could save your life.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Allergies</h3>
          </div>
          <div className="space-y-2">
            {allergies.map((allergy, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{allergy.name}</p>
                  <p className="text-xs text-muted-foreground">{allergy.reaction}</p>
                </div>
                <Badge className="bg-destructive/10 text-destructive" variant="secondary">{allergy.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="h-5 w-5 text-chart-5" />
            <h3 className="font-semibold">Conditions</h3>
          </div>
          <div className="space-y-2">
            {conditions.map((cond, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{cond.name}</p>
                  <p className="text-xs text-muted-foreground">Since {cond.diagnosed}</p>
                </div>
                <Badge className="bg-warning/10 text-warning" variant="secondary">{cond.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Medications</h3>
          </div>
          <div className="space-y-2">
            {medications.map((med, i) => (
              <div key={i} className="rounded-lg bg-muted/30 px-3 py-2">
                <p className="text-sm font-medium">{med.name} {med.dosage}</p>
                <p className="text-xs text-muted-foreground">{med.frequency}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Emergency Medical Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type</Label>
            <Input id="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input id="height" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organ">Organ Donor</Label>
            <Input id="organ" value={organ} onChange={(e) => setOrgan(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Additional Medical Notes</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medical Record</DialogTitle>
            <DialogDescription>Add an allergy, medical condition, or current prescription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Category</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={recordCategory}
                onChange={(e) => setRecordCategory(e.target.value as any)}
              >
                <option value="allergy">Allergy</option>
                <option value="condition">Medical Condition</option>
                <option value="medication">Medication / Prescription</option>
              </select>
            </div>
            <div>
              <Label>Item Name</Label>
              <Input placeholder="e.g. Penicillin, Diabetes, Metformin" value={recordName} onChange={(e) => setRecordName(e.target.value)} />
            </div>
            <div>
              <Label>Details / Dosage / Reaction</Label>
              <Input placeholder="e.g. 500mg daily / Hives & Swelling" value={recordDetail} onChange={(e) => setRecordDetail(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRecord} disabled={!recordName}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
