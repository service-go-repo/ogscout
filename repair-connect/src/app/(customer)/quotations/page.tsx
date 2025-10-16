"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
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
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Quotation, QuotationStatus } from "@/models/Quotation";

// Utility functions
function getStatusColor(status: string): string {
  // Handle appointment statuses
  switch (status) {
    case "requested":
      return "bg-primary/10 text-primary";
    case "confirmed":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200";
    case "scheduled":
      return "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200";
    case "in_progress":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    // Quotation statuses
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
    case "quoted":
      return "bg-primary/10 text-primary";
    case "accepted":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    case "rejected":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "text-destructive";
    case "medium":
      return "text-amber-600 dark:text-amber-400";
    case "low":
      return "text-emerald-600 dark:text-emerald-400";
    default:
      return "text-muted-foreground";
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(amount);
}

function getQuotationSummary(quotation: Quotation) {
  const submittedQuotes =
    quotation.quotes?.filter(
      (q) =>
        q.status === "submitted" ||
        q.status === "accepted" ||
        q.status === "declined",
    ) || [];
  const acceptedQuote = quotation.quotes?.find((q) => q.status === "accepted");

  return {
    hasSubmittedQuotes: submittedQuotes.length > 0,
    submittedQuotes: submittedQuotes.length,
    pendingQuotes:
      quotation.quotes?.filter((q) => q.status === "pending").length || 0,
    priceRange:
      submittedQuotes.length > 0
        ? {
            min: Math.min(...submittedQuotes.map((q) => q.totalAmount)),
            max: Math.max(...submittedQuotes.map((q) => q.totalAmount)),
          }
        : null,
    acceptedQuote,
  };
}

export default function CustomerQuotationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [appointments, setAppointments] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | "all">(
    "all",
  );
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user.role !== "customer") {
      router.push("/");
      return;
    }

    fetchQuotations();
  }, [session, status, router]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/quotations?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        const quotationsList = data.data.quotations;
        setQuotations(quotationsList);

        // Fetch appointments for quotations with accepted quotes
        const appointmentsMap: { [key: string]: any } = {};
        await Promise.all(
          quotationsList.map(async (quotation: Quotation) => {
            if (quotation.status === "accepted" || quotation.acceptedQuoteId) {
              try {
                const aptResponse = await fetch(
                  `/api/appointments?quotationId=${quotation._id}`,
                );
                const aptData = await aptResponse.json();
                if (aptData.success && aptData.data.appointments.length > 0) {
                  appointmentsMap[quotation._id.toString()] =
                    aptData.data.appointments[0];
                }
              } catch (error) {
                console.error(
                  `Error fetching appointment for quotation ${quotation._id}:`,
                  error,
                );
              }
            }
          }),
        );
        setAppointments(appointmentsMap);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchQuotations();
    }
  }, [statusFilter]);

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      searchTerm === "" ||
      quotation.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.vehicle.model
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.damageDescription.some(
        (damage) =>
          damage.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
          damage.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Get appointment status for this quotation
    const appointment = appointments[quotation._id.toString()];
    const isCompleted =
      appointment?.status === "completed" || quotation.status === "completed";

    // For "all" tab, exclude completed quotations
    if (activeTab === "all") {
      return matchesSearch && !isCompleted;
    }

    // For "completed" tab, only show completed quotations
    if (activeTab === "completed") {
      return matchesSearch && isCompleted;
    }

    // For other tabs, match the quotation status
    const matchesTab = quotation.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const getTabCounts = () => {
    const completedCount = quotations.filter((q) => {
      const appointment = appointments[q._id.toString()];
      return appointment?.status === "completed" || q.status === "completed";
    }).length;

    return {
      all: quotations.length - completedCount, // Exclude completed from "all" count
      pending: quotations.filter((q) => q.status === "pending").length,
      quoted: quotations.filter((q) => q.status === "quoted").length,
      accepted: quotations.filter((q) => q.status === "accepted").length,
      completed: completedCount,
    };
  };

  const tabCounts = getTabCounts();

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your quotations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My Quote Requests
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your repair quotations and compare offers
          </p>
        </div>
        {/* Desktop Button */}
        <Button
          onClick={() => router.push("/quotations/request")}
          className="hidden sm:flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Quote Request
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
              <Input
                placeholder="Search by vehicle, damage area, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: QuotationStatus | "all") =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pill-Style Tabs */}
      <div className="mb-6">
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-foreground border border-border hover:bg-accent"
              }`}
            >
              All
              {tabCounts.all > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "all"
                    ? "bg-white text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tabCounts.all}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "pending"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-foreground border border-border hover:bg-accent"
              }`}
            >
              Pending
              {tabCounts.pending > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "pending"
                    ? "bg-white text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tabCounts.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("quoted")}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "quoted"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-foreground border border-border hover:bg-accent"
              }`}
            >
              Quoted
              {tabCounts.quoted > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "quoted"
                    ? "bg-white text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tabCounts.quoted}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("accepted")}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "accepted"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-foreground border border-border hover:bg-accent"
              }`}
            >
              Accepted
              {tabCounts.accepted > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "accepted"
                    ? "bg-white text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tabCounts.accepted}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === "completed"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-foreground border border-border hover:bg-accent"
              }`}
            >
              Completed
              {tabCounts.completed > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  activeTab === "completed"
                    ? "bg-white text-primary"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {tabCounts.completed}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {filteredQuotations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {activeTab === "all"
                  ? "No quotations found"
                  : `No ${activeTab} quotations`}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "all"
                  ? "You haven't created any quote requests yet."
                  : `You don't have any ${activeTab} quotations at the moment.`}
              </p>
              {activeTab === "all" && (
                <Button onClick={() => router.push("/quotations/request")}>
                  Create Your First Quote Request
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <QuotationCard
              key={quotation._id?.toString()}
              quotation={quotation}
              appointment={appointments[quotation._id.toString()]}
              onView={() => router.push(`/quotations/${quotation._id}`)}
            />
          ))}
        </div>
      )}

      {/* Mobile Bottom Button */}
      <div className="sm:hidden mt-8">
        <Button
          onClick={() => router.push("/quotations/request")}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Quote Request
        </Button>
      </div>
    </div>
  );
}

