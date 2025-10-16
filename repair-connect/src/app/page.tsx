import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Car,
  Paintbrush,
  Zap,
  Disc,
  Settings,
  CheckCircle,
  Star,
  Users,
  Clock,
  Shield,
  ArrowRight,
  Camera,
  Calculator,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection, StaggerContainer, StaggerItem, staggerItemVariants, HoverScale } from '@/components/shared/AnimatedSection';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StructuredData } from '@/components/seo/StructuredData';
import { generatePageMetadata, generateLocalBusinessSchema, SERVICE_CATEGORIES } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'Find Trusted Car Repair Workshops in Dubai',
  description: 'Connect with verified car repair workshops in Dubai. Get instant quotes, compare services for mechanical, bodywork, painting, electrical, tires & maintenance. Book with confidence.',
  keywords: [
    'car repair dubai',
    'auto workshop dubai',
    'car service dubai',
    'mechanic dubai',
    'car repair quotes',
    'trusted workshops',
    'instant quotes',
  ],
  path: '/',
});

const localBusinessSchema = generateLocalBusinessSchema();

const trustIndicators = [
  { icon: Users, label: '10,000+ Happy Customers' },
  { icon: Shield, label: 'Verified Workshops' },
  { icon: Clock, label: 'Instant Quotes' },
  { icon: Star, label: '24/7 Support' },
];

