import React from 'react';
import Link from 'next/link';
import {
  Target,
  Eye,
  Heart,
  Shield,
  Users,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Calendar,
  Rocket,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
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
import { generatePageMetadata, generateOrganizationSchema, generateWebPageSchema } from '@/lib/seo';

export const metadata = generatePageMetadata({
  title: 'About Repair Connect - Dubai\'s Trusted Workshop Matching Platform',
  description: 'Learn about Repair Connect, Dubai\'s leading platform connecting car owners with trusted repair workshops. Our mission is to make car repairs transparent, convenient, and reliable.',
  keywords: [
    'about repair connect',
    'car repair platform dubai',
    'trusted workshops',
    'workshop matching',
    'car service dubai',
    'automotive platform',
  ],
  path: '/about',
});

const organizationSchema = generateOrganizationSchema();
const webPageSchema = generateWebPageSchema({
  name: 'About Repair Connect',
  description: 'Learn about our mission to connect car owners with trusted repair workshops in Dubai',
  url: 'https://repairconnect.ae/about',
});

const benefits = [
  {
    icon: Shield,
    title: 'Verified Workshops Only',
    description: 'Every workshop on our platform is thoroughly vetted and verified to ensure quality service and reliability.',
  },
  {
    icon: Clock,
    title: 'Instant Quote Comparison',
    description: 'Get multiple quotes in minutes, not days. Compare prices, services, and ratings all in one place.',
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    description: 'Our rating system and customer reviews help you make informed decisions with confidence.',
  },
  {
    icon: Users,
    title: 'Customer-First Approach',
    description: 'Your satisfaction is our priority. We provide support throughout your entire repair journey.',
  },
  {
    icon: TrendingUp,
    title: 'Best Price Guarantee',
    description: 'Competitive pricing from multiple workshops ensures you get the best value for your money.',
  },
  {
    icon: Sparkles,
    title: 'Transparent Process',
    description: 'No hidden fees or surprises. Clear pricing, detailed quotes, and honest service every time.',
  },
];

const timeline = [
  {
    year: '2024 Q1',
    title: 'Platform Launch',
    description: 'Repair Connect officially launched in Dubai, connecting car owners with 100+ verified workshops.',
    icon: Rocket,
  },
  {
    year: '2024 Q2',
    title: 'Rapid Growth',
    description: 'Reached 10,000+ happy customers and expanded our network to 500+ trusted workshops across Dubai.',
    icon: TrendingUp,
  },
  {
    year: '2024 Q3',
    title: 'Service Expansion',
    description: 'Added new service categories including electrical work, painting, and specialized maintenance services.',
    icon: Sparkles,
  },
  {
    year: '2024 Q4',
    title: 'Innovation Continues',
    description: 'Launching real-time tracking, AI-powered workshop matching, and expanded coverage across UAE.',
    icon: Calendar,
  },
];

const team = [
  {
    name: 'Ahmed Al Maktoum',
    role: 'Founder & CEO',
    description: 'Automotive industry veteran with 15+ years of experience in Dubai\'s car repair sector.',
    icon: Users,
  },
  {
    name: 'Sarah Johnson',
    role: 'Head of Operations',
    description: 'Ensuring seamless connections between customers and workshops with exceptional service standards.',
    icon: Target,
  },
  {
    name: 'Mohammed Hassan',
    role: 'Technical Director',
    description: 'Leading our platform development and workshop verification process with technical excellence.',
    icon: Shield,
  },
];

const faqs = [
  {
    question: 'What is Repair Connect?',
    answer: 'Repair Connect is Dubai\'s premier platform connecting car owners with trusted, verified repair workshops. We make it easy to find, compare, and book car repair services across Dubai, from mechanical work to bodywork, painting, and maintenance.',
  },
  {
    question: 'How do you verify workshops?',
    answer: 'Every workshop undergoes a rigorous verification process including license checks, facility inspections, technician certifications, and customer reference checks. We also continuously monitor performance through customer reviews and ratings.',
  },
  {
    question: 'Is Repair Connect free to use?',
    answer: 'Yes! Repair Connect is completely free for car owners. You can browse workshops, request quotes, and book services at no additional cost. Workshops pay a small fee to be listed on our platform.',
  },
  {
    question: 'What areas do you cover?',
    answer: 'We currently serve all areas of Dubai including Downtown, Jumeirah, Deira, Al Quoz, Dubai Marina, and more. We\'re rapidly expanding coverage across the UAE.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply browse our workshop directory, select your service type, and request quotes. You can compare offers and book directly through our platform. No registration required to browse!',
  },
  {
    question: 'What if I\'m not satisfied with a service?',
    answer: 'Customer satisfaction is our priority. If you experience any issues, contact our support team immediately. We work with workshops to resolve concerns and ensure quality service.',
  },
];

export default function AboutPage() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={webPageSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background via-muted/20 to-background py-20 lg:py-32 border-b overflow-hidden">
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <Badge variant="outline" className="border-primary text-primary px-4 py-2">
                  About Us
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Connecting Dubai's Car Owners with{' '}
                  <span className="text-primary relative">
                    Trusted Workshops
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
                  Connecting Dubai's car owners with trusted workshops since 2024. We're on a mission to make car repairs transparent, convenient, and reliable for everyone.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" asChild>
                    <Link href="/workshops">
                      Explore Workshops
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/contact">Get in Touch</Link>
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Our Purpose"
                title="Mission & Vision"
                subtitle="Building the future of car repair services in Dubai"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <StaggerItem variants={staggerItemVariants}>
                <HoverScale>
                  <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all h-full">
                    <CardHeader>
                      <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        To revolutionize the car repair industry in Dubai by creating a transparent, efficient platform that connects car owners with the best workshops. We believe everyone deserves access to quality repair services at fair prices.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </HoverScale>
              </StaggerItem>

              <StaggerItem variants={staggerItemVariants}>
                <HoverScale>
                  <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all h-full">
                    <CardHeader>
                      <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Eye className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        To become the UAE's most trusted automotive service platform, empowering car owners with choice, transparency, and peace of mind. We envision a future where finding reliable car repair is as easy as a few clicks.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </HoverScale>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Benefits"
                title="Why Choose Repair Connect?"
                subtitle="Experience the difference with Dubai's most trusted workshop matching platform"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;

                return (
                  <StaggerItem key={index} variants={staggerItemVariants}>
                    <HoverScale>
                      <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all h-full group">
                        <CardHeader>
                          <div className="h-14 w-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors flex items-center justify-center mb-4">
                            <IconComponent className="h-7 w-7 text-primary" />
                          </div>
                          <CardTitle className="text-xl">{benefit.title}</CardTitle>
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
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Our Journey"
                title="Our Story"
                subtitle="From inception to becoming Dubai's trusted workshop platform"
              />
            </AnimatedSection>

            <div className="max-w-4xl mx-auto">
              <StaggerContainer className="space-y-8">
                {timeline.map((milestone, index) => {
                  const IconComponent = milestone.icon;

                  return (
                    <StaggerItem key={index} variants={staggerItemVariants}>
                      <HoverScale scale={1.01}>
                        <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all">
                          <CardContent className="p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                              <div className="flex-shrink-0">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                  <IconComponent className="h-8 w-8 text-primary" />
                                </div>
                              </div>
                              <div className="flex-1 space-y-2">
                                <Badge variant="secondary" className="mb-2">
                                  {milestone.year}
                                </Badge>
                                <h3 className="text-xl font-bold text-foreground">
                                  {milestone.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                  {milestone.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverScale>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Meet The Team"
                title="Led by Industry Experts"
                subtitle="Passionate professionals dedicated to transforming car repair services"
              />
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {team.map((member, index) => {
                const IconComponent = member.icon;

                return (
                  <StaggerItem key={index} variants={staggerItemVariants}>
                    <HoverScale>
                      <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all h-full text-center">
                        <CardHeader>
                          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                            <IconComponent className="h-12 w-12 text-primary" />
                          </div>
                          <CardTitle className="text-xl">{member.name}</CardTitle>
                          <Badge variant="secondary" className="w-fit mx-auto">
                            {member.role}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base">
                            {member.description}
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

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="FAQ"
                title="Frequently Asked Questions"
                subtitle="Everything you need to know about Repair Connect"
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

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                    Ready to Experience the Difference?
                  </h2>
                  <p className="text-lg sm:text-xl text-primary-foreground/90">
                    Join thousands of satisfied customers who trust Repair Connect for their car repair needs.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="xl"
                    variant="secondary"
                    asChild
                    className="shadow-lg"
                  >
                    <Link href="/workshops">
                      Find Workshops Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    asChild
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link href="/auth/workshop/register">Join as Workshop</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm pt-4">
                  <CheckCircle className="h-4 w-4" />
                  <span>No registration required to browse</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  );
}
