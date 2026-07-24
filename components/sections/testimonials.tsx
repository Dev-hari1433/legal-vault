'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const testimonials = [
  {
    quote: "LegacyVault gave my parents incredible peace of mind. When my father passed, we had everything we needed — his will, his accounts, his photos — all in one place.",
    name: 'Sarah Mitchell',
    role: 'Daughter & Caregiver',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    quote: "As an estate attorney, I recommend LegacyVault to every client. It turns the hardest moments of a family's life into something manageable and clear.",
    name: 'James Chen',
    role: 'Estate Attorney',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    quote: "I travel constantly for work. Knowing my wife has access to my insurance, IDs, and emergency info if something happens to me is worth every penny.",
    name: 'Marcus Williams',
    role: 'Frequent Traveler',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    quote: "Setting up my digital will took 20 minutes. The interface is gorgeous and the peace of mind is priceless. I wish I'd found this years ago.",
    name: 'Priya Sharma',
    role: 'Small Business Owner',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    quote: "After my mother's sudden illness, we scrambled for weeks to find her insurance and medical records. LegacyVault would have saved us so much stress.",
    name: 'David Okafor',
    role: 'Software Engineer',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    quote: "The photo vault alone is worth it. I've organized decades of family memories and shared access with my kids. It's become a living family archive.",
    name: 'Elena Rossi',
    role: 'Retired Teacher',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
];

export function Testimonials() {
  return (
    <Section className="relative overflow-hidden">
      <Container>
        <SectionHeader
          badge="Loved by families"
          title={<>Trusted by people who <span className="text-gradient">plan ahead</span></>}
          subtitle="Thousands of families use LegacyVault to protect what matters most. Here's what they have to say."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="h-full rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 hover:shadow-soft transition-shadow">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-sm leading-relaxed text-foreground/90 mb-6">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mt-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-chart-3 text-chart-3" />
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
