import React from 'react';
import Link from 'next/link';
import { Paintbrush, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  generateServiceMetadata,
  generateServiceSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo-utils';

// SEO Metadata
const serviceData = {
  serviceName: 'Car Painting & Detailing',
  serviceSlug: 'painting',
  description:
    'Expert car painting and detailing services in Dubai. From full paint jobs to scratch repair and ceramic coating, our verified workshops deliver flawless finishes with professional spray painting services.',
  keywords: [
    'car painting dubai',
    'car spray painting dubai',
    'full car paint job dubai',
    'scratch paint repair dubai',
    'car detailing dubai',
    'ceramic coating dubai',
  ],
  commonProblems: [
    'Faded paint',
    'Scratch repair',
    'Paint chips',
    'Color change',
    'Bumper painting',
    'Panel painting',
    'Clear coat damage',
    'Paint oxidation',
  ],
  brands: [
    'Toyota',
    'BMW',
    'Mercedes-Benz',
    'Nissan',
    'Honda',
    'Ford',
    'Chevrolet',
    'Audi',
    'Volkswagen',
    'Hyundai',
    'Kia',
    'Lexus',
    'Tesla',
    'Range Rover',
  ],
};

const faqs = [
  {
    question: 'How much does car painting cost in Dubai?',
    answer:
      'Painting costs depend on the scope. Small scratch repairs start from AED 200, single panel painting from AED 800, bumper painting from AED 600, while full car paint jobs range from AED 3,000 to AED 12,000. Request quotes through Repair Connect for accurate pricing.',
  },
  {
    question: 'How long does a full paint job take?',
    answer:
      'Small touch-ups take 1-2 hours, single panel painting takes 1-2 days, while a complete car paint job typically takes 5-7 days including preparation, painting, and curing time. Our workshops provide accurate timelines.',
  },
  {
    question: 'What types of paint finishes are available?',
    answer:
      'Workshops offer various finishes including standard gloss, metallic, pearl, matte, and satin. Each finish has different pricing and maintenance requirements. Consult with our verified painters for recommendations.',
  },
  {
    question: 'How long does new paint last?',
    answer:
      'Quality paint jobs last 5-10 years with proper care. Longevity depends on paint quality, application technique, and maintenance. All our workshops use premium paints and provide warranties on their work.',
  },
  {
    question: 'Do you offer ceramic coating and PPF?',
    answer:
      'Yes, many workshops on Repair Connect offer ceramic coating for paint protection and PPF (Paint Protection Film) installation. These services help preserve your paint and maintain resale value.',
  },
  {
    question: 'Can I change my car color completely?',
    answer:
      'Yes, full color changes are possible and popular. Note that color changes require RTA registration updates in Dubai. Our workshops can guide you through the legal process and paperwork required.',
  },
];

export const metadata = generateServiceMetadata(serviceData);

export default function PaintingServicePage() {
  const serviceSchema = generateServiceSchema(serviceData);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Services', url: '/services' },
    { name: 'Car Painting & Detailing', url: '/services/painting' },
  ]);

  return (
    <>
      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background to-muted/20 py-16 lg:py-24 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[
                { name: 'Services', url: '/services' },
                { name: 'Car Painting & Detailing', url: '/services/painting' },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Paintbrush className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Painting Services
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Professional{' '}
                    <span className="text-primary">Car Painting & Detailing</span> in Dubai
                  </h1>

                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    Connect with verified paint shops for expert spray painting, full paint jobs,
                    scratch repair, and ceramic coating. Get instant quotes and give your car a
                    flawless finish.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="xl" asChild className="shadow-lg shadow-primary/20">
                    <Link href="/service-requests/new">
                      Get Instant Quotes <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="xl" asChild>
                    <Link href="/locations/dubai">
                      <MapPin className="mr-2 h-5 w-5" />
                      Find Workshops Near You
                    </Link>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Verified Workshops</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Warranty Included</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Card className="border-2 shadow-xl">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="h-32 w-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Paintbrush className="h-16 w-16 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold">Quick & Easy Process</h3>
                        <p className="text-sm text-muted-foreground">
                          Submit your request and receive quotes from top paint shops in minutes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Common Problems Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Common Painting Issues We Fix
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our network of expert painters can handle any paint work your vehicle needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {serviceData.commonProblems.map((problem, index) => (
                <Card
                  key={index}
                  className="hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {problem}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your car painted in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="text-center border-2">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle>Submit Your Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Describe your painting needs and upload photos if needed. Takes less than
                    2 minutes.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-2">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <CardTitle>Receive Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Compare detailed quotes from verified paint shops with transparent pricing
                    and timelines.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-2">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Book & Get Painted</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Choose the best quote and book your appointment. Get your car painted with
                    warranty.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Brands We Service */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                All Brands Welcome
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our workshops specialize in servicing all major car brands
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {serviceData.brands.map((brand, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-6 py-3 text-base border-2 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection faqs={faqs} />

        {/* CTA Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-2 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-12 text-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                      Ready to Paint Your Car?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Get instant quotes from verified painting specialists in Dubai. Fast,
                      reliable, and flawless finishes.
                    </p>
                  </div>
                  <Button size="xl" asChild className="shadow-lg shadow-primary/20">
                    <Link href="/service-requests/new">
                      Request Quotes Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
