'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Siren, ShieldCheck, FileText, IdCard, Upload, Loader2,
  CheckCircle2, XCircle, Clock, AlertCircle, FileSearch,
  Unlock, UserCheck, ArrowRight, X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardPageHeader } from '@/components/dashboard-page-header';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  useVerificationRequests, useSubmitVerification, uploadVerificationFile,
} from '@/hooks/use-security';
import { createNotification } from '@/lib/notify';

const WORKFLOW_STEPS = [
  { key: 'emergency_report', label: 'Emergency Report', icon: Siren },
  { key: 'verification_request', label: 'Verification Request', icon: FileSearch },
  { key: 'death_certificate', label: 'Death Certificate', icon: FileText },
  { key: 'government_id', label: 'Government ID', icon: IdCard },
  { key: 'admin_review', label: 'Admin Review', icon: ShieldCheck },
  { key: 'approval', label: 'Approval', icon: CheckCircle2 },
  { key: 'notify_family', label: 'Notify Family', icon: UserCheck },
  { key: 'data_release', label: 'Data Release', icon: Unlock },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EmergencyVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const requestsQ = useVerificationRequests();
  const submitMut = useSubmitVerification();

  const [showReportDialog, setShowReportDialog] = useState(false);
  const [deathCertFile, setDeathCertFile] = useState<File | null>(null);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const deathCertRef = useRef<HTMLInputElement>(null);
  const govIdRef = useRef<HTMLInputElement>(null);

  const latestRequest = requestsQ.data?.[0];
  const status = latestRequest?.status || 'none';

  const getStepIndex = (): number => {
    if (status === 'none') return -1;
    if (status === 'pending') return 3;
    if (status === 'under_review') return 4;
    if (status === 'approved') return 7;
    if (status === 'rejected') return 4;
    return -1;
  };

  const currentStep = getStepIndex();

  const handleSubmit = async () => {
    if (!user || !deathCertFile || !govIdFile) {
      toast({ title: 'Files required', description: 'Please upload both the death certificate and government ID.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    setUploading(true);
    try {
      const deathCertUrl = await uploadVerificationFile(user.id, deathCertFile);
      const govIdUrl = await uploadVerificationFile(user.id, govIdFile);
      setUploading(false);

      await submitMut.mutateAsync({
        userId: user.id,
        deathCertificateUrl: deathCertUrl,
        governmentIdUrl: govIdUrl,
      });

      await createNotification({
        userId: user.id,
        event: 'emergency_reported',
        title: 'Emergency Report Submitted',
        body: 'A death verification request has been submitted and is pending admin review.',
        actionUrl: '/dashboard/emergency-verification',
      });

      toast({ title: 'Verification submitted', description: 'Your request has been submitted for admin review.' });
      setShowReportDialog(false);
      setDeathCertFile(null);
      setGovIdFile(null);
    } catch (err) {
      toast({ title: 'Submission failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div>
      <DashboardPageHeader
        title="Emergency Verification"
        description="Secure death verification workflow for releasing authorized information to trusted family."
        action={
          status === 'none' || status === 'rejected' ? (
            <Button className="shadow-glow" onClick={() => setShowReportDialog(true)}>
              <Siren className="mr-2 h-4 w-4" /> Submit Emergency Report
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow visualization */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-6">Verification Workflow</h2>
          <div className="space-y-1">
            {WORKFLOW_STEPS.map((step, i) => {
              const isComplete = i < currentStep || (status === 'approved' && i <= 7);
              const isCurrent = i === currentStep;
              const isRejected = status === 'rejected' && i === 4;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        isComplete
                          ? 'bg-success border-success text-success-foreground'
                          : isRejected
                          ? 'bg-destructive border-destructive text-destructive-foreground'
                          : isCurrent
                          ? 'bg-primary border-primary text-primary-foreground animate-pulse'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="h-5 w-5" /> : isRejected ? <XCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 ${isComplete ? 'bg-success' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className={`font-medium text-sm ${isComplete ? 'text-foreground' : isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-primary mt-0.5">
                        {status === 'pending' ? 'Awaiting admin review...' : 'In progress'}
                      </p>
                    )}
                    {isRejected && (
                      <p className="text-xs text-destructive mt-0.5">Verification rejected — see review notes</p>
                    )}
                    {isComplete && !isCurrent && (
                      <p className="text-xs text-success mt-0.5">Completed</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Status panel */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                status === 'approved' ? 'bg-success/10' :
                status === 'rejected' ? 'bg-destructive/10' :
                status === 'none' ? 'bg-muted/60' : 'bg-warning/10'
              }`}>
                {status === 'approved' ? <CheckCircle2 className="h-5 w-5 text-success" /> :
                 status === 'rejected' ? <XCircle className="h-5 w-5 text-destructive" /> :
                 status === 'none' ? <Clock className="h-5 w-5 text-muted-foreground" /> :
                 <Clock className="h-5 w-5 text-warning" />}
              </div>
              <div>
                <h3 className="font-semibold">Current Status</h3>
                <Badge variant={status === 'approved' ? 'default' : 'secondary'} className={
                  status === 'approved' ? 'bg-success/10 text-success' :
                  status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  status === 'none' ? '' : 'bg-warning/10 text-warning'
                }>
                  {status === 'none' ? 'No Request' :
                   status === 'pending' ? 'Pending Review' :
                   status === 'under_review' ? 'Under Review' :
                   status === 'approved' ? 'Approved' :
                   status === 'rejected' ? 'Rejected' : status}
                </Badge>
              </div>
            </div>

            {latestRequest && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">{formatDate(latestRequest.submitted_at)}</span>
                </div>
                {latestRequest.reviewed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reviewed</span>
                    <span className="font-medium">{formatDate(latestRequest.reviewed_at)}</span>
                  </div>
                )}
                {latestRequest.released_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Released</span>
                    <span className="font-medium">{formatDate(latestRequest.released_at)}</span>
                  </div>
                )}
              </div>
            )}
          </Card>

          {latestRequest?.review_notes && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Review Notes</h3>
              </div>
              <p className="text-sm text-muted-foreground">{latestRequest.review_notes}</p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm">How It Works</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Only information you explicitly authorized in Access Grants will be released.
                  Trusted family members are automatically notified upon approval.
                  All actions are logged in the audit trail.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Report submission dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                    <Siren className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Submit Emergency Report</h2>
                    <p className="text-xs text-muted-foreground">Death verification workflow</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowReportDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  This is a sensitive action. Submitting this report initiates a formal death verification process.
                  An administrator will review the documents before any data is released.
                </p>
              </div>

              <div className="space-y-6">
                {/* Death Certificate */}
                <div className="space-y-2">
                  <Label>Death Certificate</Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 p-6 cursor-pointer hover:border-primary/40 transition-colors">
                    {deathCertFile ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-success" />
                        <span className="text-sm font-medium">{deathCertFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload death certificate</span>
                      </>
                    )}
                    <input
                      ref={deathCertRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setDeathCertFile(f);
                      }}
                    />
                  </label>
                </div>

                {/* Government ID */}
                <div className="space-y-2">
                  <Label>Government ID of Deceased</Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 p-6 cursor-pointer hover:border-primary/40 transition-colors">
                    {govIdFile ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 text-success" />
                        <span className="text-sm font-medium">{govIdFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload government ID</span>
                      </>
                    )}
                    <input
                      ref={govIdRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setGovIdFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={handleSubmit}
                  disabled={!deathCertFile || !govIdFile || submitting}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {uploading ? 'Uploading...' : submitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
