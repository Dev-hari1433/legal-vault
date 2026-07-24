'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-chart-4/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-lg mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>LegacyVault</span>
        </Link>

        <h1 className="text-7xl sm:text-9xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for might have been moved, deleted, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="shadow-glow group">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          Need help? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
        </div>
      </motion.div>
    </div>
  );
}
