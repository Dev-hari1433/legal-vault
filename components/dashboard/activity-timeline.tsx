'use client';

import { motion } from 'framer-motion';
import {
  Upload, UserPlus, Lock, CheckCircle2, ShieldCheck,
  Edit, Trash2, Eye, Download, Share2, Activity,
} from 'lucide-react';

const actionConfig: Record<string, { icon: typeof Activity; color: string }> = {
  upload: { icon: Upload, color: 'text-primary' },
  'user.add': { icon: UserPlus, color: 'text-chart-2' },
  'privacy.update': { icon: Lock, color: 'text-chart-3' },
  'will.complete': { icon: CheckCircle2, color: 'text-success' },
  'security.check': { icon: ShieldCheck, color: 'text-success' },
  'item.edit': { icon: Edit, color: 'text-chart-4' },
  'item.delete': { icon: Trash2, color: 'text-destructive' },
  'item.view': { icon: Eye, color: 'text-chart-5' },
  'item.download': { icon: Download, color: 'text-primary' },
  'item.share': { icon: Share2, color: 'text-chart-2' },
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityTimeline({
  activities,
}: {
  activities: {
    id: string;
    action: string;
    description: string | null;
    created_at: string;
  }[];
}) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">No recent activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-1">
        {activities.map((activity, i) => {
          const config = actionConfig[activity.action] ?? { icon: Activity, color: 'text-muted-foreground' };
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative flex items-start gap-4 py-2.5"
            >
              <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shrink-0">
                <config.icon className={`h-4 w-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm leading-tight">
                  {activity.description || activity.action.replace(/[._]/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatTimeAgo(activity.created_at)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
