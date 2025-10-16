import React from 'react';
import Link from 'next/link';
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
    color: 'from-blue-500/20 to-blue-500/5',
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
    color: 'from-purple-500/20 to-purple-500/5',
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
    color: 'from-green-500/20 to-green-500/5',
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
  { label: 'Create Request', icon: Search },
  { label: 'Receive Quotes', icon: Calculator },
  { label: 'Compare Options', icon: Star },
  { label: 'Book Service', icon: Calendar },
  { label: 'Get It Fixed', icon: CheckCircle },
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
      <StructuredData data={howToSchema} />
      <StructuredData data={webPageSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background via-muted/20 to-background py-20 lg:py-32 border-b overflow-hidden">
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <Badge variant="outline" className="border-primary text-primary px-4 py-2">
                  Simple Process
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Your Car, Our Network,{' '}
                  <span className="text-primary relative">
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
                        className="text-primary"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground">
                  Getting your car repaired has never been easier. Follow our simple 3-step process to connect with verified workshops and get your car back on the road.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Main Process Steps */}
        <section className="py-20 bg-background">
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
                          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg">
                            {step.number}
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2">
                              Step {step.number}
                            </Badge>
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                              {step.title}
                            </h3>
                          </div>
                        </div>

                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>

                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-base text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={!isEven ? 'lg:order-1' : ''}>
                        <Card className="border-2 overflow-hidden shadow-xl">
                          <div className={`bg-gradient-to-br ${step.color} p-16 flex items-center justify-center`}>
                            <div className="h-32 w-32 rounded-full bg-white/50 backdrop-blur flex items-center justify-center">
                              <IconComponent className="h-16 w-16 text-primary" />
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
        <section className="py-20 bg-muted/30" id="step-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Service Types"
                title="All Services in One Place"
                subtitle="Choose from our comprehensive range of car repair and maintenance services"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {SERVICE_CATEGORIES.map((service, index) => {
                const IconComponent = serviceIcons[service.icon as keyof typeof serviceIcons];

                return (
                  <StaggerItem key={service.slug} variants={staggerItemVariants}>
                    <HoverScale>
                      <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all h-full group">
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
                        </CardContent>
                      </Card>
                    </HoverScale>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Visual Flow */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Quick Overview"
                title="From Request to Repair"
                subtitle="Watch your car repair journey unfold seamlessly"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-2">
                  {flowSteps.map((step, index) => {
                    const IconComponent = step.icon;

                    return (
                      <div key={index} className="relative">
                        <Card className="border-2 text-center">
                          <CardContent className="p-6">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {step.label}
                            </p>
                          </CardContent>
                        </Card>
                        {index < flowSteps.length - 1 && (
                          <div className="hidden md:block absolute top-1/2 -right-1 transform translate-x-1/2 -translate-y-1/2 z-10">
                            <ArrowRight className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* For Workshops Section */}
        <section className="py-20 bg-background">
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
                      <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all h-full text-center group">
                        <CardHeader>
                          <div className="h-16 w-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mx-auto mb-4">
                            <IconComponent className="h-8 w-8 text-primary" />
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
        <section className="py-20 bg-muted/30">
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
                          <AccordionContent className="text-muted-foreground leading-relaxed">
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
