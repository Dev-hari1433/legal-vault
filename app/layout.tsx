import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { QueryProvider } from '@/components/query-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'LegacyVault – Digital Legacy Manager',
    template: '%s | LegacyVault',
  },
  description:
    'Securely organize, protect, and pass on your digital life. LegacyVault keeps your passwords, documents, photos, and final wishes safe for the people you trust.',
  keywords: [
    'digital legacy', 'digital vault', 'password manager', 'estate planning',
    'digital will', 'emergency contacts', 'secure document storage', 'death verification',
  ],
  authors: [{ name: 'LegacyVault' }],
  creator: 'LegacyVault',
  openGraph: {
    title: 'LegacyVault – Digital Legacy Manager',
    description: 'Securely organize, protect, and pass on your digital life.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LegacyVault',
    images: [{ url: 'https://bolt.new/static/og_default.png', width: 1200, height: 630, alt: 'LegacyVault' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegacyVault – Digital Legacy Manager',
    description: 'Securely organize, protect, and pass on your digital life.',
    images: [{ url: 'https://bolt.new/static/og_default.png' }],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://legacyvault.app',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="light" storageKey="legacyvault-theme">
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
