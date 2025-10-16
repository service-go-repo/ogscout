import React from 'react';
import Link from 'next/link';
import { MapPin, Wrench, Car, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  generateLocationMetadata,
  generateLocationSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo-utils';

// SEO Metadata
const locationData = {
  locationName: 'Al Quoz',
  locationSlug: 'al-quoz',
  area: 'Al Quoz Industrial Area',
  landmarks: ['Sheikh Zayed Road', 'Alserkal Avenue', 'Dubai Autodrome', 'Mall of the Emirates'],
  description:
    'Find trusted car repair workshops in Al Quoz, Dubai - the automotive hub of the city. Compare quotes from verified mechanics for all car services including mechanical, bodywork, painting, and more.',
};

export const metadata = generateLocationMetadata(locationData);

const services = [
  {
    name: 'Mechanical Repair',
    icon: Wrench,
    slug: 'mechanical',
    description: 'Engine, transmission, brake, and AC repair',
  },
  {
    name: 'Bodywork & Collision',
    icon: Car,
    slug: 'bodywork',
    description: 'Dent repair, accident damage, bumper work',
  },
  {
    name: 'Car Painting',
    icon: Car,
    slug: 'painting',
    description: 'Full paint jobs, scratch repair, detailing',
  },
  {
    name: 'Electrical Services',
    icon: Wrench,
    slug: 'electrical',
    description: 'Battery, alternator, wiring repairs',
  },
  {
    name: 'Tires & Wheels',
    icon: Car,
    slug: 'tires-wheels',
    description: 'Tire change, alignment, balancing',
  },
  {
    name: 'Car Maintenance',
    icon: Wrench,
    slug: 'maintenance',
    description: 'Oil change, servicing, inspections',
  },
];

export default function AlQuozLocationPage() {
  const locationSchema = generateLocationSchema(locationData);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Locations', url: '/locations' },
    { name: 'Dubai', url: '/locations/dubai' },
    { name: 'Al Quoz', url: '/locations/dubai/al-quoz' },
  ]);

  return (
    <>
      <StructuredData data={locationSchema} />
      <StructuredData data={breadcrumbSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background to-muted/20 py-16 lg:py-24 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs
              items={[
                { name: 'Locations', url: '/locations' },
                { name: 'Dubai', url: '/locations/dubai' },
                { name: 'Al Quoz', url: '/locations/dubai/al-quoz' },
              ]}
            />

            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Al Quoz, Dubai</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Car Workshops in{' '}
                  <span className="text-primary">Al Quoz</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Al Quoz is Dubai's automotive service hub, home to hundreds of trusted repair
                  workshops. Located just off Sheikh Zayed Road, find expert mechanics for all
                  your car repair needs - from quick fixes to major overhauls.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="xl" asChild className="shadow-lg shadow-primary/20">
                  <Link href="/service-requests/new">
                    Get Instant Quotes <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link href="/workshops">Browse Workshops</Link>
                </Button>
              </div>

              {/* Local Features */}
              <div className="flex flex-wrap justify-center gap-6 pt-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>100+ Workshops</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Same-Day Service Available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Easy Access from SZR</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Al Quoz Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Why Al Quoz for Car Repairs?</h2>
                    </div>

                    <div className="prose prose-lg max-w-none text-muted-foreground">
                      <p>
                        Al Quoz Industrial Area is Dubai's premier automotive service district,
                        conveniently located between Sheikh Zayed Road and Al Khail Road. The area
                        is renowned for its concentration of specialized car repair workshops,
                        spare parts suppliers, and automotive service centers.
                      </p>
                      <p>
                        Whether you're coming from Downtown Dubai, Jumeirah, or Business Bay, Al
                        Quoz is easily accessible and offers competitive pricing thanks to the high
                        concentration of workshops. Many facilities here service luxury brands,
                        classic cars, and commercial vehicles.
                      </p>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-semibold mb-3">Nearby Landmarks:</h3>
                      <div className="flex flex-wrap gap-2">
                        {locationData.landmarks.map((landmark, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-4 py-2 border-2"
                          >
                            {landmark}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Available Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Services Available in Al Quoz
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Find specialized workshops for every type of car repair and maintenance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, index) => {
                const IconComponent = service.icon;

                return (
                  <Card
                    key={index}
                    className="hover:border-primary/50 hover:shadow-lg transition-all group"
                  >
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-4">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {service.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base mb-4">
                        {service.description}
                      </CardDescription>
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link href={`/services/${service.slug}`}>
                          Learn More <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Workshop Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="border-2 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">100+</div>
                      <div className="text-sm text-muted-foreground">Verified Workshops</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">4.8</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        Average Rating
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">2,500+</div>
                      <div className="text-sm text-muted-foreground">Cars Serviced Monthly</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                      <div className="text-sm text-muted-foreground">Emergency Services</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How to Get Here Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Getting to Al Quoz
                </h2>
                <p className="text-lg text-muted-foreground">
                  Easy access from anywhere in Dubai
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>By Car</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Exit Sheikh Zayed Road at Al Quoz or Al Khail Road</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>10 minutes from Downtown Dubai</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Ample parking available at all workshops</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>By Public Transport</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Metro: Business Bay or Mall of the Emirates stations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Bus routes: 8, 10, 88, F33 serve the area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Taxi or RTA services readily available</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-2 shadow-xl max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                      Book Your Car Service in Al Quoz Today
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Compare quotes from multiple verified workshops in Al Quoz. Get the best
                      price and service for your car repair needs.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="xl" asChild className="shadow-lg shadow-primary/20">
                      <Link href="/service-requests/new">
                        Request Quotes Now <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="xl" asChild>
                      <Link href="/workshops">View All Workshops</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
