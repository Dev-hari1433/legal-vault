import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 via-chart-4/5 to-chart-5/10">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 -left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-chart-4/20 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span>LegacyVault</span>
          </Link>
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Your digital legacy, protected for generations.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Join 50,000+ families who trust LegacyVault to keep their most important information safe, organized, and ready for the people who matter most.
            </p>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Bank-grade encryption</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Zero-knowledge</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LegacyVault. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span>LegacyVault</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="hidden lg:flex justify-end p-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
