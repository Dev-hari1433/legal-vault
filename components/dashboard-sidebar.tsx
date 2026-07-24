'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, FolderLock, Users, FileText,
  Siren, HeartPulse, Building2, IdCard, Wallet, CreditCard,
  Share2, Image, FolderArchive, Bell, Lock, ScrollText,
  User, Settings, ChevronLeft, LogOut, Menu, X, Shield,
  KeyRound, UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-provider';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin', label: 'Admin Panel', icon: UserCog },
    ],
  },
  {
    label: 'Vault',
    items: [
      { href: '/dashboard/digital-vault', label: 'Digital Vault', icon: FolderLock },
      { href: '/dashboard/photo-vault', label: 'Photo Vault', icon: Image },
      { href: '/dashboard/document-vault', label: 'Document Vault', icon: FolderArchive },
    ],
  },
  {
    label: 'People & Planning',
    items: [
      { href: '/dashboard/emergency-contacts', label: 'Emergency Contacts', icon: Siren },
      { href: '/dashboard/trusted-family', label: 'Trusted Family', icon: Users },
      { href: '/dashboard/access-grants', label: 'Access Grants', icon: KeyRound },
      { href: '/dashboard/emergency-verification', label: 'Verification', icon: Shield },
      { href: '/dashboard/digital-will', label: 'Digital Will', icon: FileText },
      { href: '/dashboard/emergency-instructions', label: 'Emergency Instructions', icon: Bell },
    ],
  },
  {
    label: 'Life Records',
    items: [
      { href: '/dashboard/medical-information', label: 'Medical Info', icon: HeartPulse },
      { href: '/dashboard/insurance-details', label: 'Insurance', icon: Building2 },
      { href: '/dashboard/government-ids', label: 'Government IDs', icon: IdCard },
      { href: '/dashboard/financial-assets', label: 'Financial Assets', icon: Wallet },
    ],
  },
  {
    label: 'Digital Accounts',
    items: [
      { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
      { href: '/dashboard/social-accounts', label: 'Social Accounts', icon: Share2 },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/dashboard/profile', label: 'Profile', icon: User },
      { href: '/dashboard/notification-settings', label: 'Notifications', icon: Bell },
      { href: '/dashboard/security', label: 'Security', icon: ShieldCheck },
      { href: '/dashboard/privacy-settings', label: 'Privacy', icon: Lock },
      { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText },
    ],
  },
];

export function DashboardSidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut } = useAuth();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border/60 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="hidden sm:block">LegacyVault</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to site
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 backdrop-blur-sm sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border/60 glass sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>LegacyVault</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/60 lg:hidden"
            >
              <div className="flex justify-end p-4">
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
