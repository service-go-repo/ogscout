'use client';

/**
 * Footer Component - Fully SEO-Optimized with Organization Schema
 * Features: Services grid, contact info with microdata, social links, newsletter
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wrench,
  Car,
  Paintbrush,
  Zap,
  Disc,
  Settings,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from 'lucide-react';

import { APP_NAME } from '@/lib/constants';
import { generateFooterOrganizationSchema, SERVICE_CATEGORIES } from '@/lib/seo';
import { StructuredData } from '@/components/seo/StructuredData';

const serviceIcons = {
  wrench: Wrench,
  car: Car,
  paintbrush: Paintbrush,
  zap: Zap,
  disc: Disc,
  settings: Settings,
} as const;

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/repairconnect', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com/repairconnect', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@repairconnect', icon: Youtube },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/repairconnect', icon: Linkedin },
];

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Workshops', href: '/workshops' },
  { name: 'Get a Quote', href: '/quotations/request' },
];

export function Footer() {
  const organizationSchema = generateFooterOrganizationSchema();

  return (
    <>
      <StructuredData data={organizationSchema} />

      <motion.footer
        className="bg-[var(--secondary)] dark:bg-[var(--background-8)] text-[var(--primary-50)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/"
                className="flex items-center space-x-2 mb-4 hover:opacity-90 transition-opacity"
                aria-label={`${APP_NAME} Home`}
              >
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                </div>
                <span className="font-bold text-2xl">{APP_NAME}</span>
              </Link>
              <p className="text-[var(--primary-50)]/80 mb-6 text-tagline-2 leading-relaxed">
                Dubai&apos;s leading car workshop matching platform. Connect with verified repair
                professionals, get instant quotes, and book with confidence.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-[var(--accent)]/10 hover:bg-primary-500 rounded-lg transition-all hover:-translate-y-1 group"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <social.icon
                      className="h-5 w-5 text-[var(--primary-50)]/60 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-tagline-2 text-[var(--primary-50)]/80 hover:text-primary-500 transition-colors inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-lg mb-4">Popular Services</h3>
              <ul className="space-y-3">
                {SERVICE_CATEGORIES.map((service) => {
                  const Icon = serviceIcons[service.icon as keyof typeof serviceIcons];
                  return (
                    <li key={service.slug}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-tagline-2 text-[var(--primary-50)]/80 hover:text-primary-500 transition-colors inline-flex items-center space-x-2 group"
                      >
                        <Icon
                          className="h-4 w-4 text-[var(--primary-50)]/60 group-hover:text-primary-500"
                          aria-hidden="true"
                        />
                        <span>{service.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Contact Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              itemScope
              itemType="https://schema.org/Organization"
            >
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-4">
                {/* Address */}
                <li className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-tagline-2 text-[var(--primary-50)]/80">
                    <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                      <span itemProp="streetAddress">Sheikh Zayed Road</span>
                      <br />
                      <span itemProp="addressLocality">Dubai</span>,{' '}
                      <span itemProp="addressCountry">UAE</span>
                    </div>
                  </div>
                </li>

                {/* Phone */}
                <li className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <a
                    href="tel:+97145551234"
                    className="text-tagline-2 text-[var(--primary-50)]/80 hover:text-primary-500 transition-colors"
                    itemProp="telephone"
                  >
                    +971 4 XXX XXXX
                  </a>
                </li>

                {/* Email */}
                <li className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <a
                    href="mailto:info@repairconnect.ae"
                    className="text-tagline-2 text-[var(--primary-50)]/80 hover:text-primary-500 transition-colors"
                    itemProp="email"
                  >
                    info@repairconnect.ae
                  </a>
                </li>

                {/* Working Hours */}
                <li className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-tagline-2 text-[var(--primary-50)]/80">
                    <div>Mon - Fri: 8:00 AM - 6:00 PM</div>
                    <div>Sat: 9:00 AM - 2:00 PM</div>
                    <div>Sun: Closed</div>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Section (Optional - Placeholder) */}
          <motion.div
            className="mt-12 pt-8 border-t border-[var(--accent)]/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="font-bold text-heading-6 mb-2">Stay Updated</h3>
              <p className="text-[var(--primary-50)]/80 text-tagline-2 mb-4">
                Subscribe to our newsletter for car maintenance tips, special offers, and updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-white placeholder-[var(--primary-50)]/40 focus:outline-none focus:ring-2 focus:ring-primary-500 text-tagline-2"
                  aria-label="Email for newsletter"
                />
                <button
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors text-tagline-2 whitespace-nowrap"
                  type="button"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            className="mt-12 pt-8 border-t border-[var(--accent)]/10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-tagline-2 text-[var(--primary-50)]/60">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                href="/privacy"
                className="text-tagline-2 text-[var(--primary-50)]/60 hover:text-primary-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-tagline-2 text-[var(--primary-50)]/60 hover:text-primary-500 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-tagline-2 text-[var(--primary-50)]/60 hover:text-primary-500 transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </>
  );
}
