/**
 * Sitemap Generation Script
 * Generates dynamic XML sitemaps for services and locations
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://repairconnect.ae';

// Service pages
const services = [
  'mechanical',
  'bodywork',
  'painting',
  'electrical',
  'tires-wheels',
  'maintenance',
];

// Location pages (Phase 1: Dubai)
const dubaiLocations = ['al-quoz', 'deira', 'jumeirah'];

/**
 * Generate XML sitemap from entries
 */
function generateSitemapXML(entries: SitemapEntry[]): string {
  const urls = entries.map((entry) => {
    return `  <url>
    <loc>${BASE_URL}${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

/**
 * Generate services sitemap
 */
function generateServicesSitemap(): string {
  const entries: SitemapEntry[] = [
    {
      url: '/services',
      changefreq: 'weekly',
      priority: 0.9,
    },
    ...services.map((service) => ({
      url: `/services/${service}`,
      changefreq: 'weekly' as const,
      priority: 1.0,
    })),
  ];

  return generateSitemapXML(entries);
}

/**
 * Generate locations sitemap
 */
function generateLocationsSitemap(): string {
  const entries: SitemapEntry[] = [
    {
      url: '/locations',
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      url: '/locations/dubai',
      changefreq: 'weekly',
      priority: 0.9,
    },
    ...dubaiLocations.map((location) => ({
      url: `/locations/dubai/${location}`,
      changefreq: 'weekly' as const,
      priority: 0.9,
    })),
  ];

  return generateSitemapXML(entries);
}

/**
 * Generate main sitemap
 */
function generateMainSitemap(): string {
  const entries: SitemapEntry[] = [
    {
      url: '/',
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: '/service-requests/new',
      changefreq: 'weekly',
      priority: 0.9,
    },
    {
      url: '/workshops',
      changefreq: 'daily',
      priority: 0.9,
    },
  ];

  return generateSitemapXML(entries);
}

/**
 * Generate sitemap index
 */
function generateSitemapIndex(): string {
  const lastmod = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-main.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-services.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-locations.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Main execution
 */
function main() {
  try {
    const publicDir = join(process.cwd(), 'public');

    // Generate individual sitemaps
    const servicesSitemap = generateServicesSitemap();
    const locationsSitemap = generateLocationsSitemap();
    const mainSitemap = generateMainSitemap();
    const sitemapIndex = generateSitemapIndex();

    // Write sitemaps to public directory
    writeFileSync(join(publicDir, 'sitemap-services.xml'), servicesSitemap);
    writeFileSync(join(publicDir, 'sitemap-locations.xml'), locationsSitemap);
    writeFileSync(join(publicDir, 'sitemap-main.xml'), mainSitemap);
    writeFileSync(join(publicDir, 'sitemap.xml'), sitemapIndex);

    console.log('✅ Sitemaps generated successfully!');
    console.log('   - sitemap.xml (index)');
    console.log('   - sitemap-main.xml');
    console.log('   - sitemap-services.xml');
    console.log('   - sitemap-locations.xml');
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { generateServicesSitemap, generateLocationsSitemap, generateMainSitemap, generateSitemapIndex };
