"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileUpload, FileWithPreview } from "@/components/common/FileUpload";
import {
  Wrench,
  MapPin,
  AlertCircle,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Camera,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ServiceRequestData,
  ServiceType,
  DamageAssessment,
  ServiceLocation,
  DamageType,
  DamageSeverity,
  DamageLocation,
  DAMAGE_TYPE_LABELS,
  DAMAGE_SEVERITY_LABELS,
  DAMAGE_LOCATION_LABELS,
  SERVICE_LOCATION_TYPE_LABELS,
  generateDamageId,
} from "@/models/ServiceRequest";
import { CarProfile, getCarDisplayName } from "@/models/CarProfile";

// Service types categorized by issue type
const SERVICE_CATEGORIES = [
  {
    title: "Mechanical Issues",
    icon: "🔧",
    services: [
      { value: "engine", label: "Engine Service" },
      { value: "transmission", label: "Transmission" },
      { value: "brakes", label: "Brakes" },
      { value: "suspension", label: "Suspension" },
      { value: "clutch", label: "Clutch" },
    ],
  },
  {
    title: "Electrical Issues",
    icon: "⚡",
    services: [
      { value: "electrical", label: "Electrical System" },
      { value: "battery", label: "Battery" },
      { value: "alternator", label: "Alternator" },
      { value: "lights", label: "Lights & Bulbs" },
      { value: "electronics", label: "Electronics" },
    ],
  },
  {
    title: "Body & Exterior",
    icon: "🚗",
    services: [
      { value: "bodywork", label: "Body Work" },
      { value: "paint", label: "Paint Work" },
      { value: "glass", label: "Glass Repair" },
      { value: "bumper", label: "Bumper Repair" },
      { value: "dents", label: "Dent Repair" },
    ],
  },
  {
    title: "Maintenance & Service",
    icon: "🛠️",
    services: [
      { value: "maintenance", label: "Regular Maintenance" },
      { value: "oil_change", label: "Oil Change" },
      { value: "inspection", label: "Inspection" },
      { value: "tune_up", label: "Tune-up" },
      { value: "filters", label: "Filter Replacement" },
    ],
  },
  {
    title: "Tires & Wheels",
    icon: "🛞",
    services: [
      { value: "tires", label: "Tire Service" },
      { value: "wheel_alignment", label: "Wheel Alignment" },
      { value: "tire_rotation", label: "Tire Rotation" },
      { value: "wheel_balancing", label: "Wheel Balancing" },
    ],
  },
  {
    title: "Other Services",
    icon: "🔍",
    services: [
      { value: "detailing", label: "Car Detailing" },
      { value: "diagnostic", label: "Diagnostic" },
      { value: "repair", label: "General Repair" },
      { value: "other", label: "Other" },
    ],
  },
] as const;

