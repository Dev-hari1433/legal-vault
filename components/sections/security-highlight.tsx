'use client';

import { motion } from 'framer-motion';
import { Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const pillars = [
  {
    icon: Lock,
    title: 'Zero-knowledge encryption',
    desc: 'Your data is encrypted on your device before it ever reaches our servers. Not even our team can read it — only you and the people you authorize.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-grade security',
    desc: '256-bit AES encryption at rest, TLS 1.3 in transit, and SOC 2 Type II compliant infrastructure. Your vault is protected to the highest industry standards.',
  },
  {
    icon: KeyRound,
    title: 'You hold the keys',
    desc: 'Your encryption keys never leave your control. Access is granted on your terms, with time-delayed release and revocable permissions.',
  },
];

export function SecurityHighlight() {
  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-dots opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <Container>
        <SectionHeader
          badge="Security first"
          title={<>Built like a <span className="text-gradient">fortress</span>, designed like a home</>}
          subtitle="Your most sensitive information deserves the strongest protection. We've built LegacyVault from the ground up with security at its core."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="h-full rounded-2xl glass-card p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                  <p.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