const howItWorksSteps = [
  {
    icon: Camera,
    title: 'Choose Service Type',
    description: 'Select from mechanical, bodywork, painting, electrical, tires & wheels, or maintenance services for your car.',
  },
  {
    icon: Calculator,
    title: 'Compare Quotes',
    description: 'Receive instant quotes from verified workshops. Compare prices, ratings, and services in seconds.',
  },
  {
    icon: Calendar,
    title: 'Book & Track',
    description: 'Choose your preferred workshop and book an appointment. Track your repair status in real-time.',
  },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Customers' },
  { icon: Shield, value: '500+', label: 'Verified Workshops' },
  { icon: Clock, value: '< 24h', label: 'Average Response' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
];

const featuredWorkshops = [
  {
    name: 'Al Quoz Auto Center',
    rating: 4.9,
    reviews: 234,
    specialty: 'Mechanical & Electrical',
    location: 'Al Quoz Industrial Area',
    responseTime: '< 2 hours',
  },
  {
    name: 'Dubai Paint Masters',
    rating: 4.8,
    reviews: 189,
    specialty: 'Paint & Bodywork',
    location: 'Deira',
    responseTime: '< 3 hours',
  },
  {
    name: 'Premium Auto Service',
    rating: 4.9,
    reviews: 312,
    specialty: 'Full Service & Maintenance',
    location: 'Jumeirah',
    responseTime: '< 1 hour',
  },
];

export default function HomePage() {
  const serviceIcons = {
    wrench: Wrench,
    car: Car,
    paintbrush: Paintbrush,
    zap: Zap,
    disc: Disc,
    settings: Settings,
  };

  return (
    <>
      <StructuredData data={localBusinessSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background via-muted/20 to-background py-20 lg:py-32 border-b overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection direction="left">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <Badge variant="outline" className="border-primary text-primary px-4 py-2">
                      🚗 Dubai's #1 Workshop Matching Platform
                    </Badge>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                      Find the{' '}
                      <span className="text-primary relative">
                        Right Workshop
                        <svg
                          className="absolute -bottom-2 left-0 w-full"
                          height="8"
                          viewBox="0 0 200 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 5.5C30 2.5 60 1 100 1C140 1 170 2.5 199 5.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="text-primary"
                          />
                        </svg>
                      </span>{' '}
                      for Your Car in Seconds
                    </h1>

                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                      Connect with trusted repair workshops across Dubai. Get instant quotes, compare services, and book with confidence. From mechanical repairs to bodywork, we've got you covered.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="xl" asChild className="shadow-lg shadow-primary/20 group">
                      <Link href="/workshops">
                        Find a Workshop
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="xl" asChild>
                      <Link href="/auth/workshop/register">Join as Workshop</Link>
                    </Button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-6 pt-4">
                    {trustIndicators.map((indicator, index) => {
                      const IconComponent = indicator.icon;
                      return (
                        <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <span>{indicator.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="right" delay={0.2}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-2xl opacity-50" />
                  <Card className="border-2 shadow-2xl relative bg-background/95 backdrop-blur">
                    <CardContent className="p-8 sm:p-12">
                      <div className="space-y-6">
                        <div className="h-32 w-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border-2 border-primary/20">
                          <TrendingUp className="h-16 w-16 text-primary" />
                        </div>
                        <div className="text-center space-y-3">
                          <p className="text-2xl font-bold text-foreground">
                            Get Matched Instantly
                          </p>
                          <p className="text-muted-foreground">
                            Quick, transparent, and hassle-free
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <div className="flex -space-x-2">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-8 w-8 rounded-full bg-primary/20 border-2 border-background"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              +10k customers served
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Service Categories Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Our Services"
                title="All Car Services in One Place"
                subtitle="From mechanical repairs to maintenance, find specialized workshops for every service type"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {SERVICE_CATEGORIES.map((service, index) => {
                const IconComponent = serviceIcons[service.icon as keyof typeof serviceIcons];

                return (
                  <StaggerItem key={service.slug} variants={staggerItemVariants}>
                    <HoverScale>
                      <Link href={`/services/${service.slug}`}>
                        <Card className="h-full border-2 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer">
                          <CardHeader>
                            <div className="h-14 w-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-4">
                              <IconComponent className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {service.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="text-base">
                              {service.description}
                            </CardDescription>
                            <div className="mt-4 flex items-center text-sm text-primary font-medium">
                              Explore workshops
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </HoverScale>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* How It Works Teaser */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Simple Process"
                title="How Repair Connect Works"
                subtitle="Get your car serviced in three simple steps. Fast, reliable, and transparent."
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {howItWorksSteps.map((step, index) => {
                const IconComponent = step.icon;

                return (
                  <StaggerItem key={index} variants={staggerItemVariants}>
                    <Card className="text-center border-2 h-full relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform" />
                      <CardHeader className="relative">
                        <div className="mx-auto mb-4 relative">
                          <div className="h-20 w-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mx-auto">
                            <IconComponent className="h-10 w-10 text-primary" />
                          </div>
                          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="relative">
                        <CardDescription className="text-base">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <AnimatedSection delay={0.4}>
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" asChild>
                  <Link href="/how-it-works">
                    Learn More About Our Process
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Featured Workshops */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Top Rated"
                title="Featured Workshops"
                subtitle="Connect with Dubai's most trusted and highly-rated repair workshops"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {featuredWorkshops.map((workshop, index) => (
                <StaggerItem key={index} variants={staggerItemVariants}>
                  <HoverScale>
                    <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{workshop.name}</CardTitle>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            {workshop.rating}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{workshop.reviews} reviews</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Wrench className="h-4 w-4 text-primary" />
                            <span>{workshop.specialty}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="h-4 w-4 text-primary" />
                            <span>{workshop.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Response: {workshop.responseTime}</span>
                          </div>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          View Workshop
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverScale>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <AnimatedSection delay={0.4}>
              <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link href="/workshops">
                    Browse All Workshops
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <SectionHeader
                title="Trusted by Thousands"
                subtitle="Join Dubai's fastest-growing car repair community"
                centered
                className="text-primary-foreground [&_h2]:text-primary-foreground [&_p]:text-primary-foreground/90"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;

                return (
                  <StaggerItem key={index} variants={staggerItemVariants}>
                    <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur text-center">
                      <CardContent className="pt-8 pb-6">
                        <IconComponent className="h-8 w-8 mx-auto mb-4" />
                        <div className="text-4xl font-bold mb-2">{stat.value}</div>
                        <div className="text-sm text-primary-foreground/80">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <Card className="border-2 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10" />
                <CardContent className="p-12 sm:p-16 text-center relative">
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="space-y-4">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                        Start Your Car Service Journey Today
                      </h2>
                      <p className="text-lg sm:text-xl text-muted-foreground">
                        Join thousands of satisfied customers who trust Repair Connect for their car repair needs across Dubai.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="xl" asChild className="shadow-lg shadow-primary/20">
                        <Link href="/service-requests/new">
                          Get Started Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="xl" asChild>
                        <Link href="/about">Learn More About Us</Link>
                      </Button>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>No registration required to browse workshops</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  );
}
