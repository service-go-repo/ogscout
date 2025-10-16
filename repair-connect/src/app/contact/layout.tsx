import { generatePageMetadata } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Contact Repair Connect - Get in Touch',
  description: 'Contact Repair Connect for any questions about car repair services in Dubai. Our team is here to help. Phone: +971-4-XXX-XXXX, Email: info@repairconnect.ae',
  keywords: [
    'contact repair connect',
    'car repair support dubai',
    'workshop help',
    'customer service',
    'contact us',
    'dubai car repair contact',
  ],
  path: '/contact',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
