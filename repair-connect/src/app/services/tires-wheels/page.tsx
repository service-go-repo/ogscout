import React from 'react';
import Link from 'next/link';
import { Disc, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
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
  serviceName: 'Tires & Wheels',
  serviceSlug: 'tires-wheels',
  description:
    'Expert tire and wheel services in Dubai. From tire replacement to wheel alignment and balancing, our verified workshops provide professional solutions for all your tire and wheel needs.',
  keywords: [
    'tire change dubai',
    'wheel alignment dubai',
    'tire shop near me dubai',
    'wheel balancing dubai',
    'puncture repair dubai',
    'alloy wheel repair dubai',
  ],
  commonProblems: [
    'Flat tire',
    'Puncture repair',
    'Tire wear',
    'Wheel misalignment',
    'Vibration issues',
    'Rim damage',
    'Low tire pressure',
    'Tire rotation needed',
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
    question: 'How much does tire replacement cost in Dubai?',
    answer:
      'Tire costs vary by brand, size, and type. Budget tires start from AED 200 per tire, mid-range from AED 350-600, while premium and performance tires range from AED 700 to AED 2,000+ per tire. Request quotes through Repair Connect for specific pricing.',
  },
  {
    question: 'How long does tire change and alignment take?',
    answer:
      'Tire replacement takes 30-45 minutes for all four tires. Wheel alignment takes an additional 30-60 minutes. Balancing is included with new tire installation and takes about 15 minutes per wheel.',
  },
  {
    question: 'How often should I replace my tires?',
    answer:
      'Tires typically last 40,000-80,000 km depending on driving conditions and tire quality. Replace tires when tread depth reaches 3mm or less, or if you notice uneven wear, cracks, or bulges. Regular inspections help ensure safety.',
  },
  {
    question: 'What is wheel alignment and why is it important?',
    answer:
      'Wheel alignment adjusts the angles of your wheels to manufacturer specifications. Proper alignment ensures even tire wear, better fuel efficiency, and safer handling. Get alignment checked if you notice pulling, uneven wear, or steering issues.',
  },
  {
    question: 'Can punctured tires be repaired?',
    answer:
      'Most punctures in the tread area can be repaired if they are smaller than 6mm and not near the sidewall. Sidewall damage usually requires tire replacement. Our workshops will inspect and advise on the best solution.',
  },
  {
    question: 'Do you offer mobile tire services?',
    answer:
      'Yes, many workshops on Repair Connect offer mobile tire services including puncture repair and tire replacement at your location. This is convenient for emergencies or busy schedules.',
  },
];

export const metadata = generateServiceMetadata(serviceData);

export default function TiresWheelsServicePage() {
  const serviceSchema = generateServiceSchema(serviceData);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Services', url: '/services' },
    { name: 'Tires & Wheels', url: '/services/tires-wheels' },
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
                { name: 'Tires & Wheels', url: '/services/tires-wheels' },
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Disc className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      Tire & Wheel Services
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                    Professional{' '}
                    <span className="text-primary">Tire & Wheel Services</span> in Dubai
                  </h1>

                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    Connect with verified tire shops for expert tire replacement, wheel alignment,
                    balancing, and puncture repair. Get instant quotes and keep your car rolling
                    smoothly.
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
                        <Disc className="h-16 w-16 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold">Quick & Easy Process</h3>
                        <p className="text-sm text-muted-foreground">
                          Submit your request and receive quotes from top tire shops in minutes
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
                Common Tire & Wheel Issues We Fix
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our network of expert tire specialists can handle any tire or wheel problem
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
                Get your tires serviced in three simple steps
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
                    Describe your tire or wheel issue and upload photos if needed. Takes less than
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
                    Compare detailed quotes from verified tire shops with transparent pricing
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
                    Choose the best quote and book your appointment. Get your tires serviced with
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
                      Ready to Service Your Tires?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Get instant quotes from verified tire specialists in Dubai. Fast,
                      reliable, and safe tire services.
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
