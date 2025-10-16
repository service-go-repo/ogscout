import React from 'react';
import Link from 'next/link';
import { Zap, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
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
  serviceName: 'Electrical Repair',
  serviceSlug: 'electrical',
  description:
    'Expert car electrical repair services in Dubai. From battery replacement to alternator repair and wiring issues, our verified workshops solve all electrical problems with professional diagnostic services.',
  keywords: [
    'car battery replacement dubai',
    'car electrical repair dubai',
    'alternator replacement dubai',
    'starter motor repair dubai',
    'car wiring repair dubai',
    'car battery change near me',
  ],
  commonProblems: [
    'Battery replacement',
    'Alternator failure',
    'Starter motor issues',
    'Wiring problems',
    'Headlight repair',
    'Power window failure',
    'Central locking issues',
    'Audio system problems',
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
    question: 'How much does battery replacement cost in Dubai?',
    answer:
      'Battery replacement costs vary by car model and battery type. Standard batteries range from AED 250 to AED 500, while premium or AGM batteries can cost AED 600 to AED 1,200. Request quotes through Repair Connect for accurate pricing.',
  },
  {
    question: 'How long does electrical repair take?',
    answer:
      'Battery replacement takes 30 minutes, alternator or starter motor replacement takes 1-3 hours, while complex wiring diagnostics can take several hours to a full day. Our workshops provide time estimates after diagnosis.',
  },
  {
    question: 'How do I know if my alternator is failing?',
    answer:
      'Common signs include dimming lights, battery warning light on dashboard, difficulty starting, strange noises, or electrical accessories not working properly. Book a diagnostic check for accurate assessment.',
  },
  {
    question: 'Can you repair electrical issues on all car makes?',
    answer:
      'Yes, our verified workshops have specialists for all major brands including European, Asian, and American vehicles. They use brand-specific diagnostic tools for accurate fault detection and repair.',
  },
  {
    question: 'Do workshops offer mobile battery replacement?',
    answer:
      'Many workshops on Repair Connect offer mobile battery replacement services where technicians come to your location. This is convenient for emergency battery changes or busy schedules.',
  },
  {
    question: 'What warranty do you offer on electrical repairs?',
    answer:
      'Warranties vary by workshop and component. Battery warranties typically range from 6-24 months, while alternator and starter motor repairs include 3-12 months warranty. Details are provided in each quote.',
  },
];

export const metadata = generateServiceMetadata(serviceData);

export default function ElectricalServicePage() {
  const serviceSchema = generateServiceSchema(serviceData);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Services', url: '/services' },
    { name: 'Electrical Repair', url: '/services/electrical' },
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
                { name: 'Electrical Repair', url: '/services/electrical' },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Electrical Services
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Professional{' '}
                    <span className="text-primary">Electrical Repair</span> in Dubai
                  </h1>

                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    Connect with verified workshops for expert battery replacement, alternator
                    repair, wiring fixes, and all electrical needs. Get instant quotes and restore
                    your car's power.
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
                        <Zap className="h-16 w-16 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold">Quick & Easy Process</h3>
                        <p className="text-sm text-muted-foreground">
                          Submit your request and receive quotes from top electrical specialists in minutes
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
                Common Electrical Issues We Fix
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our network of expert electricians can handle any electrical problem your vehicle faces
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
                Get your car repaired in three simple steps
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
                    Describe your electrical issue and upload photos if needed. Takes less than
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
                    Compare detailed quotes from verified electrical specialists with transparent pricing
                    and timelines.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-2">
                <CardHeader>
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <CardTitle>Book & Get Fixed</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Choose the best quote and book your appointment. Get your car fixed with
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
                      Ready to Fix Your Car?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Get instant quotes from verified electrical specialists in Dubai. Fast,
                      reliable, and transparent pricing.
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
