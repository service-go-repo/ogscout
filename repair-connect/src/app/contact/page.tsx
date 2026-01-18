'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Phone,
  Mail,
  MapPin,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateContactPageSchema } from '@/lib/seo';
import { toast } from 'sonner';

const contactPageSchema = generateContactPageSchema();

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
      terms: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Form submitted:', data);

    toast.success('Message sent successfully!', {
      description: "We'll get back to you within 24 hours.",
    });

    reset();
    setIsSubmitting(false);
  };

  return (
    <>
      <StructuredData data={contactPageSchema} />

      <main>
        {/* Contact Section */}
        <section
          className="pb-20 md:pb-24 lg:pb-32 xl:pt-32 lg:pt-28 md:pt-24 pt-20"
          aria-label="Contact Information and Form"
        >
          <div className="main-container">
            <div className="space-y-16 md:space-y-20">
              {/* Heading */}
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight"
                  data-ns-animate
                  data-delay="0.2"
                >
                  Reach out to our support team for help.
                </h2>
                <p
                  className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
                  data-ns-animate
                  data-delay="0.3"
                >
                  Whether you have a question, need technical assistance, or just want some guidance, our support team is here to help. We're available around the clock to provide quick and friendly support.
                </p>
              </div>

              <div className="flex lg:items-stretch flex-col justify-center items-center gap-12 lg:flex-row lg:gap-10 xl:gap-16">
                {/* Contact Info Cards */}
                <div
                  data-ns-animate
                  data-delay="0.4"
                  className="flex flex-col gap-6 md:flex-row lg:flex-col justify-between"
                >
                  {/* Address Card */}
                  <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-[20px] p-10 space-y-6 w-full md:max-w-[320px] text-center relative overflow-hidden">
                    {/* BG Overlay - Pink/Magenta gradient top-right */}
                    <figure className="absolute select-none pointer-events-none w-[300px] h-[300px] overflow-hidden top-[-150px] right-[-100px]">
                      <div className="size-full bg-gradient-to-bl from-pink-500/60 via-pink-600/40 to-transparent blur-2xl" />
                    </figure>

                    <figure className="size-12 overflow-hidden mx-auto relative z-10">
                      <div className="size-full rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                    </figure>

                    <div className="space-y-2.5 relative z-10">
                      <p className="text-lg font-semibold text-white">Our Address</p>
                      <p className="text-sm text-gray-300">Sheikh Zayed Road, Dubai, UAE</p>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-[20px] p-10 w-full md:max-w-[320px] text-center relative overflow-hidden">
                    {/* BG Overlay - Yellow/Orange gradient from top */}
                    <figure className="absolute select-none pointer-events-none w-[300px] h-[300px] overflow-hidden top-[-120px] left-[50%] -translate-x-1/2">
                      <div className="size-full bg-gradient-to-b from-yellow-400/60 via-orange-500/40 to-transparent blur-2xl" />
                    </figure>

                    <div className="space-y-6 relative z-10">
                      <figure className="size-12 overflow-hidden mx-auto">
                        <div className="size-full rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                      </figure>

                      <div className="space-y-2.5">
                        <p className="text-lg font-semibold text-white">Email Us</p>
                        <p className="text-sm text-gray-300">
                          <a href="mailto:info@repairconnect.ae">info@repairconnect.ae</a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="bg-[#1a1a1a] dark:bg-[#1a1a1a] rounded-[20px] p-10 w-full md:max-w-[320px] text-center relative overflow-hidden">
                    {/* BG Overlay - Orange gradient from top-left */}
                    <figure className="absolute select-none pointer-events-none w-[300px] h-[300px] overflow-hidden top-[-120px] left-[-100px]">
                      <div className="size-full bg-gradient-to-br from-orange-500/60 via-yellow-500/40 to-transparent blur-2xl" />
                    </figure>

                    <div className="space-y-6 relative z-10">
                      <figure className="size-12 overflow-hidden mx-auto">
                        <div className="size-full rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                          <Phone className="h-6 w-6 text-white" />
                        </div>
                      </figure>

                      <div className="space-y-2.5">
                        <p className="text-lg font-semibold text-white">Call Us</p>
                        <p className="text-sm text-gray-300">
                          <a href="tel:+9714XXXXXXX">+971 4 XXX XXXX</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div
                  data-ns-animate
                  data-delay="0.3"
                  className="max-w-[700px] w-full bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 md:p-10 lg:p-12 shadow-sm"
                >
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Name and Phone Number */}
                    <div className="flex items-start flex-col md:flex-row gap-8 justify-between">
                      {/* Name */}
                      <div className="space-y-2.5 w-full">
                        <label
                          htmlFor="name"
                          className="block text-sm text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Your name
                        </label>
                        <input
                          {...register('name')}
                          type="text"
                          id="name"
                          placeholder="Enter your name"
                          autoComplete="name"
                          className={cn(
                            'w-full px-4 py-3 h-12 rounded-lg border bg-gray-50 dark:bg-[#252525] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none dark:text-white text-gray-900 transition-colors',
                            errors.name
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
                          )}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2.5 w-full">
                        <label
                          htmlFor="phone"
                          className="block text-sm text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Your number
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          id="phone"
                          placeholder="Enter your number"
                          autoComplete="tel"
                          className={cn(
                            'w-full px-4 py-3 h-12 rounded-lg border bg-gray-50 dark:bg-[#252525] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none dark:text-white text-gray-900 transition-colors',
                            errors.phone
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
                          )}
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-500">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2.5">
                      <label
                        htmlFor="email"
                        className="block text-sm text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Email address
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        className={cn(
                          'w-full px-4 py-3 h-12 rounded-lg border bg-gray-50 dark:bg-[#252525] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none dark:text-white text-gray-900 transition-colors',
                          errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
                        )}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-2.5">
                      <label
                        htmlFor="subject"
                        className="block text-sm text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Subject
                      </label>
                      <input
                        {...register('subject')}
                        type="text"
                        id="subject"
                        placeholder="Enter your subject"
                        className={cn(
                          'w-full px-4 py-3 h-12 rounded-lg border bg-gray-50 dark:bg-[#252525] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none dark:text-white text-gray-900 transition-colors',
                          errors.subject
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
                        )}
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-500">{errors.subject.message}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2.5">
                      <label
                        htmlFor="message"
                        className="block text-sm text-gray-700 dark:text-gray-300 font-medium"
                      >
                        Write message
                      </label>
                      <textarea
                        {...register('message')}
                        id="message"
                        rows={6}
                        placeholder="Enter your messages"
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border bg-gray-50 dark:bg-[#252525] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none dark:text-white text-gray-900 transition-colors resize-none',
                          errors.message
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-200 dark:border-gray-700 focus:border-gray-400 dark:focus:border-gray-500'
                        )}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500">{errors.message.message}</p>
                      )}
                    </div>

                    {/* Terms Checkbox */}
                    <fieldset className="flex items-start gap-3">
                      <div className="flex items-center gap-3 pt-0.5">
                        <input
                          {...register('terms')}
                          id="terms"
                          type="checkbox"
                          className="sr-only peer"
                        />
                        <label htmlFor="terms" className="cursor-pointer">
                          <span className="size-4 rounded border border-gray-300 dark:border-gray-600 relative after:absolute after:size-2 after:bg-black dark:after:bg-white after:rounded-sm after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:opacity-0 peer-checked:after:opacity-100 peer-checked:border-black dark:peer-checked:border-white cursor-pointer block transition-all" />
                        </label>
                      </div>
                      <label
                        htmlFor="terms"
                        className="text-sm cursor-pointer text-gray-600 dark:text-gray-400"
                      >
                        I agree with the{' '}
                        <Link href="#" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300">
                          terms and conditions
                        </Link>
                      </label>
                    </fieldset>
                    {errors.terms && (
                      <p className="text-xs text-red-500 -mt-4">{errors.terms.message}</p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        'w-full h-12 rounded-full text-sm font-medium transition-all duration-200',
                        isSubmitting
                          ? 'bg-gray-800 dark:bg-gray-600 opacity-70 cursor-not-allowed text-white'
                          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                      )}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Map */}
        <section
          className="md:pt-[80px] lg:pt-[100px] pb-[100px] md:pb-[150px] lg:pb-[200px]"
          aria-label="Location Map"
        >
          <div className="main-container">
            <div
              data-ns-animate
              data-delay="0.1"
              className="rounded-[20px] bg-white dark:bg-background-6 p-2.5"
            >
              <div className="w-full min-h-[300px] lg:min-h-[566px] overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-500/5 flex flex-col items-center justify-center space-y-6 p-16">
                <div className="h-24 w-24 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-secondary dark:text-accent">
                    Sheikh Zayed Road
                  </h3>
                  <p className="text-lg text-secondary/60 dark:text-accent/60">
                    Dubai, United Arab Emirates
                  </p>
                  <div className="mt-4 inline-block px-4 py-2 bg-primary-500/10 rounded-full">
                    <span className="text-tagline-2 text-primary-500 font-medium">
                      Opening Soon
                    </span>
                  </div>
                </div>
                <p className="text-tagline-2 text-secondary/60 dark:text-accent/60 max-w-md text-center">
                  Interactive map coming soon. For now, reach us via phone or email for
                  directions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
