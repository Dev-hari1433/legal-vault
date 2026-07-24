'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Users, FileText, Lock, Heart, CreditCard, Image, KeyRound, Bell } from 'lucide-react';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const features = [
  { icon: ShieldCheck, title: 'Digital Vault', desc: 'A single, encrypted home for everything that matters — accessible only to you and the people you trust.', color: 'text-primary' },
  { icon: Users, title: 'Trusted Family Members', desc: 'Designate who can access what, with granular permissions and time-delayed release controls.', color: 'text-chart-2' },
  { icon: FileText, title: 'Digital Will', desc: 'Document your final wishes with legally-aligned templates and clear instructions for your estate.', color: 'text-chart-3' },
  { icon: Heart, title: 'Medical Information', desc: 'Store allergies, conditions, medications, and emergency contacts for first responders.', color: 'text-chart-5' },
  { icon: CreditCard, title: 'Financial Assets', desc: 'Track accounts, investments, and policies so nothing gets lost in the shuffle.', color: 'text-primary' },
  { icon: KeyRound, title: 'Password & Account Access', desc: 'Securely share access to your online accounts when the time is right.', color: 'text-chart-4' },
  { icon: Image, title: 'Photo Vault', desc: 'Preserve cherished memories in organized, shareable galleries your family will treasure.', color: 'text-chart-2' },
  { icon: Lock, title: 'Government IDs', desc: 'Keep copies of passports, licenses, and IDs safe and ready when needed.', color: 'text-chart-3' },
  { icon: Bell, title: 'Emergency Instructions', desc: 'Leave clear, step-by-step guidance for the people who will act on your behalf.', color: 'text-chart-5' },
];

export function Features() {
  return (
    <Section className="relative">
      <Container>
        <SectionHeader
          badge="Everything in one place"
          title={<>One vault for your <span className="text-gradient">entire digital life</span></>}
          subtitle="From passwords and policies to photos and final wishes, LegacyVault brings every important detail under one secure roof."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group h-full rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 hover:shadow-elevated hover:border-primary/30 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 group-hover:bg-primary/10 transition-colors mb-5">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
