import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Skeleton className="h-9 w-64 mb-2" />
      <Skeleton className="h-5 w-96 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-10 w-10 rounded-xl mb-3" />
            <Skeleton className="h-7 w-20 mb-2" />
            <Skeleton className="h-4 w-28" />
          </Card>
        ))}
      </div>
      <Card className="p-6 mb-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex items-end justify-between gap-2 h-48">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1">
              <Skeleton className="w-full rounded-t-lg" style={{ height: `${30 + Math.random() * 60}%` }} />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
