"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, ArrowRight, Loader2 } from "lucide-react";
import { Car as CarType } from "@/models/Car";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CarSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userCars: CarType[];
  onCarSelect: (car: CarType) => void;
  isLoading?: boolean;
}

export default function CarSelectionModal({
  open,
  onOpenChange,
  userCars = [],
  onCarSelect,
  isLoading = false,
}: CarSelectionModalProps) {
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);

  // Ensure userCars is always an array
  const safeUserCars = Array.isArray(userCars) ? userCars : [];

  // Debug: Log the car data structure
  if (safeUserCars.length > 0 && open) {
    console.log('Car data structure:', safeUserCars[0]);
  }

  const handleCarSelection = (car: CarType) => {
    setSelectedCar(car);
  };

  const handleContinue = () => {
    if (selectedCar) {
      onCarSelect(selectedCar);
      onOpenChange(false);
    }
  };

  const findCarInList = (carId: string) => {
    return safeUserCars.find((c) => c._id?.toString() === carId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Select a Car for Quote Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 overflow-y-auto flex-1">
          {safeUserCars.length === 0 ? (
            // No cars registered
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Cars Registered
              </h3>
              <p className="text-muted-foreground mb-6">
                You need to register a car before requesting quotes from
                workshops.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/cars/register">
                    <Plus className="h-4 w-4 mr-2" />
                    Register a Car
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Car Selection Grid */}
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Choose which car you'd like to request quotes for:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {safeUserCars.map((car) => (
                    <Card
                      key={car._id?.toString() || "car-" + Math.random()}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedCar?._id === car._id
                          ? "ring-2 ring-primary border-primary"
                          : "border-border hover:border-border/80",
                      )}
                      onClick={() => handleCarSelection(car)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Car Image */}
                          {((car as any).thumbnailUrl || (car as any).gallery?.length > 0) ? (
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img
                                src={(car as any).thumbnailUrl || (car as any).gallery[0]?.url}
                                alt={`${(car as any).make} ${(car as any).model}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                              <Car className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}

                          {/* Car Details */}
                          <div className="space-y-2">
                            {/* Display nickname if available */}
                            {(car as any).nickname && (
                              <div className="text-sm text-primary font-medium">
                                {(car as any).nickname}
                              </div>
                            )}

                            <div className="font-semibold text-foreground">
                              {(car as any).year || 'N/A'}{" "}
                              {(car as any).make || 'N/A'}{" "}
                              {(car as any).model || 'N/A'}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              {(car as any).color && (
                                <>
                                  <span>{(car as any).color}</span>
                                  <span>•</span>
                                </>
                              )}
                              {(car as any).totalServiceRequests !== undefined && (
                                <span>{(car as any).totalServiceRequests} service{(car as any).totalServiceRequests !== 1 ? 's' : ''}</span>
                              )}
                            </div>

                            {/* Status */}
                            <Badge
                              variant={
                                car.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {car.status === "active" ? "Active" : "Archived"}
                            </Badge>
                          </div>

                          {/* Selection Indicator */}
                          {selectedCar?._id?.toString() ===
                            car._id?.toString() && (
                            <div className="flex items-center justify-center py-2">
                              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                Selected
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add New Car Option */}
                  <Card className="border-dashed border-2 border-border hover:border-primary/50 cursor-pointer transition-colors">
                    <CardContent className="p-4">
                      <Link href="/cars/register" className="block h-full">
                        <div className="aspect-video rounded-lg bg-muted/50 flex flex-col items-center justify-center">
                          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium text-muted-foreground">
                            Add New Car
                          </span>
                        </div>
                        <div className="mt-3 text-center">
                          <div className="font-semibold text-foreground">
                            Register Another Car
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Add a new vehicle to your garage
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </>
          )}
        </div>

        {/* Fixed Action Buttons at Bottom */}
        {safeUserCars.length > 0 && (
          <div className="sticky bottom-0 bg-background border-t px-6 py-4 space-y-3">
            <Button
              onClick={handleContinue}
              disabled={!selectedCar || isLoading}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
              aria-label="Continue to workshop selection with selected car"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Continue to Workshops
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
