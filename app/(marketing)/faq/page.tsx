'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const faqs = [
  {
    q: 'Is my data actually secure?',
    a: 'Yes. LegacyVault uses zero-knowledge, end-to-end encryption. Your data is encrypted on your device before it reaches our servers, meaning not even our team can access your vault contents. We use 256-bit AES encryption at rest and TLS 1.3 in transit, with SOC 2 Type II compliant infrastructure.',
  },
  {
    q: 'What happens to my vault if something happens to me?',
    a: 'You designate trusted family members and set access rules — including time-delayed release (e.g., your vault unlocks for a designated person only if you haven\'t logged in for 90 days). You\'re always in control of who gets access and when.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel anytime from your account settings with no penalties. If you cancel, you\'ll retain access until the end of your billing period, and you can export your data at any time.',
  },
  {
    q: 'Is the digital will legally binding?',
    a: 'LegacyVault provides legally-aligned templates to help you document your wishes clearly. However, estate laws vary by jurisdiction, so we recommend reviewing your digital will with a qualified estate attorney. Our Estate plan includes attorney collaboration tools.',
  },
  {
    q: 'What\'s included in the free plan?',
    a: 'The Starter plan is free forever and includes up to 50 documents, 1 GB of storage, 2 trusted contacts, a basic digital will template, and emergency contact storage. It\'s a great way to get started with no commitment.',
  },
  {
    q: 'Can I share specific items with specific people?',
    a: 'Yes. You can grant granular, item-level access to trusted contacts. For example, you might give your spouse access to everything, but only share your medical information with your emergency contact.',
  },
  {
    q: 'What if I forget my master password?',
    a: 'For your security, your master password is not stored anywhere — we can\'t reset it for you. However, we provide a recovery key during setup that you can use to regain access. We strongly recommend storing this recovery key in a safe physical location.',
  },
  {
    q: 'Do you offer family or team plans?',
    a: 'Our Family plan supports up to 10 trusted contacts and is designed for families. For larger estates or professional use, our Estate plan offers unlimited contacts and attorney collaboration tools.',
  },
];

export default function FAQPage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40 pb-8">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                FAQ
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Questions? <span className="text-gradient">We have answers.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Everything you need to know about LegacyVault. Can't find what you're looking for? Reach out to our team.
              </p>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section className="pt-8 pb-20">
        <Container>
          <div className="max-w-3xl mx-auto">
            <FadeIn>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm px-6"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeIn>
          </div>
        </Container>
      </Section>
    </>
  );
}
