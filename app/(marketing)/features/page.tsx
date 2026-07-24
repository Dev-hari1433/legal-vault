'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Users, FileText, Lock, Heart, CreditCard,
  KeyRound, Image, Bell, BookOpen, Building, IdCard, ArrowRight, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const categories = [
  {
    title: 'Your Digital Vault',
    description: 'The secure foundation for everything you store.',
    icon: ShieldCheck,
    features: [
      { icon: ShieldCheck, name: 'Digital Vault', desc: 'Encrypted storage for all your important digital assets in one place.' },
      { icon: Image, name: 'Photo Vault', desc: 'Organize and preserve family photos in beautiful, shareable galleries.' },
      { icon: FileText, name: 'Document Vault', desc: 'Store, categorize, and share important documents with version history.' },
    ],
  },
  {
    title: 'People & Planning',
    description: 'Prepare for the unexpected and protect your loved ones.',
    icon: Users,
    features: [
      { icon: Users, name: 'Trusted Family Members', desc: 'Grant granular access to specific people with time-delayed release.' },
      { icon: Bell, name: 'Emergency Contacts', desc: 'Keep critical contact information ready for emergencies.' },
      { icon: BookOpen, name: 'Digital Will', desc: 'Document your final wishes with legally-aligned templates.' },
      { icon: Bell, name: 'Emergency Instructions', desc: 'Leave step-by-step guidance for acting on your behalf.' },
    ],
  },
  {
    title: 'Life Records',
    description: 'Centralize the information your family will need.',
    icon: Heart,
    features: [
      { icon: Heart, name: 'Medical Information', desc: 'Allergies, conditions, medications, and emergency medical data.' },
      { icon: Building, name: 'Insurance Details', desc: 'Track policies, coverage, and provider information.' },
      { icon: IdCard, name: 'Government IDs', desc: 'Secure copies of passports, licenses, and identification.' },
      { icon: CreditCard, name: 'Financial Assets', desc: 'Track bank accounts, investments, and property.' },
    ],
  },
  {
    title: 'Digital Accounts',
    description: 'Manage your online presence and subscriptions.',
    icon: KeyRound,
    features: [
      { icon: KeyRound, name: 'Social Accounts', desc: 'Document your social media accounts and access for memorialization.' },
      { icon: CreditCard, name: 'Subscriptions', desc: 'Track recurring payments and subscriptions to avoid waste.' },
      { icon: Lock, name: 'Password Sharing', desc: 'Securely share account access with trusted people when needed.' },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40 pb-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                Features
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Every tool you need to <span className="text-gradient">protect your legacy</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                LegacyVault brings together every aspect of your digital life into one secure, beautifully designed platform.
              </p>
            </FadeIn>
          </div>
        </Container>
      </Section>

      {categories.map((cat, ci) => (
        <Section key={ci} className={ci % 2 === 1 ? 'bg-muted/20 py-16' : 'py-16'}>
          <Container>
            <FadeIn>
              <div className="flex items-center gap-4 mb-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <cat.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold">{cat.title}</h2>
                  <p className="text-muted-foreground">{cat.description}</p>
                </div>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.features.map((f, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="h-full rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 hover:shadow-soft transition-all"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 mb-4">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{f.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </Container>
        </Section>
      ))}

      <Section className="py-20">
        <Container>
          <FadeIn>
            <div className="rounded-3xl glass-card p-8 sm:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of families who trust LegacyVault to protect what matters most.
              </p>
              <Button size="lg" asChild className="h-12 px-8 shadow-glow group">
                <Link href="/signup">
                  Create your free vault
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
