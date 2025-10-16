"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Calendar,
  MapPin,
  Car,
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
  Quotation,
  QuotationStatus,
  getStatusColor,
  getPriorityColor,
  formatCurrency,
  getQuotationSummary,
  getServiceTypeLabel,
} from "@/models/Quotation";
import QuoteNotifications from "@/components/workshops/quote-notifications";

export default function WorkshopQuotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user.role !== "workshop") {
      router.push("/");
      return;
    }

    fetchQuotations();
  }, [session, status, router]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/quotations`);
      const data = await response.json();

      if (data.success) {
        setQuotations(data.data.quotations);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      searchTerm === "" ||
      quotation.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.vehicle.model
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.damageDescription.some(
        (damage) =>
          damage.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          damage.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Filter by tab
    let matchesTab = false;
    const myQuote = quotation.quotes?.find(
      (q) => q.workshopId.toString() === session?.user.id,
    );

    switch (activeTab) {
      case "available":
        // Available to quote (no quote submitted yet or pending) AND competition still active
        matchesTab =
          (!myQuote || myQuote.status === "pending") &&
          quotation.status !== "accepted";
        break;
      case "submitted":
        // Quotes I've submitted
        matchesTab = myQuote?.status === "submitted";
        break;
      case "accepted":
        // My accepted quotes
        matchesTab = myQuote?.status === "accepted";
        break;
      case "declined":
        // My declined quotes
        matchesTab = myQuote?.status === "declined";
        break;
      case "missed":
        // Missed opportunities - was invited but didn't submit quote and someone else won
        matchesTab =
          (!myQuote || myQuote.status === "pending") &&
          quotation.status === "accepted";
        break;
      default:
        matchesTab = true;
    }

    return matchesSearch && matchesTab;
  });

  const getTabCounts = () => {
    return {
      available: quotations.filter((q) => {
        const myQuote = q.quotes?.find(
          (quote) => quote.workshopId.toString() === session?.user.id,
        );
        return (
          (!myQuote || myQuote.status === "pending") && q.status !== "accepted"
        );
      }).length,
      submitted: quotations.filter((q) => {
        const myQuote = q.quotes?.find(
          (quote) => quote.workshopId.toString() === session?.user.id,
        );
        return myQuote?.status === "submitted";
      }).length,
      accepted: quotations.filter((q) => {
        const myQuote = q.quotes?.find(
          (quote) => quote.workshopId.toString() === session?.user.id,
        );
        return myQuote?.status === "accepted";
      }).length,
      declined: quotations.filter((q) => {
        const myQuote = q.quotes?.find(
          (quote) => quote.workshopId.toString() === session?.user.id,
        );
        return myQuote?.status === "declined";
      }).length,
      missed: quotations.filter((q) => {
        const myQuote = q.quotes?.find(
          (quote) => quote.workshopId.toString() === session?.user.id,
        );
        return (
          (!myQuote || myQuote.status === "pending") && q.status === "accepted"
        );
      }).length,
    };
  };

  const tabCounts = getTabCounts();

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quote requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quote Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and respond to customer repair requests
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {tabCounts.available} New Requests
          </Badge>
          <QuoteNotifications workshopId={session?.user.id || ""} />
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
            <Input
              placeholder="Search by vehicle, customer, or damage description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs - Pill Style */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <TabsList className="inline-flex h-auto bg-transparent py-2 gap-2">
            <TabsTrigger
              value="available"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Available
              {tabCounts.available > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current bg-background/30 text-[10px] font-bold">
                  {tabCounts.available}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="submitted"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Submitted
              {tabCounts.submitted > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current bg-background/30 text-[10px] font-bold">
                  {tabCounts.submitted}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="accepted"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Accepted
              {tabCounts.accepted > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current bg-background/30 text-[10px] font-bold">
                  {tabCounts.accepted}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="declined"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Declined
              {tabCounts.declined > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current bg-background/30 text-[10px] font-bold">
                  {tabCounts.declined}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="missed"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-border px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-accent hover:border-accent"
            >
              Missed
              {tabCounts.missed > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current bg-background/30 text-[10px] font-bold">
                  {tabCounts.missed}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {filteredQuotations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {activeTab === "available"
                      ? "No available requests"
                      : activeTab === "missed"
                        ? "No missed opportunities"
                        : `No ${activeTab} quotes`}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === "available"
                      ? "There are no quote requests available for your workshop at the moment."
                      : activeTab === "missed"
                        ? "Great! You haven't missed any quote opportunities. Keep monitoring for new requests."
                        : `You don't have any ${activeTab} quotes currently.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredQuotations.map((quotation) => (
                <QuotationRequestCard
                  key={quotation._id.toString()}
                  quotation={quotation}
                  workshopId={session?.user.id || ""}
                  onView={() => router.push(`/quotes/${quotation._id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface QuotationRequestCardProps {
  quotation: Quotation;
  workshopId: string;
  onView: () => void;
}

function QuotationRequestCard({
  quotation,
  workshopId,
  onView,
}: QuotationRequestCardProps) {
  const summary = getQuotationSummary(quotation);
  const myQuote = quotation.quotes?.find(
    (q) => q.workshopId.toString() === workshopId,
  );

  const getMyQuoteStatus = () => {
    if (!myQuote) {
      // If no quote submitted and competition is closed (someone won), mark as missed
      if (quotation.status === "accepted") return "missed";
      return "not_quoted";
    }
    return myQuote.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not_quoted":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "submitted":
        return <MessageSquare className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      case "missed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      not_quoted: "bg-primary/10 text-primary",
      pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
      submitted:
        "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
      accepted:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      declined: "bg-destructive/10 text-destructive",
      missed:
        "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
    };

    const labels = {
      not_quoted: "Available to Quote",
      pending: "Pending Response",
      submitted: "Quote Submitted",
      accepted: "Quote Accepted",
      declined: "Quote Declined",
      missed: "Missed Opportunity",
    };

    return (
      <Badge
        className={
          colors[status as keyof typeof colors] ||
          "bg-muted text-muted-foreground"
        }
      >
        {getStatusIcon(status)}
        <span className="ml-1">
          {labels[status as keyof typeof labels] || status}
        </span>
      </Badge>
    );
  };

  const myQuoteStatus = getMyQuoteStatus();

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Section - Main Info */}
          <div className="flex-1 space-y-3">
            {/* Vehicle & Status */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {quotation.vehicle.year} {quotation.vehicle.make}{" "}
                  {quotation.vehicle.model}
                </span>
              </div>
              {getStatusBadge(myQuoteStatus)}
              <Badge
                className={getPriorityColor(quotation.priority)}
                variant="outline"
              >
                {quotation.priority.toUpperCase()}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="font-medium">{quotation.customerName}</span>
              <span>•</span>
              {/* Show phone only if competition closed OR this workshop won */}
              {quotation.status === "accepted" ||
              quotation.status === "completed" ||
              quotation.status === "cancelled" ||
              myQuote?.status === "accepted" ? (
                <span>{quotation.customerPhone}</span>
              ) : (
                <span className="text-muted-foreground/60">
                  🔒 Contact via platform
                </span>
              )}
            </div>

            {/* Services & Damage */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {quotation.requestedServices.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {getServiceTypeLabel(service)}
                  </Badge>
                ))}
                {quotation.requestedServices.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{quotation.requestedServices.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Issues:</span>{" "}
                {quotation.damageDescription.map((d) => d.area).join(", ")}
              </div>
            </div>

            {/* Location & Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {quotation.city}, {quotation.state}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(quotation.createdAt), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {quotation.viewCount} views
              </div>
            </div>

            {/* Budget Range */}
            {quotation.budget &&
              (quotation.budget.min || quotation.budget.max) && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Budget:{" "}
                    {quotation.budget.min &&
                      formatCurrency(quotation.budget.min)}
                    {quotation.budget.min && quotation.budget.max && " - "}
                    {quotation.budget.max &&
                      formatCurrency(quotation.budget.max)}
                    {quotation.budget.isFlexible && " (flexible)"}
                  </span>
                </div>
              )}
          </div>

          {/* Right Section - Quote Info */}
          <div className="flex flex-col items-start lg:items-end space-y-2 lg:min-w-[200px]">
            {myQuote ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Your quote: {formatCurrency(myQuote.totalAmount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Submitted {format(new Date(myQuote.submittedAt), "MMM dd")}
                </div>
                {myQuote.status === "accepted" && (
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                    🎉 Accepted!
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  {summary.submittedQuotes} competing quote
                  {summary.submittedQuotes !== 1 ? "s" : ""}
                </div>
                {quotation.status === "accepted" ? (
                  // Show price range only after customer decision
                  summary.priceRange && (
                    <div className="text-xs text-muted-foreground">
                      Range: {formatCurrency(summary.priceRange.min)} -{" "}
                      {formatCurrency(summary.priceRange.max)}
                    </div>
                  )
                ) : (
                  // Hide pricing during active competition
                  <div className="text-xs text-muted-foreground">
                    🔒 Competitor pricing hidden
                  </div>
                )}
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-full lg:w-auto"
              onClick={() => onView()}
            >
              <FileText className="h-3 w-3" />
              {myQuote ? "View Details" : "View & Quote"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
