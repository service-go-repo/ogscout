import React from 'react';
import Link from 'next/link';
import { Settings, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
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
  serviceName: 'Car Maintenance & Servicing',
  serviceSlug: 'maintenance',
  description:
    'Expert car maintenance and servicing in Dubai. From oil changes to full inspections and scheduled maintenance, our verified workshops keep your car running smoothly with professional care.',
  keywords: [
    'car service dubai',
    'car maintenance dubai',
    'oil change dubai',
    'car inspection dubai',
    'car service center dubai',
    'scheduled maintenance dubai',
  ],
  commonProblems: [
    'Oil change needed',
    'Brake pad replacement',
    'Air filter change',
    'Spark plug replacement',
    'Fluid top-ups',
    'AC servicing',
    'Pre-purchase inspection',
    'Scheduled service',
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
    question: 'How much does car service cost in Dubai?',
    answer:
      'Service costs vary by package and car model. Basic oil change starts from AED 150, minor service from AED 400-800, while major service ranges from AED 1,000 to AED 3,000. Request quotes through Repair Connect for detailed pricing based on your car.',
  },
  {
    question: 'How often should I service my car?',
    answer:
      'Most manufacturers recommend service every 10,000-15,000 km or every 6-12 months, whichever comes first. Check your owner\'s manual for specific intervals. Regular maintenance prevents costly repairs and maintains warranty.',
  },
  {
    question: 'What is included in a car service?',
    answer:
      'Basic service includes oil change, oil filter, multi-point inspection. Full service adds air filter, spark plugs, brake check, fluid top-ups, and comprehensive diagnostics. Our workshops provide detailed service checklists.',
  },
  {
    question: 'Can I maintain my warranty at independent workshops?',
    answer:
      'Yes, you can maintain your manufacturer warranty by servicing at independent workshops if they use genuine or approved parts and follow manufacturer specifications. Our verified workshops meet these requirements.',
  },
  {
    question: 'What is a pre-purchase inspection?',
    answer:
      'A pre-purchase inspection is a comprehensive check performed before buying a used car. It includes engine, transmission, suspension, electronics, and body inspection to identify potential issues. This helps you make informed buying decisions.',
  },
  {
    question: 'Do you offer pickup and delivery service?',
    answer:
      'Many workshops on Repair Connect offer complimentary pickup and delivery within certain areas. This convenient service allows you to get your car serviced without disrupting your schedule.',
  },
];

export const metadata = generateServiceMetadata(serviceData);

export default function MaintenanceServicePage() {
  const serviceSchema = generateServiceSchema(serviceData);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Services', url: '/services' },
    { name: 'Car Maintenance & Servicing', url: '/services/maintenance' },
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
                { name: 'Car Maintenance & Servicing', url: '/services/maintenance' },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Settings className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Maintenance Services
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Professional{' '}
                    <span className="text-primary">Car Maintenance & Servicing</span> in Dubai
                  </h1>

                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    Connect with verified service centers for expert oil changes, inspections,
                    scheduled maintenance, and preventive care. Get instant quotes and keep your
                    car in perfect condition.
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
                        <Settings className="h-16 w-16 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold">Quick & Easy Process</h3>
                        <p className="text-sm text-muted-foreground">
                          Submit your request and receive quotes from top service centers in minutes
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
                Common Maintenance Services We Provide
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our network of expert technicians provides comprehensive maintenance for all vehicles
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
                Get your car serviced in three simple steps
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
                    Describe your maintenance needs and select your service type. Takes less than
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
                    Compare detailed quotes from verified service centers with transparent pricing
                    and timelines.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-2">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Book & Get Serviced</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Choose the best quote and book your appointment. Get your car serviced with
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
                      Ready to Service Your Car?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Get instant quotes from verified service centers in Dubai. Fast,
                      reliable, and comprehensive maintenance.
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
