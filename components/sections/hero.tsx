'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Lock, Sparkles, FileText, Users, Heart } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-glow" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full bg-chart-4/20 blur-3xl animate-glow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Your digital life, secured for generations</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Protect what matters most,
            <br />
            <span className="text-gradient">for the people you love.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LegacyVault is the secure home for your passwords, documents, photos, final wishes, and everything in between — so your loved ones are never left in the dark.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className={buttonVariants({ size: 'lg', className: 'group h-12 px-8 text-base shadow-glow' })}>
              Start your vault — free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/features" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-12 px-8 text-base' })}>
              See how it works
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" /> Bank-grade encryption
            </span>
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-success" /> Zero-knowledge architecture
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-success" /> Trusted by 50,000+ families
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          <div className="glass-card rounded-2xl shadow-elevated p-2">
            <div className="rounded-xl bg-background/80 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground font-medium">
                  app.legacyvault.com/dashboard
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: FileText, label: 'Digital Will', desc: 'Last updated 2 days ago', color: 'text-primary' },
                  { icon: Heart, label: 'Medical Info', desc: '3 records stored', color: 'text-chart-2' },
                  { icon: ShieldCheck, label: 'Government IDs', desc: '5 verified documents', color: 'text-chart-3' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="rounded-xl border border-border/60 bg-card/50 p-4 hover:shadow-soft transition-shadow"
                  >
                    <item.icon className={`h-8 w-8 ${item.color} mb-3`} />
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
