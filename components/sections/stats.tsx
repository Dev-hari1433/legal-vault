'use client';

import { motion } from 'framer-motion';
import { Section, Container } from '@/components/section-utils';

const stats = [
  { value: '50K+', label: 'Families protected' },
  { value: '2M+', label: 'Documents secured' },
  { value: '99.99%', label: 'Uptime guaranteed' },
  { value: '256-bit', label: 'AES encryption' },
];

export function Stats() {
  return (
    <Section className="py-16">
      <Container>
        <div className="rounded-3xl glass-card p-8 sm:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
