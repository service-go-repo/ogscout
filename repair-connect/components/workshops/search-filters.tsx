"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Filter, X, RotateCcw } from "lucide-react";
import {
  WorkshopSearchFilters,
  ServiceType,
  CarBrand,
  getServiceTypeLabel,
  getCarBrandLabel,
} from "@/models/Workshop";

interface SearchFiltersProps {
  filters: WorkshopSearchFilters;
  onFiltersChange: (filters: Partial<WorkshopSearchFilters>, replace?: boolean) => void;
  userLocation?: [number, number] | null;
}

const SERVICE_TYPES: ServiceType[] = [
  "repair",
  "maintenance",
  "inspection",
  "bodywork",
  "paint",
  "engine",
  "transmission",
  "brakes",
  "electrical",
  "tires",
  "glass",
  "detailing",
  "other",
];

const CAR_BRANDS: CarBrand[] = [
  "audi",
  "bmw",
  "mercedes",
  "volkswagen",
  "toyota",
  "honda",
  "nissan",
  "ford",
  "chevrolet",
  "hyundai",
  "kia",
  "mazda",
  "subaru",
  "lexus",
  "acura",
  "infiniti",
  "cadillac",
  "lincoln",
  "buick",
  "gmc",
  "jeep",
  "ram",
  "chrysler",
  "dodge",
  "tesla",
  "volvo",
  "jaguar",
  "land_rover",
  "mini",
  "porsche",
  "other",
];

const COMMON_FEATURES = [
  "Free WiFi",
  "Waiting Area",
  "Shuttle Service",
  "Loaner Cars",
  "Online Booking",
  "Same Day Service",
  "Warranty",
  "Certified Technicians",
  "Eco-Friendly",
  "Mobile Service",
];

export default function SearchFilters({
  filters,
  onFiltersChange,
  userLocation,
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<WorkshopSearchFilters>(filters);

  const handleFilterChange = (key: keyof WorkshopSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange({ [key]: value });
  };

  const handleLocationChange = (field: "radius", value: number) => {
    const newLocation = {
      ...localFilters.location,
      coordinates: localFilters.location?.coordinates || userLocation || [0, 0],
      [field]: value,
    };
    handleFilterChange("location", newLocation);
  };

  const handleServiceTypeToggle = (serviceType: ServiceType) => {
    const currentTypes = localFilters.serviceTypes || [];
    const newTypes = currentTypes.includes(serviceType)
      ? currentTypes.filter((t) => t !== serviceType)
      : [...currentTypes, serviceType];

    handleFilterChange(
      "serviceTypes",
      newTypes.length > 0 ? newTypes : undefined,
    );
  };

  const handleCarBrandToggle = (carBrand: CarBrand) => {
    const currentBrands = localFilters.carBrands || [];
    const newBrands = currentBrands.includes(carBrand)
      ? currentBrands.filter((b) => b !== carBrand)
      : [...currentBrands, carBrand];

    handleFilterChange(
      "carBrands",
      newBrands.length > 0 ? newBrands : undefined,
    );
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = localFilters.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((f) => f !== feature)
      : [...currentFeatures, feature];

    handleFilterChange(
      "features",
      newFeatures.length > 0 ? newFeatures : undefined,
    );
  };

  const clearAllFilters = () => {
    const clearedFilters: WorkshopSearchFilters = {
      sortBy: "rating",
      sortOrder: "desc",
      // Keep location if available
      ...(userLocation && {
        location: {
          coordinates: userLocation,
          radius: 25
        }
      })
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters, true); // Pass true to replace all filters
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.serviceTypes?.length) count++;
    if (localFilters.carBrands?.length) count++;
    if (localFilters.minRating) count++;
    if (localFilters.isVerified !== undefined) count++;
    if (localFilters.isOpen !== undefined) count++;
    if (localFilters.features?.length) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary">{getActiveFilterCount()} active</Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location & Distance */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location & Distance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Search Radius</Label>
              <div className="mt-2">
                <Slider
                  value={[localFilters.location?.radius || 25]}
                  onValueChange={([value]) =>
                    handleLocationChange("radius", value)
                  }
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground/80 mt-1">
                  <span>5km</span>
                  <span>{localFilters.location?.radius || 25}km</span>
                  <span>100km</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating & Status */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Rating & Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Minimum Rating</Label>
              <Select
                value={localFilters.minRating?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "minRating",
                    value ? parseFloat(value) : undefined,
                  )
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any rating</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                  <SelectItem value="4.0">4.0+ stars</SelectItem>
                  <SelectItem value="3.5">3.5+ stars</SelectItem>
                  <SelectItem value="3.0">3.0+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={localFilters.isVerified === true}
                  onCheckedChange={(checked) =>
                    handleFilterChange("isVerified", checked ? true : undefined)
                  }
                />
                <Label htmlFor="verified" className="text-sm">
                  Verified workshops only
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="open"
                  checked={localFilters.isOpen === true}
                  onCheckedChange={(checked) =>
                    handleFilterChange("isOpen", checked ? true : undefined)
                  }
                />
                <Label htmlFor="open" className="text-sm">
                  Open now
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sort Options */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sort By</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select
                value={localFilters.sortBy || "rating"}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="reviews">Number of Reviews</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Order</Label>
              <Select
                value={localFilters.sortOrder || "desc"}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value as "asc" | "desc")
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Service Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SERVICE_TYPES.map((serviceType) => (
              <Badge
                key={serviceType}
                variant={
                  localFilters.serviceTypes?.includes(serviceType)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer hover:bg-muted/50 hyphens-auto"
                style={{ wordBreak: "break-word" }}
                onClick={() => handleServiceTypeToggle(serviceType)}
              >
                {getServiceTypeLabel(serviceType)}
                {localFilters.serviceTypes?.includes(serviceType) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Car Brands */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Car Brands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CAR_BRANDS.map((carBrand) => (
              <Badge
                key={carBrand}
                variant={
                  localFilters.carBrands?.includes(carBrand)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer hover:bg-muted/50 hyphens-auto"
                style={{ wordBreak: "break-word" }}
                onClick={() => handleCarBrandToggle(carBrand)}
              >
                {getCarBrandLabel(carBrand)}
                {localFilters.carBrands?.includes(carBrand) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_FEATURES.map((feature) => (
              <Badge
                key={feature}
                variant={
                  localFilters.features?.includes(feature)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer hover:bg-muted/50 hyphens-auto"
                style={{ wordBreak: "break-word" }}
                onClick={() => handleFeatureToggle(feature)}
              >
                {feature}
                {localFilters.features?.includes(feature) && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