// Form validation schema
const serviceRequestSchema = z.object({
  carId: z.string().min(1, "Car selection is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  requestedServices: z
    .array(z.string())
    .min(1, "At least one service must be selected"),

  // Service location
  serviceLocationType: z.enum([
    "customer_location",
    "workshop_location",
    "pickup_delivery",
  ]),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  locationInstructions: z.string().optional(),

  // Contact and preferences
  priority: z.enum(["low", "medium", "high", "urgent"]),
  preferredContactMethod: z.enum(["phone", "email", "sms"]),
  additionalNotes: z
    .string()
    .max(500, "Additional notes must be 500 characters or less")
    .optional(),

  // Workshop targeting
  maxDistance: z
    .number()
    .min(1, "Distance must be at least 1 km")
    .max(200, "Distance must be 200 km or less")
    .optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  car: CarProfile;
  onSubmit: (
    data: ServiceRequestFormData & {
      damageAssessments: DamageAssessment[];
      photos: File[];
      videos: File[];
    },
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ServiceRequestForm({
  car,
  onSubmit,
  isLoading = false,
}: ServiceRequestFormProps) {
  const [damageAssessments, setDamageAssessments] = useState<
    Partial<DamageAssessment>[]
  >([]);
  const [servicePhotos, setServicePhotos] = useState<FileWithPreview[]>([]);
  const [serviceVideos, setServiceVideos] = useState<FileWithPreview[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      carId: car._id?.toString() || "",
      serviceLocationType: "workshop_location",
      priority: "medium",
      preferredContactMethod: "email",
      requestedServices: [],
    },
    mode: "onChange",
  });

  const watchedServices = watch("requestedServices");
  const watchedServiceLocation = watch("serviceLocationType");

  // Add damage assessment
  const addDamageAssessment = () => {
    const newDamage: Partial<DamageAssessment> = {
      id: generateDamageId(),
      damageType: "scratch",
      severity: "minor",
      location: "front_bumper",
      description: "",
      isVisible: true,
      photos: [],
    };
    setDamageAssessments([...damageAssessments, newDamage]);
  };

  // Remove damage assessment
  const removeDamageAssessment = (index: number) => {
    setDamageAssessments(damageAssessments.filter((_, i) => i !== index));
  };

  // Update damage assessment
  const updateDamageAssessment = (
    index: number,
    field: keyof DamageAssessment,
    value: any,
  ) => {
    const updated = [...damageAssessments];
    updated[index] = { ...updated[index], [field]: value };
    setDamageAssessments(updated);
  };

  // Handle service selection
  const handleServiceToggle = (serviceType: string) => {
    const current = watchedServices || [];
    const updated = current.includes(serviceType)
      ? current.filter((s) => s !== serviceType)
      : [...current, serviceType];
    setValue("requestedServices", updated);
  };

  // Toggle category expansion
  const toggleCategory = (categoryTitle: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryTitle)) {
      newExpanded.delete(categoryTitle);
    } else {
      newExpanded.add(categoryTitle);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle form submission
  const handleFormSubmit = async (data: ServiceRequestFormData) => {
    // Convert damage assessments to complete format
    const completeDamageAssessments: DamageAssessment[] = damageAssessments.map(
      (damage) => ({
        id: damage.id || generateDamageId(),
        damageType: damage.damageType || "other",
        severity: damage.severity || "minor",
        location: damage.location || "other",
        description: damage.description || "",
        estimatedCost: damage.estimatedCost || 0,
        photos: damage.photos || [],
        isVisible: damage.isVisible !== false,
        reportedAt: new Date(),
      }),
    );

    await onSubmit({
      ...data,
      damageAssessments: completeDamageAssessments,
      photos: servicePhotos, // FileWithPreview extends File, so no .file needed
      videos: serviceVideos, // FileWithPreview extends File, so no .file needed
    });
  };

  const handlePhotosChange = (files: FileWithPreview[]) => {
    setServicePhotos(files);
  };

  const handleVideosChange = (files: FileWithPreview[]) => {
    setServiceVideos(files);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Request Service
        </h1>
        <p className="text-muted-foreground">
          Create a service request for your {getCarDisplayName(car)}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Car Information Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              {car.thumbnailUrl ? (
                <img
                  src={car.thumbnailUrl}
                  alt={getCarDisplayName(car)}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-muted-foreground/60" />
                </div>
              )}
              <div>
                <div className="font-semibold text-lg">
                  {getCarDisplayName(car)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {car.color} • {car.fuelType} • {car.transmission}
                </div>
                {car.mileage && (
                  <div className="text-sm text-gray-500">
                    {car.mileage.toLocaleString()} km
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Oil change and brake inspection"
                maxLength={100}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Describe what services you need and any specific issues or concerns..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Be as specific as possible to help workshops provide accurate
                quotes
              </p>
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label>Requested Services *</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select the services you need. Click on a category to expand and
                see available services.
              </p>

              <div className="space-y-3">
                {SERVICE_CATEGORIES.map((category) => {
                  const isExpanded = expandedCategories.has(category.title);
                  const hasSelectedServices = category.services.some(
                    (service) => watchedServices?.includes(service.value),
                  );

                  return (
                    <div
                      key={category.title}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.title)}
                        className={`w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors ${
                          hasSelectedServices
                            ? "bg-primary/10 border-primary/20"
                            : "bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{category.icon}</span>
                          <h4 className="font-medium text-foreground">
                            {category.title}
                          </h4>
                          {hasSelectedServices && (
                            <Badge variant="secondary" className="text-xs">
                              {
                                category.services.filter((service) =>
                                  watchedServices?.includes(service.value),
                                ).length
                              }{" "}
                              selected
                            </Badge>
                          )}
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 border-t bg-muted/50">
                          <div className="grid grid-cols-2 gap-3">
                            {category.services.map((service) => (
                              <div
                                key={service.value}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={service.value}
                                  checked={
                                    watchedServices?.includes(service.value) ||
                                    false
                                  }
                                  onCheckedChange={() =>
                                    handleServiceToggle(service.value)
                                  }
                                />
                                <Label
                                  htmlFor={service.value}
                                  className="text-sm font-normal leading-tight"
                                >
                                  {service.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {errors.requestedServices && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.requestedServices.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Priority Level *</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) => setValue("priority", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - No rush</SelectItem>
                    <SelectItem value="medium">
                      Medium - Normal timeline
                    </SelectItem>
                    <SelectItem value="high">High - ASAP</SelectItem>
                    <SelectItem value="urgent">Urgent - Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferred Contact Method *</Label>
                <Select
                  value={watch("preferredContactMethod")}
                  onValueChange={(value) =>
                    setValue("preferredContactMethod", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalNotes">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="additionalNotes"
                {...register("additionalNotes")}
                placeholder="Any additional information, special requirements, or questions for workshops..."
                rows={3}
                maxLength={500}
              />
            </div>
          </CardContent>
        </Card>

        {/* Damage Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Damage Assessment (Optional)
              </div>
              <Button
                type="button"
                onClick={addDamageAssessment}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Damage
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {damageAssessments.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                <p className="text-muted-foreground">No damage reported</p>
                <p className="text-sm text-gray-500">
                  Add damage assessments if your car has visible damage
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {damageAssessments.map((damage, index) => (
                  <div key={damage.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Damage #{index + 1}</h4>
                      <Button
                        type="button"
                        onClick={() => removeDamageAssessment(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Damage Type</Label>
                        <Select
                          value={damage.damageType || "scratch"}
                          onValueChange={(value) =>
                            updateDamageAssessment(
                              index,
                              "damageType",
                              value as DamageType,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DAMAGE_TYPE_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Severity</Label>
                        <Select
                          value={damage.severity || "minor"}
                          onValueChange={(value) =>
                            updateDamageAssessment(
                              index,
                              "severity",
                              value as DamageSeverity,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DAMAGE_SEVERITY_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Location</Label>
                        <Select
                          value={damage.location || "front_bumper"}
                          onValueChange={(value) =>
                            updateDamageAssessment(
                              index,
                              "location",
                              value as DamageLocation,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(DAMAGE_LOCATION_LABELS).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Description</Label>
                      <Textarea
                        value={damage.description || ""}
                        onChange={(e) =>
                          updateDamageAssessment(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Describe the damage in detail..."
                        rows={2}
                      />
                    </div>

                    <div className="mt-4">
                      <Label>Estimated Cost (Optional)</Label>
                      <Input
                        type="number"
                        value={damage.estimatedCost || ""}
                        onChange={(e) =>
                          updateDamageAssessment(
                            index,
                            "estimatedCost",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="0"
                        min={0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Service Location Type *</Label>
              <Select
                value={watchedServiceLocation}
                onValueChange={(value) =>
                  setValue("serviceLocationType", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_LOCATION_TYPE_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {watchedServiceLocation === "customer_location" && (
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="Street address"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...register("city")} placeholder="City" />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input id="state" {...register("state")} placeholder="State" />
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="locationInstructions">
                Special Instructions (Optional)
              </Label>
              <Textarea
                id="locationInstructions"
                {...register("locationInstructions")}
                placeholder="Any special instructions for finding or accessing the location..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos and Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photos & Videos (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Service Photos</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add photos showing the areas that need service or any damage
              </p>
              <FileUpload
                maxFiles={10}
                acceptedFileTypes="photo"
                maxFileSize={5}
                onFilesChange={handlePhotosChange}
              />
            </div>

            <div>
              <Label>Service Videos</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add videos to better show the issue or demonstrate problems
              </p>
              <FileUpload
                maxFiles={3}
                acceptedFileTypes="video"
                maxFileSize={50}
                onFilesChange={handleVideosChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <Save className="h-5 w-5 text-primary" />
                  Ready to submit your service request?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your request will be sent to qualified workshops in your area
                </p>
                {!isValid && (
                  <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Please fill in all required fields
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                size="lg"
                className="min-w-[200px] w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-5 w-5" />
                    <span>Submit Request</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default ServiceRequestForm;
