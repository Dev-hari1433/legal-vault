'use client';

import { motion } from 'framer-motion';
import { PenLine, Upload, Users, ShieldCheck } from 'lucide-react';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const steps = [
  { icon: PenLine, title: 'Create your vault', desc: 'Sign up and set up your secure vault in minutes with our guided onboarding.' },
  { icon: Upload, title: 'Add your information', desc: 'Upload documents, photos, passwords, and important details. Everything is encrypted on arrival.' },
  { icon: Users, title: 'Choose your trusted people', desc: 'Designate family members and trusted contacts with the access levels you choose.' },
  { icon: ShieldCheck, title: 'Rest easy', desc: 'Your legacy is protected. When the time comes, your loved ones will have exactly what they need.' },
];

export function HowItWorks() {
  return (
    <Section className="relative bg-muted/20">
      <Container>
        <SectionHeader
          badge="How it works"
          title={<>Four simple steps to <span className="text-gradient">peace of mind</span></>}
          subtitle="Getting started is easy. You'll have your digital legacy organized and protected in no time."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shrink-0">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/50 p-6">
                  <step.icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
