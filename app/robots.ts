import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/login', '/signup', '/forgot-password', '/verify-email'],
    },
    sitemap: 'https://legacyvault.app/sitemap.xml',
  };
}
