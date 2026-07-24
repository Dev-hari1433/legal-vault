'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, FileSearch, CheckCircle2, XCircle, Clock,
  Loader2, FileText, IdCard, User, Eye, AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  useVerificationRequests, useReviewVerification, type VerificationRequest,
} from '@/hooks/use-security';
import { createNotification, logSecurityEvent } from '@/lib/notify';
import { AdminShell } from '@/components/admin-shell';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_META: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning', icon: Clock },
  under_review: { label: 'Under Review', color: 'bg-blue-500/10 text-blue-600', icon: FileSearch },
  approved: { label: 'Approved', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive', icon: XCircle },
};

export default function AdminVerificationReviewPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const requestsQ = useVerificationRequests(true);
  const reviewMut = useReviewVerification();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewingRequest, setReviewingRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const filteredRequests = (requestsQ.data || []).filter((r: VerificationRequest) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleApprove = async () => {
    if (!reviewingRequest || !user) return;
    setApproving(true);
    try {
      await reviewMut.mutateAsync({
        requestId: reviewingRequest.id,
        status: 'approved',
        reviewerId: user.id,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      await createNotification({
        userId: reviewingRequest.user_id,
        event: 'verification_approved',
        title: 'Verification Approved',
        body: 'Death verification has been approved. Authorized data is being released to trusted family members.',
        actionUrl: '/dashboard/emergency-verification',
      });

      await createNotification({
        userId: reviewingRequest.user_id,
        event: 'data_released',
        title: 'Data Released to Trusted Family',
        body: 'Authorized information has been released to your designated trusted contacts per your access grants.',
      });

      await logSecurityEvent(reviewingRequest.user_id, 'verification_approved', 'critical', {
        reviewer_id: user.id,
        request_id: reviewingRequest.id,
      });

      toast({ title: 'Verification approved', description: 'Data has been released and family notified.' });
      setReviewingRequest(null);
      setReviewNotes('');
    } catch (err) {
      toast({ title: 'Approval failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!reviewingRequest || !user) return;
    setRejecting(true);
    try {
      await reviewMut.mutateAsync({
        requestId: reviewingRequest.id,
        status: 'rejected',
        reviewerId: user.id,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      await createNotification({
        userId: reviewingRequest.user_id,
        event: 'verification_rejected',
        title: 'Verification Rejected',
        body: reviewNotes.trim() || 'The death verification request has been rejected. See review notes for details.',
        actionUrl: '/dashboard/emergency-verification',
      });

      await logSecurityEvent(reviewingRequest.user_id, 'verification_rejected', 'warning', {
        reviewer_id: user.id,
        request_id: reviewingRequest.id,
      });

      toast({ title: 'Verification rejected', description: 'The user has been notified.' });
      setReviewingRequest(null);
      setReviewNotes('');
    } catch (err) {
      toast({ title: 'Rejection failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <AdminShell>
      <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Verification Review</h1>
        <p className="text-muted-foreground mt-1">Review and approve death verification requests.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'under_review', 'approved', 'rejected'].map((status: string) => {
          const count = status === 'all'
            ? (requestsQ.data || []).length
            : (requestsQ.data || []).filter((r: VerificationRequest) => r.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {status === 'all' ? 'All' : STATUS_META[status]?.label || status} ({count})
            </button>
          );
        })}
      </div>

      {requestsQ.isLoading ? (
        <Card className="p-12 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
            <FileSearch className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No verification requests</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filterStatus === 'all' ? 'No requests have been submitted yet.' : `No ${filterStatus} requests.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request: VerificationRequest, i: number) => {
            const meta = STATUS_META[request.status] || STATUS_META.pending;
            const Icon = meta.icon;
            return (
              <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5 hover:shadow-soft transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">Request #{request.id.slice(0, 8)}</p>
                        <Badge variant="secondary" className={meta.color}>{meta.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDate(request.submitted_at)}
                        {request.reviewed_at && ` · Reviewed ${formatDate(request.reviewed_at)}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setReviewingRequest(request)}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> Review
                          </Button>
                        </>
                      )}
                      {request.status !== 'pending' && (
                        <Button size="sm" variant="ghost" onClick={() => setReviewingRequest(request)}>
                          <Eye className="mr-2 h-3.5 w-3.5" /> Details
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!reviewingRequest} onOpenChange={(open) => { if (!open) { setReviewingRequest(null); setReviewNotes(''); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {reviewingRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Review</DialogTitle>
                <DialogDescription>
                  Request #{reviewingRequest.id.slice(0, 8)} · Submitted {formatDate(reviewingRequest.submitted_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Current status */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="secondary" className={STATUS_META[reviewingRequest.status]?.color || ''}>
                    {STATUS_META[reviewingRequest.status]?.label || reviewingRequest.status}
                  </Badge>
                </div>

                <Separator />

                {/* Documents */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Submitted Documents</h3>

                  {reviewingRequest.death_certificate_url && (
                    <a
                      href={reviewingRequest.death_certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border/60 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Death Certificate</p>
                        <p className="text-xs text-muted-foreground">Click to view document</p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}

                  {reviewingRequest.government_id_url && (
                    <a
                      href={reviewingRequest.government_id_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg border border-border/60 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <IdCard className="h-5 w-5 text-cyan-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Government ID</p>
                        <p className="text-xs text-muted-foreground">Click to view document</p>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>

                {/* Review notes (if already reviewed) */}
                {reviewingRequest.review_notes && reviewingRequest.status !== 'pending' && (
                  <div className="space-y-2">
                    <Label>Review Notes</Label>
                    <div className="rounded-lg border border-border/60 p-3 bg-muted/30">
                      <p className="text-sm text-muted-foreground">{reviewingRequest.review_notes}</p>
                    </div>
                  </div>
                )}

                {/* Review form (if pending) */}
                {reviewingRequest.status === 'pending' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="review_notes">Review Notes (optional for approval, recommended for rejection)</Label>
                      <Textarea
                        id="review_notes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about the verification decision..."
                        rows={3}
                      />
                    </div>

                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Approving this request will release authorized data to trusted family members and notify them immediately.
                        This action is logged in the audit trail and cannot be undone.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {reviewingRequest.status === 'pending' && (
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejecting || approving}
                  >
                    {rejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                    Reject
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={approving || rejecting}
                    className="bg-success text-success-foreground hover:bg-success/90"
                  >
                    {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Approve & Release Data
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AdminShell>
  );
}
