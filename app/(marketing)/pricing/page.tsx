'use client';

import { Check } from 'lucide-react';
import { Pricing } from '@/components/sections/pricing';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const comparison = [
  { feature: 'Documents stored', starter: '50', family: 'Unlimited', estate: 'Unlimited' },
  { feature: 'Photo & file storage', starter: '1 GB', family: '100 GB', estate: 'Unlimited' },
  { feature: 'Trusted contacts', starter: '2', family: '10', estate: 'Unlimited' },
  { feature: 'Digital will templates', starter: 'Basic', family: 'Advanced', estate: 'Advanced' },
  { feature: 'Medical & insurance records', starter: false, family: true, estate: true },
  { feature: 'Financial asset tracking', starter: false, family: true, estate: true },
  { feature: 'Audit logs', starter: false, family: true, estate: true },
  { feature: 'Attorney collaboration', starter: false, family: false, estate: true },
  { feature: 'Multi-estate management', starter: false, family: false, estate: true },
  { feature: 'Priority support', starter: 'Email', family: 'Priority', estate: '24/7 phone' },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-success mx-auto" />
    ) : (
      <span className="text-muted-foreground/40 mx-auto">—</span>
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40 pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                Pricing
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Plans for <span className="text-gradient">every family</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Start free, upgrade when you're ready. No hidden fees, cancel anytime.
              </p>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Pricing />

      <Section className="py-16">
        <Container>
          <SectionHeader
            badge="Compare plans"
            title={<>Find the right <span className="text-gradient">fit</span></>}
          />
          <FadeIn>
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left p-4 text-sm font-semibold">Feature</th>
                    <th className="text-center p-4 text-sm font-semibold">Starter</th>
                    <th className="text-center p-4 text-sm font-semibold text-primary">Family</th>
                    <th className="text-center p-4 text-sm font-semibold">Estate</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="text-left p-4 text-sm text-muted-foreground">{row.feature}</td>
                      <td className="text-center p-4"><Cell value={row.starter} /></td>
                      <td className="text-center p-4 bg-primary/5"><Cell value={row.family} /></td>
                      <td className="text-center p-4"><Cell value={row.estate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </Container>
      </Section>
    </>
  );
}
