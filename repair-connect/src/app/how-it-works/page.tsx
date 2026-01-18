import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import {
  Wrench,
  Car,
  Paintbrush,
  Zap,
  Disc,
  Settings,
  Search,
  Calculator,
  Calendar,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Award,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnimatedSection, StaggerContainer, StaggerItem, staggerItemVariants, HoverScale } from '@/components/shared/AnimatedSection';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StructuredData } from '@/components/seo/StructuredData';
import { generatePageMetadata, generateHowToSchema, generateWebPageSchema, SERVICE_CATEGORIES } from '@/lib/seo';
import { ProcessSteps } from '@/components/how-it-works/ProcessSteps';

export const metadata = generatePageMetadata({
  title: 'How It Works - Easy Car Repair Booking Process',
  description: 'Learn how Repair Connect makes car repairs easy. Choose your service, compare instant quotes from verified workshops, and book appointments with confidence. Simple 3-step process.',
  keywords: [
    'how it works',
    'car repair process',
    'book workshop',
    'instant quotes',
    'compare workshops',
    'car service booking',
    'repair connect process',
  ],
  path: '/how-it-works',
});

const howToSchema = generateHowToSchema();
const webPageSchema = generateWebPageSchema({
  name: 'How It Works - Repair Connect',
  description: 'Learn how to get your car repaired with Repair Connect in three simple steps',
  url: 'https://repairconnect.ae/how-it-works',
});

const mainSteps = [
  {
    number: 1,
    icon: Search,
    title: 'Choose Your Service Type',
    description: 'Tell us what your car needs. Select from our comprehensive service categories tailored to every type of repair and maintenance.',
    details: [
      'Browse 6 main service categories',
      'Describe your specific issue or requirement',
      'Upload photos if needed for accurate quotes',
      'Set your preferred location and budget',
    ],
    color: 'from-primary-500/20 to-primary-500/5',
  },
  {
    number: 2,
    icon: Calculator,
    title: 'Compare Workshops Instantly',
    description: 'Receive quotes from multiple verified workshops within hours. Compare pricing, ratings, reviews, and specializations all in one place.',
    details: [
      'Get quotes from 3-5 verified workshops',
      'View detailed pricing breakdowns',
      'Check workshop ratings and customer reviews',
      'Compare response times and availability',
    ],
    color: 'from-primary-500/20 to-primary-500/5',
  },
  {
    number: 3,
    icon: Calendar,
    title: 'Book and Track Your Appointment',
    description: 'Choose your preferred workshop, book a convenient time slot, and track your repair progress in real-time through our platform.',
    details: [
      'Select the best workshop for your needs',
      'Choose a convenient appointment time',
      'Receive booking confirmation instantly',
      'Track your repair status in real-time',
    ],
    color: 'from-primary-500/20 to-primary-500/5',
  },
];

const workshopBenefits = [
  {
    icon: Users,
    title: 'Reach More Customers',
    description: 'Connect with thousands of car owners actively looking for repair services in Dubai.',
  },
  {
    icon: TrendingUp,
    title: 'Grow Your Business',
    description: 'Increase your workshop visibility and attract high-quality leads through our platform.',
  },
  {
    icon: Shield,
    title: 'Build Trust',
    description: 'Verified badge and customer reviews help establish your workshop as a trusted service provider.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Streamlined quote submission and appointment management saves you valuable time.',
  },
];

const flowSteps = [
  {
    label: 'Create Request',
    icon: Search,
    description: 'Tell us what your car needs. Select your service type, describe the issue, and upload photos if needed. Our smart matching system finds the best workshops for your specific requirements.'
  },
  {
    label: 'Receive Quotes',
    icon: Calculator,
    description: 'Get quotes from multiple verified workshops within hours. Each quote includes detailed pricing breakdown, estimated completion time, and workshop credentials.'
  },
  {
    label: 'Compare Options',
    icon: Star,
    description: 'Review and compare all received quotes side by side. Check workshop ratings, customer reviews, response times, and specializations to make an informed decision.'
  },
  {
    label: 'Book Service',
    icon: Calendar,
    description: 'Choose your preferred workshop and select a convenient time slot. Receive instant booking confirmation with all the details you need for your appointment.'
  },
  {
    label: 'Get It Fixed',
    icon: CheckCircle,
    description: 'Drop off your car at the workshop and track repair progress in real-time. Get notified when your car is ready and enjoy peace of mind with our service guarantee.'
  },
];

const faqs = [
  {
    question: 'How long does it take to receive quotes?',
    answer: 'Most workshops respond within 2-24 hours. You\'ll receive notifications as soon as workshops submit their quotes. Urgent requests are typically prioritized.',
  },
  {
    question: 'Is there a fee to use Repair Connect?',
    answer: 'No! Repair Connect is completely free for car owners. You can browse workshops, request quotes, and book services without any charges. We earn a small commission from workshops.',
  },
  {
    question: 'How do I know the workshops are trustworthy?',
    answer: 'Every workshop undergoes our verification process including license checks, facility inspections, and reference verification. You can also read reviews from other customers.',
  },
  {
    question: 'Can I cancel or reschedule my appointment?',
    answer: 'Yes, you can cancel or reschedule through your dashboard. Please note that cancellation policies may vary by workshop, so check their specific terms when booking.',
  },
  {
    question: 'What if I\'m not satisfied with the service?',
    answer: 'Contact our support team immediately if you have any concerns. We work with workshops to resolve issues and ensure customer satisfaction. Your feedback helps maintain our quality standards.',
  },
];

