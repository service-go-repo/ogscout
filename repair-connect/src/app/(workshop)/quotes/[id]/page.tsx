"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Loader2,
  Eye,
} from "lucide-react";
import { Quotation } from "@/models/Quotation";
import { Workshop } from "@/models/Workshop";
import CarDetails from "@/components/quotations/car-details";
import ImageViewer from "@/components/quotations/image-viewer";
import QuoteSubmissionForm from "@/components/workshops/quote-submission-form";
import { format } from "date-fns";
import { toast } from "sonner";

interface QuoteRequestDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuoteRequestDetailPage({
  params,
}: QuoteRequestDetailPageProps) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [quoteFormOpen, setQuoteFormOpen] = useState(false);
  const [quoteDetailsModalOpen, setQuoteDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user.role !== "workshop") {
      router.push("/");
      return;
    }

    fetchData();
  }, [session, status, router, resolvedParams.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch quotation and workshop data in parallel
      const [quotationResponse, workshopResponse] = await Promise.all([
        fetch(`/api/quotations/${resolvedParams.id}`),
        fetch("/api/workshops/profile"),
      ]);

      const [quotationData, workshopData] = await Promise.all([
        quotationResponse.json(),
        workshopResponse.json(),
      ]);

      if (quotationData.success) {
        setQuotation(quotationData.data);
      } else {
        toast.error("Failed to load quote request");
        router.push("/quotes");
      }

      if (workshopData.success && workshopData.data) {
        setWorkshop(workshopData.data);
      } else {
        toast.error("Workshop profile not found");
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while loading the data");
      router.push("/quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSubmitSuccess = () => {
    // Refresh the quotation data to show updated quote
    fetchData();
  };

  const handleViewImages = (images: string[]) => {
    setSelectedImages(images);
    setImageViewerOpen(true);
  };

  const getMyQuote = () => {
    return quotation?.quotes?.find(
      (q) => q.workshopId.toString() === session?.user.id,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
      case "quoted":
        return "bg-primary/10 text-primary";
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quote request...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Quote Request Not Found
          </h1>
          <Button onClick={() => router.push("/quotes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote Requests
          </Button>
        </div>
      </div>
    );
  }

  const myQuote = getMyQuote();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        <div>
          <Button variant="outline" onClick={() => router.push("/quotes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote Requests
          </Button>
        </div>

        {/* Title, Status, and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Quote Request Details
            </h1>
            <p className="text-muted-foreground">
              {quotation.vehicle.make} {quotation.vehicle.model}{" "}
              {quotation.vehicle.year}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(quotation.status)}>
              {getStatusIcon(quotation.status)}
              <span className="ml-1 capitalize">{quotation.status}</span>
            </Badge>

            {!myQuote &&
              (quotation.status === "pending" ||
                quotation.status === "quoted") && (
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setQuoteFormOpen(true)}
                >
                  <FileText className="h-4 w-4" />
                  Submit Quote
                </Button>
              )}

            {myQuote && myQuote.status === "submitted" && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setQuoteFormOpen(true)}
              >
                <FileText className="h-4 w-4" />
                Edit Submitted Quote
              </Button>
            )}

            {myQuote && (myQuote.status === "accepted" || myQuote.status === "declined") && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setQuoteDetailsModalOpen(true)}
              >
                <Eye className="h-4 w-4" />
                View Quote Details
              </Button>
            )}

            {myQuote && myQuote.status === "pending" && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setQuoteFormOpen(true)}
              >
                <FileText className="h-4 w-4" />
                Update Quote
              </Button>
            )}
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
        <CardContent>
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
              <p className="text-sm text-muted-foreground">Competing Quotes</p>
              <p className="font-medium">
                {quotation.quotes?.length || 0} submitted
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Quote Status */}
      {myQuote && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              My Quote Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {/* Left Column */}
              <div className="flex-1 space-y-3">
                {myQuote.status === "accepted" && (
                  <>
                    <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-xl">
                      🎉 Congratulations!
                    </div>
                    <p className="text-muted-foreground">
                      Your quote was accepted
                    </p>
                  </>
                )}
                {myQuote.status !== "accepted" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(myQuote.status)}>
                      {getStatusIcon(myQuote.status)}
                      <span className="ml-1 capitalize">{myQuote.status}</span>
                    </Badge>
                    {myQuote.updatedAt &&
                      new Date(myQuote.updatedAt).getTime() !== new Date(myQuote.submittedAt).getTime() && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Edited {format(new Date(myQuote.updatedAt), "MMM dd, HH:mm")}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="text-3xl font-bold text-foreground">
                  AED {myQuote.totalAmount.toLocaleString()}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Submitted{" "}
                    {format(new Date(myQuote.submittedAt), "MMM dd, yyyy HH:mm")}
                  </p>
                  {myQuote.validUntil && (
                    <p className="text-sm text-muted-foreground">
                      Valid until{" "}
                      {format(new Date(myQuote.validUntil), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              {myQuote.status === "accepted" && (
                <div className="flex items-center justify-center md:justify-end">
                  <CheckCircle className="h-16 w-16 md:h-32 md:w-32 text-emerald-500 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
              )}
            </div>
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
        customerInfo={{
          name: quotation.customerName,
          email: quotation.customerEmail,
          phone: quotation.customerPhone,
        }}
        location={{
          address: quotation.address,
          city: quotation.city,
          state: quotation.state,
        }}
        createdAt={quotation.createdAt}
        priority={quotation.priority}
        viewMode="workshop"
        competitionStatus={quotation.status}
        isWinner={myQuote?.status === "accepted"}
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
                  <span className="text-sm text-muted-foreground/80">
                    {format(new Date(message.timestamp), "MMM dd, yyyy HH:mm")}
                  </span>
                </div>
                <p className="text-foreground/90">{message.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Competition Summary */}
      {quotation.quotes && quotation.quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Competition Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quotation.status === "accepted" ? (
              // Show full results after customer decision
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    Competition Closed - Winner Selected
                  </Badge>
                </div>
                {quotation.quotes.map((quote, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {quote.workshopId.toString() === session?.user.id
                          ? "Your Quote"
                          : quote.workshopName}
                      </span>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status === "accepted" ? "WINNER" : quote.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        AED {quote.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground/80">
                        {format(new Date(quote.submittedAt), "MMM dd")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show competition status without revealing competitor pricing
              <div className="space-y-4">
                <div className="text-center">
                  <Badge className="bg-primary/10 text-primary">
                    Competition Active -{" "}
                    {
                      quotation.quotes.filter((q) => q.status === "submitted")
                        .length
                    }{" "}
                    of {quotation.quotes.length} quotes submitted
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {quotation.quotes.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Competitors
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {
                        quotation.quotes.filter((q) => q.status === "submitted")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Quotes Submitted
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  🔒 Competitor quotes are hidden until the customer makes their
                  decision
                </div>
              </div>
            )}
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

      {/* Quote Submission Form */}
      {workshop && (
        <QuoteSubmissionForm
          isOpen={quoteFormOpen}
          onClose={() => setQuoteFormOpen(false)}
          quotationId={resolvedParams.id}
          existingQuote={myQuote}
          workshop={workshop}
          onSubmitSuccess={handleQuoteSubmitSuccess}
        />
      )}

      {/* Quote Details Modal */}
      {myQuote && (
        <Dialog open={quoteDetailsModalOpen} onOpenChange={setQuoteDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Quote Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Quote Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quote Summary</span>
                    <Badge className={getStatusColor(myQuote.status)}>
                      {getStatusIcon(myQuote.status)}
                      <span className="ml-1 capitalize">{myQuote.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">AED {myQuote.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted On</p>
                      <p className="font-medium">{format(new Date(myQuote.submittedAt), "MMM dd, yyyy HH:mm")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valid Until</p>
                      <p className="font-medium">
                        {myQuote.validUntil ? format(new Date(myQuote.validUntil), "MMM dd, yyyy") : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Duration</p>
                      <p className="font-medium">{myQuote.estimatedDuration} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myQuote.services.map((service, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{service.serviceType}</h4>
                          <span className="font-bold">
                            AED {(service.laborHours * service.laborRate).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <div className="text-sm text-muted-foreground">
                          {service.laborHours}h × AED {service.laborRate}/h
                        </div>

                        {service.parts && service.parts.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Parts:</p>
                            {service.parts.map((part, partIndex) => (
                              <div key={partIndex} className="flex justify-between text-sm bg-muted/50 rounded p-2">
                                <span>
                                  {part.name} {part.isOEM && <Badge variant="secondary" className="ml-1 text-xs">OEM</Badge>}
                                  <span className="text-muted-foreground ml-2">×{part.quantity}</span>
                                </span>
                                <span className="font-medium">AED {(part.quantity * part.unitPrice).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Terms & Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Warranty</p>
                      <p className="font-medium">{myQuote.warranty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Payment Terms</p>
                      <p className="font-medium">{myQuote.paymentTerms}</p>
                    </div>
                    {myQuote.estimatedStartDate && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estimated Start Date</p>
                        <p className="font-medium">{format(new Date(myQuote.estimatedStartDate), "MMM dd, yyyy")}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">AED {(myQuote.totalAmount - (myQuote.tax || 0) + (myQuote.discount || 0)).toLocaleString()}</span>
                      </div>
                      {myQuote.discount && myQuote.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>- AED {myQuote.discount.toLocaleString()}</span>
                        </div>
                      )}
                      {myQuote.tax && myQuote.tax > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-medium">AED {myQuote.tax.toLocaleString()}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>AED {myQuote.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {myQuote.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{myQuote.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
