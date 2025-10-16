"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Mail,
  Award,
  Users,
  Calendar,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  MessageCircle,
  Camera,
  Loader2,
  Check,
} from "lucide-react";
import {
  Workshop,
  getServiceTypeLabel,
  getCarBrandLabel,
  getCertificationTypeLabel,
  getRatingColor,
  isWorkshopOpen,
} from "@/models/Workshop";
import WorkshopProfile from "@/components/workshops/workshop-profile";
import RatingDisplay from "@/components/common/rating-display";
import { useQuoteRequestStore } from "@/stores/quoteRequestStore";
import { EnhancedCarServiceModal } from "@/components/quotations/enhanced-car-service-modal";

interface WorkshopDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WorkshopDetailPage({
  params,
}: WorkshopDetailPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "portfolio" | "reviews"
  >("overview");
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);

  // Store actions
  const openCarSelection = useQuoteRequestStore((state) => state.openCarSelection);

  // Helper function to format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // If it starts with 0, replace with 971 (UAE country code)
    if (digits.startsWith('0')) {
      return '971' + digits.substring(1);
    }
    // If it doesn't start with country code, add 971
    if (!digits.startsWith('971')) {
      return '971' + digits;
    }
    return digits;
  };

  // Create WhatsApp link
  const getWhatsAppLink = () => {
    if (!workshop) return '#';
    const phoneNumber = formatPhoneForWhatsApp(workshop.contact.phone);
    const message = encodeURIComponent(
      "Hey, I noticed your service on ogscout.com. I'm interested in some automotive services, specifically "
    );
    return `https://wa.me/${phoneNumber}?text=${message}`;
  };

  // Create tel link
  const getTelLink = () => {
    if (!workshop) return '#';
    return `tel:${workshop.contact.phone}`;
  };

  // Fetch workshop data
  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response = await fetch(`/api/workshops/${resolvedParams.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Workshop not found");
          } else {
            throw new Error("Failed to fetch workshop");
          }
          return;
        }

        const data = await response.json();

        if (data.success) {
          setWorkshop(data.data);
          // Fetch review stats from appointments
          fetchReviewStats(data.data.userId.toString());
        } else {
          setError(data.error || "Failed to load workshop");
        }
      } catch (error) {
        console.error("Error fetching workshop:", error);
        setError("Failed to load workshop");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshop();
  }, [resolvedParams.id]);

  /**
   * Handle Request Quote button click
   * Store workshop ID and open the enhanced car/service selection modal
   */
  const handleRequestQuote = () => {
    if (!workshop) return;

    const workshopId = workshop.userId?.toString() || workshop._id?.toString();

    // Store the workshop ID in sessionStorage (as an array with single item)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingWorkshopSelections', JSON.stringify([workshopId]));
    }

    // Open the car selection modal to start the quote request flow
    openCarSelection();
  };

  // Fetch actual review stats from appointments
  const fetchReviewStats = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/appointments?workshopId=${userId}&status=completed&limit=1000`,
      );
      const data = await response.json();

      if (data.success) {
        const appointmentsWithReviews = (
          data.data.appointments as any[]
        ).filter((apt) => apt.customerRating && apt.customerReview);

        if (appointmentsWithReviews.length > 0) {
          const avgRating =
            appointmentsWithReviews.reduce(
              (sum, apt) => sum + apt.customerRating,
              0,
            ) / appointmentsWithReviews.length;
          setReviewStats({
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews: appointmentsWithReviews.length,
          });
        } else {
          setReviewStats({ averageRating: 0, totalReviews: 0 });
        }
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
      // Fallback to workshop stats if fetch fails
      setReviewStats(null);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <ExternalLink className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Workshop Not Found
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workshop) {
    return null;
  }

  const isOpen = isWorkshopOpen(workshop.profile.operatingHours);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-end mb-8">
        {/* Request Quote Button */}
        <Button
          onClick={handleRequestQuote}
          size="lg"
        >
          Request Quote
        </Button>
      </div>

      {/* Floating Action Buttons - Mobile & Tablet Only */}
      <style jsx>{`
        @keyframes smooth-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .floating-action-btn {
          animation: smooth-bounce 2s ease-in-out infinite;
        }

        .floating-action-btn:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-4 lg:hidden">
        {/* Call Button */}
        <a
          href={getTelLink()}
          className="floating-action-btn flex items-center justify-center w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Call Workshop"
        >
          <Phone className="w-6 h-6" />
        </a>

        {/* WhatsApp Button */}
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-action-btn flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Contact via WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      {/* Hero Section */}
      <Card className="mb-8 overflow-hidden shadow-lg">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
            {workshop.profile.coverImage ? (
              <>
                <img
                  src={workshop.profile.coverImage}
                  alt={workshop.profile.businessName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-16 h-16 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Logo - Centered on Mobile/Tablet, Left on Desktop */}
          <div className="relative flex justify-center lg:justify-start -mt-12 sm:-mt-14 lg:-mt-16 px-6 z-10">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 border-4 border-background shadow-xl ring-2 ring-primary/10 relative z-10">
              <AvatarImage
                src={workshop.profile.logo}
                alt={workshop.profile.businessName}
              />
              <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary/10 text-primary">
                {workshop.profile.businessName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <CardContent className="relative pt-4 pb-6 sm:pb-8 bg-background">
            <div className="flex flex-col items-center lg:items-start gap-4 sm:gap-6">
              {/* Basic Info */}
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {workshop.profile.businessName}
                  </h1>
                  {workshop.isVerified && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs sm:text-sm"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge
                    variant={isOpen ? "default" : "secondary"}
                    className="text-xs sm:text-sm"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {isOpen ? "Open Now" : "Closed"}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex justify-center lg:justify-start">
                    <RatingDisplay
                      rating={
                        reviewStats?.averageRating ?? workshop.stats.averageRating
                      }
                      totalReviews={
                        reviewStats?.totalReviews ?? workshop.stats.totalReviews
                      }
                    />
                  </div>
                  <div className="flex items-center justify-center lg:justify-start text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {workshop.contact.address.emirate || workshop.contact.address.city},{" "}
                      {workshop.contact.address.zipCode}
                    </span>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2">
                  {workshop.profile.description}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm">
                  {workshop.profile.yearEstablished && (
                    <div className="flex items-center text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      <span className="font-medium">Est. {workshop.profile.yearEstablished}</span>
                    </div>
                  )}
                  {workshop.profile.employeeCount && (
                    <div className="flex items-center text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      <span className="font-medium">{workshop.profile.employeeCount} employees</span>
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    <span className="font-medium">
                      {workshop.profile.certifications?.length || 0} certifications
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("portfolio")}
          className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "portfolio"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Portfolio ({workshop.profile.portfolio?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 sm:px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "reviews"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviews ({reviewStats?.totalReviews ?? workshop.stats.totalReviews})
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <WorkshopProfile workshop={workshop} activeTab={activeTab} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone with Call Button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground/60" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{workshop.contact.phone}</p>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    asChild
                  >
                    <a href={getTelLink()}>
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      Call
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    asChild
                  >
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4" />

              {/* Email */}
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-muted-foreground/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <a
                    href={`mailto:${workshop.contact.email}`}
                    className="font-medium text-sm text-primary hover:underline break-all"
                  >
                    {workshop.contact.email}
                  </a>
                  <p className="text-xs text-muted-foreground">Email Address</p>
                </div>
              </div>

              {/* Website */}
              {workshop.contact.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-3 text-muted-foreground/60 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={workshop.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sm text-primary hover:underline flex items-center gap-1 break-all"
                    >
                      Visit Website
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <p className="text-xs text-muted-foreground">Website</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4" />

              {/* Address */}
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-muted-foreground/60 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {workshop.contact.address.street}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {workshop.contact.address.emirate || workshop.contact.address.city},{" "}
                    {workshop.contact.address.zipCode}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${workshop.contact.address.street}, ${workshop.contact.address.emirate || workshop.contact.address.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1.5" />
                      View on Map
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {Object.entries(workshop.profile.operatingHours || {}).map(
                ([day, hours]) => {
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.toLowerCase();
                  return (
                    <div
                      key={day}
                      className={`flex justify-between items-center py-2 px-3 rounded-lg transition-colors ${
                        isToday
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span className={`capitalize font-medium text-sm ${isToday ? "text-primary" : ""}`}>
                        {day}
                        {isToday && <span className="ml-2 text-xs">(Today)</span>}
                      </span>
                      <span className={`text-sm ${hours.closed ? "text-muted-foreground" : "font-medium"}`}>
                        {hours.closed
                          ? "Closed"
                          : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  );
                }
              )}
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  Services Offered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {workshop.profile.specializations?.serviceTypes?.map(
                    (service) => (
                      <Badge
                        key={service}
                        variant="outline"
                        className="text-xs border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {getServiceTypeLabel(service)}
                      </Badge>
                    ),
                  )}
                </div>
              </div>

              <div className="border-t pt-4" />

              <div>
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  Car Brands
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {workshop.profile.specializations?.carBrands?.map((brand) => (
                    <Badge
                      key={brand}
                      variant="secondary"
                      className="text-xs hover:bg-secondary/80 transition-colors"
                    >
                      {getCarBrandLabel(brand)}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {workshop.profile.features?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Features & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {workshop.profile.features?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-3 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enhanced Car Service Modal for quote request flow */}
      <EnhancedCarServiceModal />
    </div>
  );
}
