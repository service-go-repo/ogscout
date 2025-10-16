/**
 * SEO Utility Functions for Repair Connect
 * Handles metadata generation, schema markup, and SEO optimizations
 */

import { Metadata } from 'next';

export interface ServiceSEOData {
  serviceName: string;
  serviceSlug: string;
  description: string;
  keywords: string[];
  commonProblems: string[];
  brands: string[];
}

export interface LocationSEOData {
  locationName: string;
  locationSlug: string;
  area: string;
  landmarks: string[];
  description: string;
}

/**
 * Generate optimized metadata for service pages
 */
export function generateServiceMetadata(service: ServiceSEOData): Metadata {
  const title = `Professional ${service.serviceName} in Dubai | Book Your Appointment Today`;
  const description = `Find certified workshops offering expert ${service.serviceName} in Dubai. Get reliable repairs and transparent pricing. Book your car service today.`;

  return {
    title,
    description,
    keywords: [
      ...service.keywords,
      'Dubai car repair',
      'UAE auto service',
      'verified workshops',
      'instant quotes',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_AE',
      siteName: 'Repair Connect',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/services/${service.serviceSlug}`,
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
 * Generate optimized metadata for location pages
 */
export function generateLocationMetadata(location: LocationSEOData): Metadata {
  const title = `Car Workshops in ${location.locationName}, Dubai | Trusted Mechanics Near You`;
  const description = `Top-rated car repair and maintenance workshops in ${location.locationName}, Dubai. Compare services and book online instantly.`;

  return {
    title,
    description,
    keywords: [
      `${location.locationName} car repair`,
      `${location.locationName} workshops`,
      `${location.area} mechanics`,
      'Dubai auto service',
      'car repair near me',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_AE',
      siteName: 'Repair Connect',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/locations/dubai/${location.locationSlug}`,
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
 * Generate LocalBusiness Schema for service pages
 */
export function generateServiceSchema(service: ServiceSEOData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.serviceName} in Dubai`,
    serviceType: service.serviceName,
    provider: {
      '@type': 'Organization',
      name: 'Repair Connect',
      url: 'https://repairconnect.ae',
    },
    areaServed: {
      '@type': 'City',
      name: 'Dubai',
      '@id': 'https://www.wikidata.org/wiki/Q612',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `https://repairconnect.ae/services/${service.serviceSlug}`,
      serviceType: 'OnlineBooking',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.serviceName} Services`,
      itemListElement: service.commonProblems.map((problem, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: problem,
        },
        position: index + 1,
      })),
    },
  };
}

/**
 * Generate LocalBusiness Schema for location pages
 */
export function generateLocationSchema(location: LocationSEOData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://repairconnect.ae/locations/dubai/${location.locationSlug}`,
    name: `Repair Connect - ${location.locationName}`,
    description: location.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.locationName,
      addressRegion: 'Dubai',
      addressCountry: 'AE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // These would be dynamically set based on actual location
    },
    url: `https://repairconnect.ae/locations/dubai/${location.locationSlug}`,
    telephone: '+971-XXX-XXXX',
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
        closes: '16:00',
      },
    ],
    priceRange: 'AED',
  };
}

/**
 * Generate FAQ Schema
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
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://repairconnect.ae${item.url}`,
    })),
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://repairconnect.ae';
  return `${baseUrl}${path}`;
}

/**
 * Format meta description with optimal length (150-160 chars)
 */
export function formatMetaDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description;

  // Trim to max length and find last complete word
  const trimmed = description.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');

  return trimmed.substring(0, lastSpace) + '...';
}

/**
 * Generate structured data script tag
 */
export function generateStructuredDataScript(data: object) {
  return {
    __html: JSON.stringify(data),
  };
}
