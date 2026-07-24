'use client';

import { motion } from 'framer-motion';
import { Target, Eye, Heart, Users, Shield, Award } from 'lucide-react';
import { Section, Container, SectionHeader, FadeIn } from '@/components/section-utils';

const values = [
  { icon: Shield, title: 'Security above all', desc: 'We never compromise on the protection of your data. Every decision starts with your safety.' },
  { icon: Heart, title: 'Empathy-driven', desc: 'We build for people during the most difficult moments of their lives. Compassion guides our design.' },
  { icon: Award, title: 'Excellence in every detail', desc: 'From encryption to typography, we obsess over the details that make LegacyVault feel premium.' },
  { icon: Users, title: 'Family-first', desc: 'Everything we build is designed to bring families closer, even across generations and distance.' },
];

const team = [
  { name: 'Alexandra Reeves', role: 'Founder & CEO', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'David Kim', role: 'CTO & Head of Security', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'Maria Santos', role: 'Head of Design', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { name: 'James Okonkwo', role: 'Head of Product', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

export default function AboutPage() {
  return (
    <>
      <Section className="pt-32 sm:pt-40 pb-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
                Our story
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                We believe everyone deserves a <span className="text-gradient">digital legacy</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                LegacyVault was born from a simple, painful truth: when someone passes away, their family is left scrambling to find passwords, documents, accounts, and wishes. We exist to change that.
              </p>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn>
              <div className="rounded-2xl glass-card p-8 h-full">
                <Target className="h-10 w-10 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To give every person the tools to organize, protect, and pass on their digital life — so that the people they love are never left searching, guessing, or locked out during life's hardest moments.
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl glass-card p-8 h-full">
                <Eye className="h-10 w-10 text-primary mb-4" />
                <h2 className="text-2xl font-bold mb-3">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A world where every family has a secure, beautiful, and simple way to preserve what matters — where no memory is lost, no wish is forgotten, and no door is permanently closed.
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section className="py-16 bg-muted/20">
        <Container>
          <SectionHeader
            badge="What we stand for"
            title={<>The values that <span className="text-gradient">guide us</span></>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-border/60 bg-card/50 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <v.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="py-16">
        <Container>
          <SectionHeader
            badge="The people behind it"
            title={<>Meet the <span className="text-gradient">team</span></>}
            subtitle="A passionate group of engineers, designers, and security experts on a mission to protect what matters."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="text-center">
                  <div className="relative mx-auto mb-4 w-32 h-32 rounded-2xl overflow-hidden">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
