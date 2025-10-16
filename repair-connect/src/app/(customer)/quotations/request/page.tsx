"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Car as CarIcon,
  Zap,
  Users,
  CheckCircle,
  Loader2,
  Wrench,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { EnhancedCarServiceModal } from "@/components/quotations/enhanced-car-service-modal";
import { useQuoteRequestStore } from "@/stores/quoteRequestStore";
import { Car } from "@/models/Car";
import { toast } from "sonner";

export default function QuoteRequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userCars, setUserCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // Use Zustand store for modal state
  const openCarSelection = useQuoteRequestStore((state) => state.openCarSelection);

  // Clear any pre-selected workshops when page loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingWorkshopSelections');
      sessionStorage.removeItem('selectedWorkshopsDiscovery');
    }
  }, []);

  // Fetch user's cars - must be called before any early returns
  useEffect(() => {
    const fetchUserCars = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/cars");
          const result = await response.json();

          if (result.success) {
            // API returns { data: { cars: [...] } }
            const cars = Array.isArray(result.data?.cars)
              ? result.data.cars
              : [];
            setUserCars(cars);
          } else {
            console.error("Failed to fetch cars:", result.error);
            setUserCars([]);
          }
        } catch (error) {
          console.error("Error fetching cars:", error);
          setUserCars([]);
        } finally {
          setLoadingCars(false);
        }
      }
    };

    fetchUserCars();
  }, [session]);

  // Early returns after all hooks
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

  const handleStartQuoteRequest = () => {
    // Clear any previous workshop selections when starting a new quote request
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pendingWorkshopSelections');
      sessionStorage.removeItem('selectedWorkshopsDiscovery');
    }
    // Open the enhanced car & service selection modal
    openCarSelection();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Request Repair Quotes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get competitive quotes from verified workshops in your area. Select
            your car and choose from trusted repair specialists.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-center overflow-x-auto px-2">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-max">
            {/* Step 1 - Select Car */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-lg">
                <CarIcon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="mt-2 text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
                Select Car
              </span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 flex-shrink-0 self-center"></div>
            {/* Step 2 - Select Service */}
            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Select Service
              </span>
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full shadow-lg">
                <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-purple-300 to-orange-300 flex-shrink-0 self-center"></div>
            {/* Step 3 - Choose Workshops */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-lg">
                <Wrench className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="mt-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Choose Workshops
              </span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-orange-300 to-green-300 flex-shrink-0 self-center"></div>
            {/* Step 4 - Receive Quotes */}
            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Receive Quotes
              </span>
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-lg">
                <FileCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <Card className="mb-8 bg-muted border-border">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="text-center">
              <CarIcon className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                Ready to Get Quotes?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our streamlined process connects you with the best workshops for
                your vehicle. Start by selecting which car needs service.
              </p>
              <Button
                size="lg"
                onClick={handleStartQuoteRequest}
                disabled={loadingCars}
                className="px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg w-full sm:w-auto"
              >
                {loadingCars ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Loading Cars...
                  </>
                ) : (
                  <>
                    <CarIcon className="h-5 w-5 mr-2" />
                    Start Quote Request
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500 dark:text-amber-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Fast & Easy</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Select your car, choose workshops, and receive quotes within
                24-48 hours.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Verified Workshops</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                All workshops are verified and rated by real customers for your
                peace of mind.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Multiple Quotes</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Compare prices and services from multiple workshops to get the
                best deal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Car Count Display */}
        {!loadingCars && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                  {userCars.length}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">
                  {userCars.length === 1 ? "Car" : "Cars"} in your garage
                </div>
                {userCars.length === 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground/80 mt-2">
                    You'll need to register a car before requesting quotes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Car & Service Selection Modal */}
      <EnhancedCarServiceModal />
    </div>
  );
}
