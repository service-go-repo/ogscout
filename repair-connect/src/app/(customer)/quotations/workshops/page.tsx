"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Car,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { Workshop } from "@/models/Workshop";
import { Car as CarType } from "@/models/Car";
import { ServiceType, getServiceTypeLabel } from "@/models/Quotation";
import WorkshopCard from "@/components/workshops/workshop-card";
import { toast } from "sonner";
import { useQuoteRequestStore } from "@/stores/quoteRequestStore";
import { useQuoteRequestSync } from "@/hooks/useQuoteRequestSync";
import { sendBulkQuoteRequests } from "@/lib/quoteRequestHelpers";

const serviceTypes: ServiceType[] = [
  // Mechanical Issues
  "engine",
  "transmission",
  "brakes",
  "suspension",
  "clutch",
  // Electrical Issues
  "electrical",
  "battery",
  "alternator",
  "lights",
  "electronics",
  // Body & Exterior
  "bodywork",
  "paint",
  "glass",
  "bumper",
  "dents",
  // Maintenance & Service
  "maintenance",
  "oil_change",
  "inspection",
  "tune_up",
  "filters",
  // Tires & Wheels
  "tires",
  "wheel_alignment",
  "tire_rotation",
  "wheel_balancing",
  // Other Services
  "detailing",
  "diagnostic",
  "repair",
  "other",
];

function WorkshopSelectionPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get("carId");
  const serviceRequestId = searchParams.get("serviceRequestId");

  // Use Zustand store for selectedCar (persisted to localStorage)
  const selectedCar = useQuoteRequestStore((state) => state.selectedCar);
  const setSelectedCar = useQuoteRequestStore((state) => state.setSelectedCar);
  const clearSelectedCar = useQuoteRequestStore((state) => state.clearSelectedCar);

  // Enable tab sync and optional server sync
  useQuoteRequestSync({
    syncWithServer: true,
    userId: session?.user?.id,
  });

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>(() => {
    // Restore selections from sessionStorage on mount
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('selectedWorkshops');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [carValidationError, setCarValidationError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "reviews">(
    "distance",
  );
  const [showFilters, setShowFilters] = useState(false);

  // Persist selected workshops to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedWorkshops', JSON.stringify(selectedWorkshops));
    }
  }, [selectedWorkshops]);

  // Hydrate from URL and validate car
  useEffect(() => {
    const fetchData = async () => {
      console.log("[Workshop Page] carId from URL:", carId);
      console.log("[Workshop Page] selectedCar from store:", selectedCar?._id);

      // Priority 1: Check if there's a carId in URL
      if (carId) {
        // If the URL carId matches the store, skip re-fetch
        if (selectedCar?._id?.toString() === carId) {
          console.log("[Workshop Page] Car already loaded from store");
        } else {
          // Validate carId from URL with backend
          try {
            console.log("[Workshop Page] Validating car from URL:", carId);
            const carResponse = await fetch(`/api/cars/${carId}`);
            const carResult = await carResponse.json();

            if (carResult.success) {
              console.log("[Workshop Page] Car validated, updating store");
              setSelectedCar(carResult.data);
            } else {
              console.error("[Workshop Page] Invalid car ID from URL:", carResult.error);
              setCarValidationError("The selected car is not available");
              // Clear invalid carId from URL
              router.replace("/quotations/request");
              clearSelectedCar();
              toast.error("Invalid car selection. Please select a car again.");
              return;
            }
          } catch (error) {
            console.error("[Workshop Page] Error validating car:", error);
            setCarValidationError("Failed to validate car");
            router.replace("/quotations/request");
            clearSelectedCar();
            return;
          }
        }
      } else if (selectedCar) {
        // Priority 2: Car exists in store but not in URL, add it to URL for deep-linking
        console.log("[Workshop Page] Adding car to URL from store");
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("carId", selectedCar._id!.toString());
        router.replace(`/quotations/workshops?${newParams.toString()}`, { scroll: false });
      } else {
        // Priority 3: No car in URL or store, redirect to request page
        console.log("[Workshop Page] No car selected, redirecting");
        router.push("/quotations/request");
        return;
      }

      // Fetch workshops (filtered by car brand if available)
      try {
        const currentCar = selectedCar || (carId ? await fetchCarFromAPI(carId) : null);
        if (!currentCar) {
          setLoading(false);
          return;
        }

        const carMake = (currentCar as any).basicInfo?.make || (currentCar as any).make;
        const carBrand = carMake ? carMake.toLowerCase() : "";

        console.log("[Workshop Page] Fetching workshops for brand:", carBrand);
        const workshopsResponse = await fetch(`/api/workshops?carBrand=${carBrand}`);
        const workshopsResult = await workshopsResponse.json();

        if (workshopsResult.success) {
          const workshopResults = workshopsResult.data || [];
          const fetchedWorkshops = workshopResults.map(
            (result: any) => result.workshop || result,
          );
          setWorkshops(fetchedWorkshops);
          console.log("[Workshop Page] Loaded", fetchedWorkshops.length, "workshops");
        } else {
          console.error("[Workshop Page] Failed to fetch workshops:", workshopsResult.error);
        }
      } catch (error) {
        console.error("[Workshop Page] Error fetching workshops:", error);
        toast.error("Failed to load workshops");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [carId, router, searchParams]);

  // Helper to fetch car from API
  async function fetchCarFromAPI(id: string): Promise<CarType | null> {
    try {
      const response = await fetch(`/api/cars/${id}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error("Error fetching car:", error);
      return null;
    }
  }

  // Authentication check - after all hooks
  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (session?.user.role !== "customer") {
    router.push("/");
    return null;
  }

  const handleWorkshopToggle = (workshopId: string) => {
    setSelectedWorkshops((prev) =>
      prev.includes(workshopId)
        ? prev.filter((id) => id !== workshopId)
        : [...prev, workshopId],
    );
  };

  const handleServiceToggle = (service: ServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };

  const handleSelectAll = () => {
    const allWorkshopIds = sortedWorkshops.map(
      (workshop) => workshop.userId?.toString() || workshop._id!.toString(),
    );
    setSelectedWorkshops(allWorkshopIds);
  };

  const handleDeselectAll = () => {
    setSelectedWorkshops([]);
  };

  const handleSubmitQuoteRequest = async () => {
    if (selectedWorkshops.length === 0) {
      toast.error("Please select at least one workshop");
      return;
    }

    if (!selectedCar) {
      toast.error("Car information is missing");
      return;
    }

    try {
      setSubmitting(true);

      // Build workshop names map
      const workshopNames: Record<string, string> = {};
      selectedWorkshops.forEach((workshopId) => {
        const workshop = workshops.find(
          (w) => (w.userId?.toString() || w._id!.toString()) === workshopId
        );
        if (workshop) {
          workshopNames[workshopId] = workshop.profile?.businessName || 'Unknown Workshop';
        }
      });

      // Use bulk quote request helper (unchanged existing flow)
      const result = await sendBulkQuoteRequests(
        selectedWorkshops,
        workshopNames,
        selectedCar,
        {
          damageDescription: serviceRequestId
            ? `Quote request for service request ${serviceRequestId}`
            : "Quote request from workshop selection",
          requestedServices: selectedServices.length > 0 ? selectedServices : ["repair"],
          urgency: "medium",
          sourceServiceRequestId: serviceRequestId || undefined,
        }
      );

      if (result.success > 0) {
        // Clear selections from sessionStorage after successful submission
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('selectedWorkshops');
        }
        setSelectedWorkshops([]);
        router.push("/quotations");
      }
    } catch (error) {
      console.error("Error submitting quote requests:", error);
      toast.error("An error occurred while sending quote requests");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter workshops based on search and filters
  const filteredWorkshops = workshops.filter((workshop) => {
    // Search filter
    if (
      searchQuery &&
      !workshop.profile.businessName
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Service filter
    if (selectedServices.length > 0) {
      const hasMatchingService = selectedServices.some((service) =>
        workshop.profile.specializations.serviceTypes.includes(service as any),
      );
      if (!hasMatchingService) return false;
    }

    return true;
  });

  // Sort workshops - using the same logic as Find Workshop page
  // Filter out workshops without valid IDs to prevent duplicate key issues
  const validWorkshops = filteredWorkshops.filter(
    (workshop) => workshop._id && workshop._id.toString().trim() !== "",
  );

  const sortedWorkshops = [...validWorkshops].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "rating":
        // Sort by rating (highest first)
        compareValue = (a.stats?.averageRating || 0) - (b.stats?.averageRating || 0);
        return -compareValue; // Descending order

      case "reviews":
        // Sort by number of reviews (most first)
        compareValue = (a.stats?.totalReviews || 0) - (b.stats?.totalReviews || 0);
        return -compareValue; // Descending order

      case "distance":
      default:
        // Sort by rating as default since we don't have distance info yet
        // This matches the behavior in Find Workshop page
        compareValue = (a.stats?.averageRating || 0) - (b.stats?.averageRating || 0);
        return -compareValue; // Descending order
    }
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading workshops...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Select Workshops
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Choose workshops to send your quote request to
            </p>
          </div>

          {selectedCar && (
            <Card className="w-full">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  {/* Car Thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {(selectedCar as any).thumbnailUrl || (selectedCar as any).gallery?.[0]?.url ? (
                      <img
                        src={(selectedCar as any).thumbnailUrl || (selectedCar as any).gallery[0].url}
                        alt="Car"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base truncate">
                      {(selectedCar as any).year || (selectedCar as any).basicInfo?.year}{" "}
                      {(selectedCar as any).make || (selectedCar as any).basicInfo?.make}{" "}
                      {(selectedCar as any).model || (selectedCar as any).basicInfo?.model}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">
                      {((selectedCar as any).licensePlate || (selectedCar as any).basicInfo?.licensePlate) && (
                        <>
                          {(selectedCar as any).licensePlate || (selectedCar as any).basicInfo?.licensePlate}
                          {" • "}
                        </>
                      )}
                      {(selectedCar as any).color || (selectedCar as any).basicInfo?.color || "Unknown color"}
                    </div>
                  </div>

                  {/* Change Car Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      clearSelectedCar();
                      router.push("/quotations/request");
                    }}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Change</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
            <Input
              placeholder="Search workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <>
              {/* Sort */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Sort by:</label>
                <Select
                  value={sortBy}
                  onValueChange={(value: any) => setSortBy(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="reviews">Reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Service Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Services Needed:
                </label>
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <label htmlFor={service} className="text-sm">
                        {getServiceTypeLabel(service)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Selected Workshops Summary */}
      {selectedWorkshops.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedWorkshops.length} workshop
                  {selectedWorkshops.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <Button
                onClick={handleSubmitQuoteRequest}
                disabled={submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Requests...
                  </>
                ) : (
                  <>
                    Send Quote Requests
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workshops Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            Available Workshops ({sortedWorkshops.length})
          </h2>

          {sortedWorkshops.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={selectedWorkshops.length === sortedWorkshops.length}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedWorkshops.length === 0}
              >
                Deselect All
              </Button>
            </div>
          )}
        </div>

        {sortedWorkshops.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Workshops Found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters to find more
                workshops.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedWorkshops.map((workshop, index) => {
              // Use userId (the user account ID) instead of _id (the workshop profile ID)
              // This is what the quotation system expects for targeting workshops
              const workshopUserId =
                workshop.userId?.toString() || workshop._id!.toString();
              const workshopProfileId = workshop._id!.toString(); // For display key only
              const isSelected = selectedWorkshops.includes(workshopUserId);

              return (
                <div
                  key={`workshop-${workshopProfileId}-${index}`}
                  className={`relative cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300"
                  }`}
                  onClick={(e) => {
                    // Only toggle selection if not clicking on a button or link
                    const target = e.target as HTMLElement;
                    const isClickingButton = target.closest('button') || target.closest('a');
                    if (!isClickingButton) {
                      handleWorkshopToggle(workshopUserId);
                    }
                  }}
                >
                  <WorkshopCard workshop={workshop} viewMode="list" />

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1.5 pointer-events-none">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkshopSelectionPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <WorkshopSelectionPageContent />
    </Suspense>
  )
}
