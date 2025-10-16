"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Car,
  Calendar,
  Gauge,
  Palette,
  Hash,
  CreditCard,
  Settings,
  Fuel,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import {
  VehicleInfo,
  DamageDescription,
  Timeline,
  BudgetRange,
  getServiceTypeLabel,
} from "@/models/Quotation";
import { format } from "date-fns";

interface CarDetailsProps {
  vehicle: VehicleInfo;
  damageDescription: DamageDescription[];
  requestedServices: string[];
  carImages?: string[]; // Car media images
  timeline?: Timeline;
  budget?: BudgetRange;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  location?: {
    address: string;
    city: string;
    state: string;
  };
  createdAt?: Date;
  priority?: string;
  viewMode?: "workshop" | "customer";
  competitionStatus?: string; // Competition status for privacy control
  isWinner?: boolean; // Whether this workshop won the competition
  onViewImages?: (images: string[]) => void;
}

export default function CarDetails({
  vehicle,
  damageDescription,
  requestedServices,
  carImages,
  timeline,
  budget,
  customerInfo,
  location,
  createdAt,
  priority,
  viewMode = "customer",
  competitionStatus,
  isWinner,
  onViewImages,
}: CarDetailsProps) {
  const allImages = damageDescription.flatMap((damage) => damage.images || []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
      case "moderate":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
      case "major":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "critical":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-primary/10 text-primary";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "urgent":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Customer Info (Workshop View Only) */}
      {viewMode === "workshop" && customerInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{customerInfo.name}</p>
                </div>
              </div>

              {/* Email - Show only to winner or after competition ends */}
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  {competitionStatus === "accepted" ||
                  competitionStatus === "completed" ||
                  competitionStatus === "cancelled" ||
                  isWinner ? (
                    <p className="font-medium">{customerInfo.email}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/60">
                        🔒 Contact info shown to winner
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone - Show only to winner or after competition ends */}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  {competitionStatus === "accepted" ||
                  competitionStatus === "completed" ||
                  competitionStatus === "cancelled" ||
                  isWinner ? (
                    <p className="font-medium">{customerInfo.phone}</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/60">
                        🔒 Contact info shown to winner
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
              {createdAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Requested {format(new Date(createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {priority && (
                <Badge className={getPriorityColor(priority)}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}{" "}
                  Priority
                </Badge>
              )}
              {location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground/60" />
                  <span>
                    {location.city}, {location.state}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Make & Model</p>
                  <p className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground/60" />
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
              </div>
            </div>

            {vehicle.color && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium capitalize">{vehicle.color}</p>
                  </div>
                </div>
              </div>
            )}

            {vehicle.licensePlate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      License Plate
                    </p>
                    <p className="font-medium font-mono">
                      {vehicle.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {vehicle.mileage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-medium">
                      {vehicle.mileage.toLocaleString()} km
                    </p>
                  </div>
                </div>
              </div>
            )}

            {vehicle.transmission && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transmission
                    </p>
                    <p className="font-medium capitalize">
                      {vehicle.transmission}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {vehicle.engineType && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">Engine</p>
                    <p className="font-medium">{vehicle.engineType}</p>
                  </div>
                </div>
              </div>
            )}

            {vehicle.vin && (
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground/60" />
                  <div>
                    <p className="text-sm text-muted-foreground">VIN Number</p>
                    <p className="font-medium font-mono text-sm">
                      {vehicle.vin}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Car Images */}
      {carImages && carImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Car Photos ({carImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-w-4xl">
                {carImages.slice(0, 8).map((imageUrl, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted/50 cursor-pointer hover:opacity-80 transition-opacity max-w-[200px]"
                    onClick={() => onViewImages && onViewImages(carImages)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${vehicle.make} ${vehicle.model} photo ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {imgIndex === 7 && carImages.length > 8 && (
                      <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          +{carImages.length - 8} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {onViewImages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewImages(carImages)}
                  className="w-full flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  View All Images ({carImages.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requested Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Requested Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requestedServices && requestedServices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {requestedServices.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {getServiceTypeLabel(service as any)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground/80 italic">
              No specific services requested
            </p>
          )}
        </CardContent>
      </Card>

      {/* Issues & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Damage Description */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Issues & Damage Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {damageDescription && damageDescription.length > 0 ? (
              damageDescription.map((damage, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{damage.area}</h4>
                    <Badge className={getSeverityColor(damage.severity)}>
                      {damage.severity.charAt(0).toUpperCase() +
                        damage.severity.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-foreground/90">{damage.description}</p>

                  {damage.estimatedCost && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        Estimated cost: AED{" "}
                        {damage.estimatedCost.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {damage.images && damage.images.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground/60" />
                        <span className="text-sm text-muted-foreground">
                          {damage.images.length} image
                          {damage.images.length > 1 ? "s" : ""} attached
                        </span>
                      </div>

                      {/* Image Thumbnails */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {damage.images.slice(0, 6).map((imageUrl, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative aspect-square rounded-lg overflow-hidden bg-muted/50 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              onViewImages && onViewImages(damage.images!)
                            }
                          >
                            <img
                              src={imageUrl}
                              alt={`${damage.area} damage ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {imgIndex === 5 &&
                              damage.images &&
                              damage.images.length > 6 && (
                                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    +{damage.images.length - 6} more
                                  </span>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>

                      {onViewImages && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewImages(damage.images!)}
                          className="w-full flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4" />
                          View All Images ({damage.images?.length || 0})
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground/80 italic">
                No damage description provided
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        {timeline && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.preferredStartDate && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Start Date
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(timeline.preferredStartDate),
                      "MMM dd, yyyy",
                    )}
                  </p>
                </div>
              )}

              {timeline.preferredCompletionDate && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Preferred Completion
                  </p>
                  <p className="font-medium">
                    {format(
                      new Date(timeline.preferredCompletionDate),
                      "MMM dd, yyyy",
                    )}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Urgency</p>
                <Badge className={getPriorityColor(timeline.urgency)}>
                  {timeline.urgency.charAt(0).toUpperCase() +
                    timeline.urgency.slice(1)}
                </Badge>
              </div>

              {timeline.flexibility && (
                <div>
                  <p className="text-sm text-muted-foreground">Flexibility</p>
                  <p className="font-medium capitalize">
                    {timeline.flexibility}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budget && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(budget.min || budget.max) && (
                <div>
                  <p className="text-sm text-muted-foreground">Budget Range</p>
                  <p className="font-medium">
                    {budget.min && `AED ${budget.min.toLocaleString()}`}
                    {budget.min && budget.max && " - "}
                    {budget.max && `AED ${budget.max.toLocaleString()}`}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Flexibility</p>
                <Badge variant={budget.isFlexible ? "secondary" : "outline"}>
                  {budget.isFlexible ? "Flexible" : "Fixed"}
                </Badge>
              </div>

              {budget.currency && (
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="font-medium">{budget.currency}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Images Summary */}
      {allImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Attached Images ({allImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {allImages.length} image{allImages.length > 1 ? "s" : ""}{" "}
                showing damage and vehicle condition
              </p>
              {onViewImages && (
                <Button
                  variant="outline"
                  onClick={() => onViewImages(allImages)}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  View All Images
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
