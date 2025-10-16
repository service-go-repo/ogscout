/**
 * SEO & Schema Utilities for Repair Connect Pages
 * Enhanced for Core Pages (Homepage, About, Contact, How It Works)
 */

import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://repairconnect.ae';
const SITE_NAME = 'Repair Connect';
const SITE_DESCRIPTION = 'Connect with trusted car repair workshops in Dubai. Get instant quotes, compare services, and book with confidence.';

export interface PageSEOData {
  title: string;
  description: string;
  keywords?: string[];
  path: string;
  ogImage?: string;
}

/**
 * Generate complete metadata for a page
 */
export function generatePageMetadata(data: PageSEOData): Metadata {
  const fullTitle = data.title.includes(SITE_NAME) ? data.title : `${data.title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${data.path}`;

  return {
    title: fullTitle,
    description: data.description,
    keywords: data.keywords || [
      'car repair dubai',
      'auto workshop',
      'car service',
      'repair quotes',
      'trusted mechanics',
    ],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    openGraph: {
      title: fullTitle,
      description: data.description,
      url,
      siteName: SITE_NAME,
      locale: 'en_AE',
      type: 'website',
      images: data.ogImage ? [{ url: data.ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: data.description,
      images: data.ogImage ? [data.ogImage] : undefined,
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * LocalBusiness Schema for Homepage
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: '+971-4-XXX-XXXX',
    email: 'info@repairconnect.ae',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sheikh Zayed Road',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      postalCode: '00000',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 25.2048,
      longitude: 55.2708,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00',
      },
    ],
    priceRange: 'AED',
    areaServed: {
      '@type': 'City',
      name: 'Dubai',
      '@id': 'https://www.wikidata.org/wiki/Q612',
    },
    serviceType: ['Car Repair', 'Auto Service', 'Workshop Matching'],
  };
}

/**
 * Organization Schema for About Page
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'Repair Connect Team',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+971-4-XXX-XXXX',
      contactType: 'Customer Service',
      areaServed: 'AE',
      availableLanguage: ['English', 'Arabic'],
    },
    sameAs: [
      // Social media links would go here
      // 'https://facebook.com/repairconnect',
      // 'https://twitter.com/repairconnect',
      // 'https://instagram.com/repairconnect',
    ],
  };
}

/**
 * ContactPage Schema for Contact Page
 */
export function generateContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_URL}/contact`,
    name: 'Contact Repair Connect',
    description: 'Get in touch with Repair Connect for any questions about car repair services in Dubai.',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: SITE_NAME,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+971-4-XXX-XXXX',
        email: 'info@repairconnect.ae',
        contactType: 'Customer Service',
        areaServed: 'AE',
        availableLanguage: ['English', 'Arabic'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00',
        },
      },
    },
  };
}

/**
 * HowTo Schema for How It Works Page
 */
export function generateHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get Your Car Repaired with Repair Connect',
    description: 'Learn how to find trusted car repair workshops, get quotes, and book services in Dubai.',
    image: `${SITE_URL}/how-it-works-og.jpg`,
    totalTime: 'PT15M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'AED',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Choose Your Service Type',
        text: 'Select from mechanical, bodywork, painting, electrical, tires & wheels, or maintenance services.',
        image: `${SITE_URL}/step-1.jpg`,
        url: `${SITE_URL}/how-it-works#step-1`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Compare Workshop Quotes',
        text: 'Receive instant quotes from verified workshops. Compare prices, ratings, and services.',
        image: `${SITE_URL}/step-2.jpg`,
        url: `${SITE_URL}/how-it-works#step-2`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Book Your Appointment',
        text: 'Choose your preferred workshop and book an appointment that fits your schedule.',
        image: `${SITE_URL}/step-3.jpg`,
        url: `${SITE_URL}/how-it-works#step-3`,
      },
    ],
  };
}

/**
 * WebPage Schema (generic)
 */
export function generateWebPageSchema(data: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': data.url,
    name: data.name,
    description: data.description,
    url: data.url,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: {
      '@type': 'Thing',
      name: 'Car Repair Services',
    },
    inLanguage: 'en-AE',
  };
}

/**
 * FAQ Schema
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Breadcrumb Schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: `${SITE_URL}${item.url}`,
      })),
    ],
  };
}

/**
 * Service Categories for structured data
 */
export const SERVICE_CATEGORIES = [
  {
    name: 'Mechanical Repair',
    slug: 'mechanical',
    description: 'Engine, transmission, brake, and suspension repairs',
    icon: 'wrench',
  },
  {
    name: 'Bodywork & Collision',
    slug: 'bodywork',
    description: 'Dent repair, accident damage restoration, bumper work',
    icon: 'car',
  },
  {
    name: 'Car Painting',
    slug: 'painting',
    description: 'Full paint jobs, scratch repair, ceramic coating',
    icon: 'paintbrush',
  },
  {
    name: 'Electrical Services',
    slug: 'electrical',
    description: 'Battery, alternator, wiring, and electronics',
    icon: 'zap',
  },
  {
    name: 'Tires & Wheels',
    slug: 'tires-wheels',
    description: 'Tire replacement, wheel alignment, balancing',
    icon: 'disc',
  },
  {
    name: 'Maintenance & Service',
    slug: 'maintenance',
    description: 'Oil changes, inspections, scheduled maintenance',
    icon: 'settings',
  },
] as const;

/**
 * Generate SiteNavigationElement Schema for Header
 */
export function generateSiteNavigationSchema(navigationItems: { name: string; url: string }[]) {
  const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://repairconnect.ae';

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Site Navigation',
    itemListElement: navigationItems.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Footer Organization Schema
 */
export function generateFooterOrganizationSchema() {
  const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://repairconnect.ae';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Repair Connect',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Dubai\'s leading car workshop matching platform connecting customers with verified repair professionals.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sheikh Zayed Road',
      addressLocality: 'Dubai',
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+971-4-XXX-XXXX',
        contactType: 'Customer Service',
        areaServed: 'AE',
        availableLanguage: ['English', 'Arabic'],
        contactOption: 'TollFree',
      },
    ],
    sameAs: [
      'https://facebook.com/repairconnect',
      'https://instagram.com/repairconnect',
      'https://youtube.com/@repairconnect',
      'https://linkedin.com/company/repairconnect',
    ],
  };
}
