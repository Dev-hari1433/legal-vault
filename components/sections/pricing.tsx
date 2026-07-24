'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to get started protecting your digital legacy.',
    features: [
      'Up to 50 documents',
      '1 GB photo & file storage',
      '2 trusted contacts',
      'Basic digital will template',
      'Emergency contact storage',
      'Email support',
    ],
    cta: 'Start for free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Family',
    price: '$12',
    period: 'per month',
    description: 'Comprehensive protection for you and your entire family.',
    features: [
      'Unlimited documents',
      '100 GB photo & file storage',
      '10 trusted contacts',
      'Advanced digital will & estate tools',
      'Medical & insurance records',
      'Financial asset tracking',
      'Audit logs & access history',
      'Priority support',
    ],
    cta: 'Start free trial',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Estate',
    price: '$29',
    period: 'per month',
    description: 'For estates, trusts, and families with complex needs.',
    features: [
      'Everything in Family, plus:',
      'Unlimited storage',
      'Unlimited trusted contacts',
      'Attorney collaboration tools',
      'Multi-estate management',
      'Custom access schedules',
      'Dedicated account manager',
      '24/7 phone support',
    ],
    cta: 'Contact sales',
    href: '/contact',
    popular: false,
  },
];

export function Pricing() {
  return (
    <Section id="pricing" className="relative">
      <Container>
        <SectionHeader
          badge="Simple, transparent pricing"
          title={<>Choose the plan that <span className="text-gradient">fits your family</span></>}
          subtitle="Start free, upgrade when you're ready. No hidden fees, cancel anytime."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative h-full rounded-2xl border p-8 ${
                  plan.popular
                    ? 'border-primary bg-card shadow-glow'
                    : 'border-border/60 bg-card/50 backdrop-blur-sm'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                      Most popular
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>

                <Button
                  className="w-full mt-6"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span className={feature.endsWith(':') ? 'font-semibold' : 'text-muted-foreground'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
