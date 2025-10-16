'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AnimatedSection, StaggerContainer, StaggerItem, staggerItemVariants, HoverScale } from '@/components/shared/AnimatedSection';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateContactPageSchema } from '@/lib/seo';
import { toast } from 'sonner';

const contactPageSchema = generateContactPageSchema();

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    details: '+971-4-XXX-XXXX',
    description: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM',
    href: 'tel:+9714XXXXXXX',
  },
  {
    icon: Mail,
    title: 'Email',
    details: 'info@repairconnect.ae',
    description: 'We reply within 24 hours',
    href: 'mailto:info@repairconnect.ae',
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: 'Sun-Fri: 8AM-6PM',
    description: 'Saturday: 9AM-2PM',
    href: null,
  },
];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Form submitted:', data);

    toast.success('Message sent successfully!', {
      description: 'We\'ll get back to you within 24 hours.',
    });

    form.reset();
    setIsSubmitting(false);
  };

  return (
    <>
      <StructuredData data={contactPageSchema} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-background via-muted/20 to-background py-20 lg:py-32 border-b overflow-hidden">
          <div className="absolute inset-0 bg-grid-primary/[0.02] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <Badge variant="outline" className="border-primary text-primary px-4 py-2">
                  Contact Us
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Get in{' '}
                  <span className="text-primary relative">
                    Touch
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
                  Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;

                return (
                  <StaggerItem key={index} variants={staggerItemVariants}>
                    <HoverScale>
                      <Card
                        className={`border-2 hover:border-primary/50 hover:shadow-xl transition-all h-full text-center ${
                          info.href ? 'cursor-pointer' : ''
                        }`}
                        onClick={() => info.href && window.open(info.href, '_self')}
                      >
                        <CardHeader>
                          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <CardTitle className="text-xl">{info.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-lg font-semibold text-foreground">
                            {info.details}
                          </p>
                          <CardDescription className="text-base">
                            {info.description}
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

        {/* Contact Form Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Send a Message"
                title="We'd Love to Hear From You"
                subtitle="Fill out the form below and our team will get back to you within 24 hours"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="max-w-2xl mx-auto">
                <Card className="border-2 shadow-xl">
                  <CardContent className="p-6 sm:p-8">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Your full name"
                                  {...field}
                                  className="border-2"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="your.email@example.com"
                                  {...field}
                                  className="border-2"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="+971 XX XXX XXXX"
                                  {...field}
                                  className="border-2"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="What is this regarding?"
                                  {...field}
                                  className="border-2"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us more about your inquiry..."
                                  className="min-h-[150px] border-2"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-5 w-5" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <SectionHeader
                badge="Location"
                title="Visit Our Office"
                subtitle="We're located in the heart of Dubai's business district"
              />
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="max-w-4xl mx-auto">
                <Card className="border-2 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-16 sm:p-24 flex flex-col items-center justify-center space-y-6">
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        Sheikh Zayed Road
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        Dubai, United Arab Emirates
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        Opening Soon
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-md text-center">
                      Interactive map coming soon. For now, reach us via phone or email for directions.
                    </p>
                  </div>
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
                    Looking for a Workshop?
                  </h2>
                  <p className="text-lg sm:text-xl text-primary-foreground/90">
                    Browse our network of verified workshops and get instant quotes for your car repair needs.
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
                      Find Workshops
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="outline"
                    asChild
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm pt-4">
                  <CheckCircle className="h-4 w-4" />
                  <span>Instant quotes from verified workshops</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </>
  );
}
