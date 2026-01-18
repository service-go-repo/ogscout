import React from 'react';
import Link from 'next/link';
import Script from 'next/script'
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
    features: [
      { name: 'Fast Response Time', available: true },
      { name: 'Certified Technicians', available: true },
      { name: 'Free Inspection', available: true },
      { name: 'Warranty on Repairs', available: true },
      { name: 'Emergency Service', available: false },
      { name: 'Pick-up & Drop-off', available: false },
    ],
  },
  {
    name: 'Dubai Paint Masters',
    rating: 4.8,
    reviews: 189,
    specialty: 'Paint & Bodywork',
    location: 'Deira',
    responseTime: '< 3 hours',
    features: [
      { name: 'Premium Paint Quality', available: true },
      { name: 'Color Matching', available: true },
      { name: 'Dent Removal', available: true },
      { name: 'Insurance Claims', available: true },
      { name: 'Detailing Service', available: false },
      { name: 'Same-Day Service', available: false },
    ],
  },
  {
    name: 'Premium Auto Service',
    rating: 4.9,
    reviews: 312,
    specialty: 'Full Service & Maintenance',
    location: 'Jumeirah',
    responseTime: '< 1 hour',
    features: [
      { name: 'Comprehensive Service', available: true },
      { name: 'Luxury Car Specialist', available: true },
      { name: 'Loaner Car Available', available: true },
      { name: 'Premium Location', available: true },
      { name: 'VIP Service', available: true },
      { name: 'Express Service', available: true },
    ],
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
      <Script src="/js/stack-card.min.js" strategy="afterInteractive"/>
      <StructuredData data={localBusinessSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background via-background-3/20 dark:via-background-7/20 to-background py-20 lg:py-32 border-b overflow-hidden">
          {/* Dotted Grid Background */}
          <figure className="absolute animate-pulse -z-10 max-w-[1365px] -top-5 left-[50%] translate-x-[-50%] w-full h-full overflow-hidden">
            <img
              src="/images/dotted-grid-light.svg"
              alt="Decorative background pattern"
              className="size-full object-cover dark:hidden"
            />
            <img
              src="/images/dotted-grid-dark.svg"
              alt="Decorative background pattern"
              className="size-full object-cover hidden dark:inline-block"
            />
          </figure>

          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection direction="left">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <Badge variant="outline" className="border-primary-500 text-primary-500 px-4 py-2">
                      🚗 Dubai's #1 Workshop Matching Platform
                    </Badge>

                    <h1 className="text-heading-4 sm:text-heading-3 md:text-heading-2 xl:text-heading-1 font-medium text-secondary dark:text-accent leading-tight">
                      Find the{' '}
                      <span className="text-primary-500 relative">
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
                            className="text-primary-500"
                          />
                        </svg>
                      </span>{' '}
                      for Your Car in Seconds
                    </h1>

                    <p className="text-lg sm:text-xl text-secondary/60 dark:text-accent/60 max-w-2xl">
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
                        <div key={index} className="flex items-center gap-2 text-sm text-secondary/60 dark:text-accent/60">
                          <div className="h-8 w-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-primary-500" />
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
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-primary-500/20 rounded-2xl blur-2xl opacity-50" />
                  <Card className="border-2 shadow-2xl relative bg-background-2 dark:bg-background-5/95 backdrop-blur">
                    <CardContent className="p-8 sm:p-12">
                      <div className="space-y-6">
                        <div className="h-32 w-32 mx-auto bg-gradient-to-br from-primary-500/20 to-primary-500/5 rounded-full flex items-center justify-center border-2 border-primary-500/20">
                          <TrendingUp className="h-16 w-16 text-primary-500" />
                        </div>
                        <div className="text-center space-y-3">
                          <p className="text-2xl font-bold text-secondary dark:text-accent">
                            Get Matched Instantly
                          </p>
                          <p className="text-secondary/60 dark:text-accent/60">
                            Quick, transparent, and hassle-free
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <div className="flex -space-x-2">
                              {[...Array(4)].map((_, i) => (
                                <div
                                  key={i}
                                  className="h-8 w-8 rounded-full bg-primary-500/20 border-2 border-background"
                                />
                              ))}
                            </div>
                            <span className="text-sm text-secondary/60 dark:text-accent/60">
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
        <section className="relative py-[50px] md:py-[80px] lg:py-[100px] bg-background-2 dark:bg-background-5" aria-label="Our Services section">
          <div className="main-container container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-12 xl:gap-[60px] gap-y-12 items-start">
              {/* Left Column - Sticky Header */}
              <div className="col-span-12 xl:col-span-6 lg:sticky lg:top-28">
                <AnimatedSection direction="left">
                  <div className="space-y-7 xl:text-left text-center">
                    <div className="space-y-3">
                      <h2 className="xl:max-w-[629px] w-full xl:mx-0 mx-auto text-heading-5 sm:text-heading-4 md:text-heading-3 lg:text-heading-2 text-secondary dark:text-accent">
                        All Car Services in One Place
                      </h2>
                      <p className="xl:max-w-[544px] text-lg text-secondary/60 dark:text-accent/60">
                        From mechanical repairs to maintenance, find specialized workshops for every service type. We connect you with verified experts across Dubai.
                      </p>
                    </div>
                    <div className="w-full">
                      <Button size="lg" asChild className="shadow-lg shadow-primary/20 w-[85%] md:w-auto">
                        <Link href="/workshops">
                          <span>Get started now</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              {/* Right Column - Stack Cards */}
              <div className="col-span-12 xl:col-span-6">
                <div className="stack-cards js-stack-cards xl:max-w-full max-w-[820px] xl:mx-0 mx-auto">
                  {SERVICE_CATEGORIES.map((service, index) => {
                    const IconComponent = serviceIcons[service.icon as keyof typeof serviceIcons];

                    // Different decorative border configurations for each card
                    const borderConfigs = [
                      { top: 'top-[-62%] md:-top-[85%]', left: 'left-[-48%] md:-left-[68%]', rotate: 'rotate-[312deg]', size: 'md:size-[800px] size-[500px]' },
                      { top: 'top-[-127%] md:-top-[130%]', left: 'left-[-103%] md:-left-[79%]', rotate: 'rotate-[255deg]', size: 'size-[800px] md:size-[1000px]' },
                      { top: 'top-[-127%] md:-top-[130%]', left: 'left-[-107%] md:-left-[88%]', rotate: 'rotate-[240deg]', size: 'size-[800px] md:size-[1000px]' },
                      { top: 'top-[-143%] md:-top-[117%]', left: 'left-[-72%] md:-left-[37%]', rotate: 'rotate-[245deg]', size: 'size-[1000px]' },
                      { top: 'top-[-62%] md:-top-[85%]', left: 'left-[-48%] md:-left-[68%]', rotate: 'rotate-[312deg]', size: 'md:size-[800px] size-[500px]' },
                      { top: 'top-[-127%] md:-top-[130%]', left: 'left-[-103%] md:-left-[79%]', rotate: 'rotate-[255deg]', size: 'size-[800px] md:size-[1000px]' },
                    ];
                    const config = borderConfigs[index % borderConfigs.length];

                    return (
                      <div key={service.slug} className="stack-cards__item js-stack-cards__item p-2 relative rounded-[20px] z-20 flex items-center justify-center sm:max-w-[483px] max-w-full sm:mx-0 mx-auto w-full overflow-hidden">
                        {/* Decorative Border Image */}
                        <figure className={`absolute pointer-events-none ${config.top} ${config.left} -z-10 ${config.rotate} opacity-50 ${config.size} select-none`}>
                          <img src="/images/bg-stack-cards/ns-img-522.png" alt="decorative border" />
                        </figure>

                        {/* Card Content - Wrapped in Link */}
                        <Link href={`/services/${service.slug}`} className="relative z-10 p-8 rounded-[14px] sm:max-w-[467px] max-w-full w-full space-y-6 bg-white dark:bg-black border border-primary-500/10 block group">
                          <div className="space-y-4">
                            <div className="h-14 w-14 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors flex items-center justify-center">
                              <IconComponent className="h-7 w-7 text-primary-500" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-heading-5 text-xl font-bold text-secondary dark:text-accent">
                                {service.name}
                              </p>
                              <p className="text-secondary/60 dark:text-accent/60">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-primary-500 font-medium">
                            Explore workshops
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Teaser */}
        <section className="py-20 bg-background dark:bg-background-6">
          <div className="container clearfix mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-heading-5 sm:text-heading-4 md:text-heading-3 text-secondary dark:text-accent mb-4">
                How Repair Connect Works
              </h2>
              <p className="text-center text-lg text-secondary/60 dark:text-accent/60 max-w-2xl mx-auto">
                Get your car serviced in three simple steps. Fast, reliable, and transparent.
              </p>
            </div>

            <div className="row relative">
              {/* SVG Container */}
              <div id="scb-work-svg-container" className="absolute inset-0 pointer-events-none hidden lg:block">
                <svg
                  id="scb-work-svgC"
                  width="100%"
                  height="100%"
                  viewBox="0 0 620 120"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                >
                  <defs></defs>
                  <path
                    d="M62.9 14.9c-25-7.74-56.6 4.8-60.4 24.3-3.73 19.6 21.6 35 39.6 37.6 42.8 6.2 72.9-53.4 116-58.9 65-18.2 191 101 215 28.8 5-16.7-7-49.1-34-44-34 11.5-31 46.5-14 69.3 9.38 12.6 24.2 20.6 39.8 22.9 91.4 9.05 102-98.9 176-86.7 18.8 3.81 33 17.3 36.7 34.6 2.01 10.2.124 21.1-5.18 30.1"
                    id="squiggle"
                    fill="none"
                    stroke="rgba(0,0,0,0.1)"
                    strokeMiterlimit="10"
                    strokeDashoffset="180"
                    style={{ strokeWidth: 1, strokeDasharray: '5, 10', strokeDashoffset: 10 }}
                  />
                </svg>
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {howItWorksSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const colors = ['text-primary-500', 'text-blue-500', 'text-secondary dark:text-accent'];

                  return (
                    <div key={index} className={`${index > 0 ? 'md:mt-5' : ''}`}>
                      <div className="scb-work-process text-center relative">
                        {/* Loader Animation */}
                        <div className="scb-work-box-loader flex justify-center gap-2 mb-4">
                          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-75"></span>
                          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse delay-150"></span>
                        </div>

                        {/* Step Icon and Number */}
                        <div className="scb-work-step-num-box mb-6 relative inline-block">
                          <div className="scb-work-step-icon mb-4">
                            <span className="inline-block">
                              <IconComponent className={`h-16 w-16 ${colors[index]}`} />
                            </span>
                          </div>
                          <div className="scb-work-step-num absolute -bottom-2 right-0 bg-primary-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                            0{index + 1}
                          </div>
                        </div>

                        {/* Step Description */}
                        <div className="scb-work-step-desc">
                          <h4 className="text-xl font-bold mb-3 text-secondary dark:text-accent">
                            {step.title}
                          </h4>
                          <p className="mb-0 text-secondary/60 dark:text-accent/60">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
        <section className="py-[50px] md:py-[80px] lg:py-[100px] bg-background-2 dark:bg-background-5">
          <div className="main-container container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-[35px] md:space-y-[70px]">
              {/* heading */}
              <div className="space-y-3 text-center">
                <h2
                  id="featured-workshops-heading"
                  data-ns-animate=""
                  data-delay="0.2"
                  className="text-heading-5 sm:text-heading-4 md:text-heading-3 lg:text-heading-2 text-secondary dark:text-accent"
                  style={{opacity: 1, filter: 'blur(0px)', translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px)'}}
                >
                  Featured Workshops
                </h2>
                <p
                  data-ns-animate=""
                  data-delay="0.3"
                  className="text-lg text-secondary/60 dark:text-accent/60"
                  style={{opacity: 1, filter: 'blur(0px)', translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px)'}}
                >
                  Connect with Dubai's most trusted and highly-rated repair workshops
                </p>
              </div>

              <div className="space-y-14">
                {/* cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
                  {featuredWorkshops.map((workshop, index) => {
                    const iconMap = [Wrench, Paintbrush, Settings];
                    const IconComponent = iconMap[index];
                    const delays = ['0.4', '0.5', '0.7'];

                    return (
                      <div
                        key={workshop.name}
                        data-ns-animate=""
                        data-delay={delays[index]}
                        className="p-2.5 rounded-[20px] flex-1 bg-[url('/images/ns-img-25.png')] bg-no-repeat bg-center bg-cover max-lg:w-full"
                        style={{opacity: 1, filter: 'blur(0px)', translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px)'}}
                      >
                        <div className="bg-white dark:bg-black p-8 rounded-xl">
                          <div className="mb-6">
                            <div className="h-[52px] w-[52px] rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                              <IconComponent className="h-7 w-7 text-secondary dark:text-accent inline-block" />
                            </div>
                            <h3 className="mb-2.5 font-normal text-heading-5 text-xl text-secondary dark:text-accent">
                              {workshop.name}
                            </h3>
                            <p className="mb-6 max-w-[250px] text-secondary/60 dark:text-accent/60">
                              {workshop.specialty} • {workshop.location}
                            </p>
                          </div>

                          <div className="mb-7">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-5 w-5 fill-primary-500 text-primary-500" />
                              <h4 className="text-heading-4 font-normal text-secondary dark:text-accent">
                                {workshop.rating}
                              </h4>
                            </div>
                            <p className="text-secondary dark:text-accent text-sm">
                              {workshop.reviews} reviews • {workshop.responseTime}
                            </p>
                          </div>

                          <Link
                            href="/workshops"
                            className="btn btn-md btn-secondary dark:btn-accent w-full block text-center mb-8 before:content-none first-letter:uppercase hover:btn-primary inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 py-2 px-4 bg-secondary dark:bg-accent text-white hover:bg-primary-500"
                            aria-label={`View ${workshop.name}`}
                          >
                            View workshop
                          </Link>

                          <ul className="relative list-none space-y-2.5">
                            {workshop.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center gap-2.5">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="shrink-0"
                                >
                                  <rect
                                    width="20"
                                    height="20"
                                    rx="10"
                                    fill=""
                                    className={
                                      feature.available
                                        ? 'fill-secondary dark:fill-accent/80'
                                        : 'fill-white dark:fill-background-9'
                                    }
                                  />
                                  <path
                                    d="M9.31661 13.7561L14.7491 8.42144C15.0836 8.0959 15.0836 7.5697 14.7491 7.24416C14.4145 6.91861 13.8736 6.91861 13.539 7.24416L8.7116 11.9901L6.46096 9.78807C6.12636 9.46253 5.58554 9.46253 5.25095 9.78807C4.91635 10.1136 4.91635 10.6398 5.25095 10.9654L8.1066 13.7561C8.27347 13.9184 8.49253 14 8.7116 14C8.93067 14 9.14974 13.9184 9.31661 13.7561Z"
                                    fill=""
                                    className={
                                      feature.available
                                        ? 'fill-white dark:fill-background-8'
                                        : 'fill-secondary/60 dark:fill-accent/80'
                                    }
                                  />
                                </svg>

                                <span
                                  className={
                                    feature.available
                                      ? 'text-secondary dark:text-accent/80 font-normal text-tagline-1'
                                      : 'text-secondary/60 dark:text-accent/40 font-normal text-tagline-1'
                                  }
                                >
                                  {feature.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* btn */}
                <div
                  data-ns-animate=""
                  data-delay="0.8"
                  className="text-center w-full"
                  style={{opacity: 1, filter: 'blur(0px)', translate: 'none', rotate: 'none', scale: 'none', transform: 'translate(0px)'}}
                >
                  <Link href="/workshops" className="btn btn-primary btn-md w-[85%] md:w-auto hover:btn-secondary dark:hover:btn-accent inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 bg-primary-500 text-white hover:bg-secondary dark:hover:bg-accent" aria-label="View all featured workshops">
                    <span>Browse All Workshops</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-background-2 dark:bg-background-5">
          <div className="main-container container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <Card className="border-2 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-primary-500/10" />
                <CardContent className="p-12 sm:p-16 text-center relative">
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="space-y-4">
                      <h2 className="text-heading-5 sm:text-heading-4 md:text-heading-3 lg:text-heading-2 text-secondary dark:text-accent">
                        Start Your Car Service Journey Today
                      </h2>
                      <p className="text-lg sm:text-xl text-secondary/60 dark:text-accent/60">
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
                    <div className="flex items-center justify-center gap-2 text-sm text-secondary/60 dark:text-accent/60 pt-4">
                      <CheckCircle className="h-4 w-4 text-primary-500" />
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

