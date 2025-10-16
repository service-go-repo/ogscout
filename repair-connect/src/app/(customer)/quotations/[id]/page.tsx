"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
} from "lucide-react";
import { Quotation } from "@/models/Quotation";
import CarDetails from "@/components/quotations/car-details";
import ImageViewer from "@/components/quotations/image-viewer";
import QuoteComparison from "@/components/quotations/quote-comparison";
import AppointmentBooking from "@/components/appointments/appointment-booking";
import { format } from "date-fns";
import { toast } from "sonner";

interface QuotationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuotationDetailPage({
  params,
}: QuotationDetailPageProps) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<any>(null);
  const [workshopInfo, setWorkshopInfo] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user.role !== "customer") {
      router.push("/");
      return;
    }

    fetchQuotation();
  }, [session, status, router, resolvedParams.id]);

  const fetchQuotation = async () => {
    try {
      setLoading(true);

      // Fetch basic quotation data
      const quotationResponse = await fetch(
        `/api/quotations/${resolvedParams.id}`,
      );
      const quotationData = await quotationResponse.json();

      if (!quotationData.success) {
        toast.error("Failed to load quotation");
        router.push("/quotations");
        return;
      }

      // Fetch enriched quotes with workshop details
      const quotesResponse = await fetch(
        `/api/quotations/${resolvedParams.id}/quotes`,
      );
      const quotesData = await quotesResponse.json();

      if (quotesData.success) {
        // Merge enriched quotes with quotation data
        const enrichedQuotation = {
          ...quotationData.data,
          quotes: quotesData.data.quotes,
        };
        setQuotation(enrichedQuotation);

        // If quote is accepted, check for existing appointments and load workshop info
        if (
          enrichedQuotation.status === "accepted" &&
          enrichedQuotation.acceptedQuoteId
        ) {
          await checkExistingAppointment(enrichedQuotation);
          await loadWorkshopInfo(enrichedQuotation);
        }
      } else {
        // Fallback to basic quotation data if enriched quotes fail
        const basicQuotation = quotationData.data;
        setQuotation(basicQuotation);

        // If quote is accepted, check for existing appointments and load workshop info
        if (
          basicQuotation.status === "accepted" &&
          basicQuotation.acceptedQuoteId
        ) {
          await checkExistingAppointment(basicQuotation);
          await loadWorkshopInfo(basicQuotation);
        }
      }
    } catch (error) {
      console.error("Error fetching quotation:", error);
      toast.error("An error occurred while loading the quotation");
      router.push("/quotations");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAppointment = async (quotationData: any) => {
    try {
      // Check if an appointment already exists for this quotation
      const response = await fetch(
        `/api/appointments?quotationId=${quotationData._id}`,
      );
      const data = await response.json();

      if (data.success && data.data.appointments.length > 0) {
        setExistingAppointment(data.data.appointments[0]);
      } else {
        setExistingAppointment(null);
      }
    } catch (error) {
      console.error("Error checking existing appointment:", error);
    }
  };

  const loadWorkshopInfo = async (quotationData: any) => {
    try {
      const acceptedQuote = quotationData.quotes?.find(
        (q: any) => q.status === "accepted",
      );
      if (!acceptedQuote) return;

      const response = await fetch(
        `/api/workshops/${acceptedQuote.workshopId}`,
      );
      const data = await response.json();

      if (data.success) {
        setWorkshopInfo({
          _id: data.data._id,
          name: data.data.profile.businessName,
          address: `${data.data.contact.address.street}, ${data.data.contact.address.emirate || data.data.contact.address.city}, ${data.data.contact.address.zipCode}`,
          phone: data.data.contact.phone,
          email: data.data.contact.email,
          logo: data.data.profile.logo,
          operatingHours: data.data.profile.operatingHours,
        });
      }
    } catch (error) {
      console.error("Error loading workshop info:", error);
    }
  };

  const handleViewImages = (images: string[]) => {
    setSelectedImages(images);
    setImageViewerOpen(true);
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/quotations/${resolvedParams.id}/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success(
          "Quote accepted successfully! Now let's schedule your appointment.",
        );

        // Update quotation data immediately
        setQuotation(data.data);

        // Load workshop info and check for existing appointments
        await loadWorkshopInfo(data.data);
        await checkExistingAppointment(data.data);
      } else {
        toast.error(data.error || "Failed to accept quote");
      }
    } catch (error) {
      console.error("Error accepting quote:", error);
      toast.error("An error occurred while accepting the quote");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineQuote = async (quoteId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/quotations/${resolvedParams.id}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quoteId }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Quote declined successfully");
        fetchQuotation(); // Refresh data
      } else {
        toast.error(data.error || "Failed to decline quote");
      }
    } catch (error) {
      console.error("Error declining quote:", error);
      toast.error("An error occurred while declining the quote");
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactWorkshop = (quote: any) => {
    // Open contact dialog or redirect to workshop contact page
    window.open(`tel:${quote.contactPhone}`, "_self");
  };

  const handleBookAppointment = (quote: any) => {
    // Set workshop info and show appointment booking modal
    setWorkshopInfo({
      _id: quote.workshopId,
      name: quote.workshopName,
      address: quote.location?.address || "",
      phone: quote.contactPhone,
      email: quote.contactEmail,
    });
    setShowBookingModal(true);
  };

  const handleAppointmentCreated = (appointment: any) => {
    setExistingAppointment(appointment);
    setShowBookingModal(false);
    toast.success("Appointment scheduled successfully!");
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
      case "quoted":
        return "bg-primary/10 text-primary dark:bg-primary/20";
      case "accepted":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
      case "declined":
        return "bg-destructive/10 text-destructive";
      case "expired":
        return "bg-muted text-muted-foreground";
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
      case "cancelled":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "quoted":
        return <FileText className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      case "expired":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Quotation Not Found
          </h1>
          <Button onClick={() => router.push("/quotations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Quotations
          </Button>
        </div>
      </div>
    );
  }

  const submittedQuotes =
    quotation.quotes?.filter(
      (q) =>
        q.status === "submitted" ||
        q.status === "accepted" ||
        q.status === "declined",
    ) || [];
  const acceptedQuote = quotation.quotes?.find((q) => q.status === "accepted");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/quotations")}
            className="w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Quotations
          </Button>
        </div>

        {/* Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              My Quotation Request
            </h1>
            <p className="text-muted-foreground mt-1">
              {quotation.vehicle.make} {quotation.vehicle.model}{" "}
              {quotation.vehicle.year}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(quotation.status)}>
              {getStatusIcon(quotation.status)}
              <span className="ml-1 capitalize">{quotation.status}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Request Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Request Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Request ID</p>
              <p className="font-mono text-sm">
                {quotation._id.toString().slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium">
                {format(new Date(quotation.createdAt), "MMM dd, yyyy HH:mm")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expires</p>
              <p className="font-medium">
                {format(new Date(quotation.expiresAt), "MMM dd, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quotes Received</p>
              <p className="font-medium">
                {submittedQuotes.length} of{" "}
                {quotation.targetWorkshops?.length || 0}
              </p>
            </div>
          </div>

          {/* Workshop Names */}

          {(quotation as any).targetWorkshopsWithDetails && (quotation as any).targetWorkshopsWithDetails.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Workshop{(quotation as any).targetWorkshopsWithDetails.length > 1 ? 's' : ''} ({(quotation as any).targetWorkshopsWithDetails.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {(quotation as any).targetWorkshopsWithDetails.map((workshop: any, index: number) => (
                  <Badge
                    key={index}
                    variant={workshop.status === 'accepted' ? 'default' : workshop.status === 'submitted' ? 'default' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    <Building2 className="h-3 w-3" />
                    {workshop.workshopName}
                    <span className="text-xs ml-1 opacity-75">
                      ({workshop.status === 'pending' ? 'Waiting' : workshop.status === 'submitted' ? 'Quoted' : workshop.status})
                    </span>
                    {workshop.status === 'accepted' && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sent on {format(new Date(quotation.createdAt), "MMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quote Comparison */}
      {submittedQuotes.length > 0 && (
        <QuoteComparison
          quotes={submittedQuotes}
          onAcceptQuote={handleAcceptQuote}
          onDeclineQuote={handleDeclineQuote}
          onContactWorkshop={handleContactWorkshop}
          onBookAppointment={handleBookAppointment}
          isLoading={actionLoading}
          acceptedQuoteId={acceptedQuote?.id}
          hasExistingAppointment={!!existingAppointment}
          appointmentData={existingAppointment}
        />
      )}

      {/* Waiting for Quotes */}
      {submittedQuotes.length === 0 &&
        !acceptedQuote &&
        quotation.status === "pending" && (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Waiting for Quotes
              </h3>
              <p className="text-muted-foreground mb-4">
                Your request has been sent to{" "}
                {quotation.targetWorkshops?.length || 0} workshop
                {quotation.targetWorkshops?.length !== 1 ? "s" : ""}. You'll be
                notified when quotes are received.
              </p>
              <p className="text-sm text-muted-foreground/80">
                Request expires on{" "}
                {format(new Date(quotation.expiresAt), "MMM dd, yyyy")}
              </p>
            </CardContent>
          </Card>
        )}


      {/* Car Details */}
      <CarDetails
        vehicle={quotation.vehicle}
        damageDescription={quotation.damageDescription}
        requestedServices={quotation.requestedServices}
        carImages={(quotation as any).carImages} // Car media images
        timeline={quotation.timeline}
        budget={quotation.budget}
        location={{
          address: quotation.address,
          city: quotation.city,
          state: quotation.state,
        }}
        createdAt={quotation.createdAt}
        priority={quotation.priority}
        viewMode="customer"
        onViewImages={handleViewImages}
      />

      {/* Messages */}
      {quotation.messages && quotation.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages & Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotation.messages.map((message, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{message.from}</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(message.timestamp), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-foreground">{message.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Image Viewer */}
      <ImageViewer
        images={selectedImages}
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        title="Vehicle & Damage Images"
      />

      {/* Appointment Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book Appointment
            </DialogTitle>
            <DialogDescription>
              Schedule your service appointment with {workshopInfo?.name}
            </DialogDescription>
          </DialogHeader>

          {workshopInfo && quotation && (
            <AppointmentBooking
              quotationId={quotation._id.toString()}
              acceptedQuoteId={
                quotation.quotes?.find((q) => q.status === "accepted")?.id || ""
              }
              workshopInfo={workshopInfo}
              quotationData={{
                vehicle: quotation.vehicle,
                requestedServices: quotation.requestedServices,
                customerName: quotation.customerName,
                customerEmail: quotation.customerEmail,
                customerPhone: quotation.customerPhone,
                timeline: {
                  preferredStartDate: quotation.timeline?.preferredStartDate
                    ? new Date(quotation.timeline.preferredStartDate).toISOString()
                    : undefined,
                  preferredCompletionDate: quotation.timeline?.preferredCompletionDate
                    ? new Date(quotation.timeline.preferredCompletionDate).toISOString()
                    : undefined,
                },
              }}
              onAppointmentCreated={handleAppointmentCreated}
              onCancel={handleCloseBookingModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