interface QuotationCardProps {
  quotation: Quotation;
  appointment?: any;
  onView: () => void;
}

function QuotationCard({ quotation, appointment, onView }: QuotationCardProps) {
  const summary = getQuotationSummary(quotation);

  // Get car image from gallery or thumbnail
  const getCarImage = () => {
    // Check if vehicle has gallery with images
    const vehicleWithGallery = quotation.vehicle as any;
    if (vehicleWithGallery.gallery && vehicleWithGallery.gallery.length > 0) {
      return vehicleWithGallery.gallery[0].url;
    }
    // Check for thumbnailUrl
    if (vehicleWithGallery.thumbnailUrl) {
      return vehicleWithGallery.thumbnailUrl;
    }
    return null;
  };

  const carImageUrl = getCarImage();

  // Determine display status based on appointment status if available
  const getDisplayStatus = () => {
    if (appointment) {
      switch (appointment.status) {
        case "requested":
          return "Appointment Requested";
        case "confirmed":
          return "Appointment Confirmed";
        case "scheduled":
          return "Scheduled";
        case "in_progress":
          return "In Progress";
        case "completed":
          return "Completed";
        default:
          return quotation.status;
      }
    }
    return quotation.status;
  };

  const displayStatus = getDisplayStatus();

  const getStatusIcon = (status: string) => {
    // Map appointment statuses to icons
    if (appointment) {
      switch (appointment.status) {
        case "requested":
        case "confirmed":
        case "scheduled":
          return <Calendar className="h-4 w-4" />;
        case "in_progress":
          return <Clock className="h-4 w-4" />;
        case "completed":
          return <CheckCircle className="h-4 w-4" />;
      }
    }

    // Default quotation status icons
    switch (status as QuotationStatus) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "quoted":
        return <MessageSquare className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "declined":
      case "expired":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Vehicle Name */}
          <div className="font-semibold text-lg">
            {quotation.vehicle.year} {quotation.vehicle.make}{" "}
            {quotation.vehicle.model}
          </div>

          {/* Status and Priority Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={getStatusColor(
                appointment ? appointment.status : quotation.status,
              )}
            >
              {getStatusIcon(displayStatus)}
              <span className="ml-1 capitalize">{displayStatus}</span>
            </Badge>
            <Badge
              className={getPriorityColor(quotation.priority)}
              variant="outline"
            >
              {quotation.priority.toUpperCase()}
            </Badge>
            {/* Quote Count Badge */}
            {summary.hasSubmittedQuotes && (
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {summary.submittedQuotes} quote
                {summary.submittedQuotes !== 1 ? "s" : ""} received
              </Badge>
            )}
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1.5">
            {quotation.requestedServices.slice(0, 3).map((service) => (
              <Badge key={service} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
            {quotation.requestedServices.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{quotation.requestedServices.length - 3} more
              </Badge>
            )}
          </div>

          {/* Workshop Names */}
          {(quotation as any).targetWorkshopsWithDetails && (quotation as any).targetWorkshopsWithDetails.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Workshop{(quotation as any).targetWorkshopsWithDetails.length > 1 ? 's' : ''}:</span>{" "}
              {(quotation as any).targetWorkshopsWithDetails.map((w: any) => w.workshopName).join(", ")}
            </div>
          )}

          {/* Issues */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Issues:</span>{" "}
            {quotation.damageDescription.map((d) => d.area).join(", ")}
          </div>

          {/* Bottom Section - Mobile Optimized */}
          <div className="space-y-3 pt-3 border-t border-border/50">
            {/* Location and Date */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{quotation.city}, {quotation.state}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(quotation.createdAt), "MMM dd, yyyy")}</span>
              </div>
            </div>

            {/* Price and Action Button */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
              {/* Price */}
              <div className="flex-shrink-0">
                {summary.priceRange ? (
                  <div className="font-semibold text-base">
                    {formatCurrency(summary.priceRange.min)} -{" "}
                    {formatCurrency(summary.priceRange.max)}
                  </div>
                ) : summary.acceptedQuote ? (
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold text-base">
                    {formatCurrency(summary.acceptedQuote.totalAmount)}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {summary.pendingQuotes > 0
                      ? `Waiting for ${summary.pendingQuotes} quote${summary.pendingQuotes !== 1 ? "s" : ""}`
                      : "No quotes yet"}
                  </div>
                )}
              </div>

              {/* View Details Button - Full Width on Mobile */}
              <Button
                size="sm"
                className="flex items-center justify-center gap-2 w-full xs:w-auto xs:min-w-[140px]"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
