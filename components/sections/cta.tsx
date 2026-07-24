'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Section, Container } from '@/components/section-utils';

export function CTA() {
  return (
    <Section className="py-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-chart-4/10 to-chart-5/10 border border-border/60 p-8 sm:p-16 text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
            Your legacy deserves to be protected.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Join 50,000+ families who've already secured their digital lives. It takes less than 10 minutes to get started.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className={buttonVariants({ size: 'lg', className: 'h-12 px-8 text-base shadow-glow group' })}>
              Create your free vault
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'h-12 px-8 text-base' })}>
              Talk to our team
            </Link>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