export default function HowItWorksPage() {
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
      <Script src="/js/stack-card.min.js" strategy="afterInteractive" />
      <StructuredData data={howToSchema} />
      <StructuredData data={webPageSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background via-background-3/20 dark:via-background-7/20 to-background py-20 lg:py-32 border-b overflow-hidden">
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <Badge variant="outline" className="border-primary-500 text-primary-500 px-4 py-2">
                  Simple Process
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary dark:text-accent leading-tight">
                  Your Car, Our Network,{' '}
                  <span className="text-primary-500 relative">
                    Perfect Match
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
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-secondary/60 dark:text-accent/60">
                  Getting your car repaired has never been easier. Follow our simple 3-step process to connect with verified workshops and get your car back on the road.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Main Process Steps */}
        <section className="py-20 bg-background-2 dark:bg-background-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="The Process"
                title="How Repair Connect Works"
                subtitle="Three simple steps to get your car serviced by trusted professionals"
              />
            </AnimatedSection>

            <div className="space-y-20 max-w-6xl mx-auto">
              {mainSteps.map((step, index) => {
                const IconComponent = step.icon;
                const isEven = index % 2 === 0;

                return (
                  <AnimatedSection key={index} delay={index * 0.1}>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                      <div className={`space-y-6 ${!isEven ? 'lg:order-2' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary-500 text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                            {step.number}
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2">
                              Step {step.number}
                            </Badge>
                            <h3 className="text-2xl sm:text-3xl font-bold text-secondary dark:text-accent">
                              {step.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-lg text-secondary/60 dark:text-accent/60 leading-relaxed">
                          {step.description}
                        </p>

                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
                              <span className="text-base text-secondary/60 dark:text-accent/60">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={!isEven ? 'lg:order-1' : ''}>
                        <Card className="border-2 overflow-hidden shadow-xl">
                          <div className={`bg-gradient-to-br ${step.color} p-16 flex items-center justify-center`}>
                            <div className="h-32 w-32 rounded-full bg-white/50 backdrop-blur flex items-center justify-center">
                              <IconComponent className="h-16 w-16 text-primary-500" />
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </AnimatedSection>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section className="pb-14 md:pb-16 lg:pb-[88px] xl:pb-[100px] xl:pt-[180px] md:pt-42 sm:pt-36 pt-32" id="step-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-5 mb-[70px]">
              <AnimatedSection delay={0.2}>
                <Badge variant="outline" className="border-primary-500 text-primary-500 px-4 py-2">
                  Our Services
                </Badge>
              </AnimatedSection>
              <div className="space-y-3">
                <AnimatedSection delay={0.3}>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                    All Services in One Place
                  </h2>
                </AnimatedSection>
                <AnimatedSection delay={0.4}>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose from our comprehensive range of car repair and maintenance services
                  </p>
                </AnimatedSection>
              </div>
            </div>
            <div className="grid grid-cols-12 xl:gap-8 md:gap-8 gap-y-5">
              {SERVICE_CATEGORIES.map((service, index) => {
                const IconComponent = serviceIcons[service.icon as keyof typeof serviceIcons];
                const delays = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

                return (
                  <div key={service.slug} className="col-span-12 md:col-span-6 xl:col-span-4">
                    <AnimatedSection delay={delays[index]}>
                      <div className="px-6 py-8 rounded-[20px] bg-background-3 dark:bg-background-7 space-y-6 text-center grid items-center justify-center hover:translate-y-[-10px] transition-transform duration-500 ease-in-out">
                        <div className="flex items-center justify-center">
                          <IconComponent className="h-[52px] w-[52px] text-secondary dark:text-accent" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-heading-5">{service.name}</h3>
                          <p className="max-w-[361px] mx-auto text-secondary/60 dark:text-accent/60">
                            {service.description}
                          </p>
                        </div>
                        <div>
                          <Link href={`/services/${service.slug}`} className="btn btn-white dark:btn-transparent dark:hover:btn-accent hover:btn-secondary btn-md">
                            <span>Learn more</span>
                          </Link>
                        </div>
                      </div>
                    </AnimatedSection>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Visual Flow */}
        <section className="relative py-[50px] md:py-[80px] lg:py-[100px] bg-background-2 dark:bg-background-5">
          <div className="main-container container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="xl:grid xl:grid-cols-12 xl:gap-[60px] xl:items-start space-y-8 xl:space-y-0">
              {/* Left Column - Sticky Description on Desktop Only */}
              <div className="xl:col-span-6 xl:sticky xl:top-28">
                <AnimatedSection direction="left">
                  <ProcessSteps
                    steps={flowSteps.map(step => ({
                      label: step.label,
                      description: step.description
                    }))}
                  />
                </AnimatedSection>
              </div>

              {/* Right Column - Stack Cards with Images */}
              <div className="xl:col-span-6">
                <div className="stack-cards js-stack-cards xl:max-w-full max-w-[820px] xl:mx-0 mx-auto">
                  {flowSteps.map((step, index) => {
                    // Different decorative border configurations for each card
                    const borderConfigs = [
                      { top: 'top-[-62%] md:-top-[85%]', left: 'left-[-48%] md:-left-[68%]', rotate: 'rotate-[312deg]', size: 'md:size-[800px] size-[500px]' },
                      { top: 'top-[-127%] md:-top-[130%]', left: 'left-[-103%] md:-left-[79%]', rotate: 'rotate-[255deg]', size: 'size-[800px] md:size-[1000px]' },
                      { top: 'top-[-127%] md:-top-[130%]', left: 'left-[-107%] md:-left-[88%]', rotate: 'rotate-[240deg]', size: 'size-[800px] md:size-[1000px]' },
                      { top: 'top-[-143%] md:-top-[117%]', left: 'left-[-72%] md:-left-[37%]', rotate: 'rotate-[245deg]', size: 'size-[1000px]' },
                      { top: 'top-[-62%] md:-top-[85%]', left: 'left-[-48%] md:-left-[68%]', rotate: 'rotate-[312deg]', size: 'md:size-[800px] size-[500px]' },
                    ];
                    const config = borderConfigs[index % borderConfigs.length];

                    return (
                      <div
                        key={index}
                        data-step-index={index}
                        className="stack-cards__item js-stack-cards__item p-2 relative rounded-[20px] z-20 flex items-center justify-center sm:max-w-[483px] max-w-full sm:mx-0 mx-auto w-full overflow-hidden"
                      >
                        {/* Decorative Border Image */}
                        <figure className={`absolute pointer-events-none ${config.top} ${config.left} -z-10 ${config.rotate} opacity-50 ${config.size} select-none`}>
                          <img src="/images/bg-stack-cards/ns-img-522.png" alt="decorative border" />
                        </figure>

                        {/* Card Content - Process Image */}
                        <div className="relative z-10 rounded-[14px] sm:max-w-[467px] max-w-full w-full bg-white dark:bg-black border border-primary-500/10 overflow-hidden">
                          <img
                            src={`/images/process/step-${index + 1}-placeholder.svg`}
                            alt={step.label}
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Workshops Section */}
        <section className="py-20 bg-background-2 dark:bg-background-5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="For Workshop Owners"
                title="Grow Your Workshop Business"
                subtitle="Join our network and connect with thousands of potential customers"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {workshopBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;

                return (
                  <StaggerItem key={index} variants={staggerItemVariants}>
                    <HoverScale>
                      <Card className="border-2 hover:border-primary-500/50 hover:shadow-lg transition-all h-full text-center group">
                        <CardHeader>
                          <div className="h-16 w-16 rounded-full bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors flex items-center justify-center mx-auto mb-4">
                            <IconComponent className="h-8 w-8 text-primary-500" />
                          </div>
                          <CardTitle className="text-lg">{benefit.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base">
                            {benefit.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </HoverScale>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            <AnimatedSection delay={0.4}>
              <div className="text-center mt-12">
                <Button size="lg" asChild className="shadow-lg shadow-primary/20">
                  <Link href="/auth/workshop/register">
                    Register Your Workshop
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background dark:bg-background-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="FAQ"
                title="Common Questions"
                subtitle="Everything you need to know about using Repair Connect"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="max-w-3xl mx-auto">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left font-semibold">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-secondary/60 dark:text-accent/60 leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Dual CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <div className="max-w-5xl mx-auto">
                <div className="text-center space-y-6 mb-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    Ready to Get Started?
                  </h2>
                  <p className="text-lg sm:text-xl text-primary-foreground/90">
                    Whether you need a repair or want to grow your workshop, we're here to help
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <HoverScale>
                    <Card className="border-2 border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur">
                      <CardContent className="p-8 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto">
                          <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold">For Car Owners</h3>
                        <p className="text-primary-foreground/80">
                          Find trusted workshops and get instant quotes for your car repairs
                        </p>
                        <Button size="lg" variant="secondary" asChild className="w-full">
                          <Link href="/workshops">
                            Find Workshops
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverScale>

                  <HoverScale>
                    <Card className="border-2 border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur">
                      <CardContent className="p-8 text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto">
                          <Award className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-bold">For Workshops</h3>
                        <p className="text-primary-foreground/80">
                          Join our network and connect with thousands of potential customers
                        </p>
                        <Button size="lg" variant="secondary" asChild className="w-full">
                          <Link href="/auth/workshop/register">
                            Join as Workshop
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverScale>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  );
}
