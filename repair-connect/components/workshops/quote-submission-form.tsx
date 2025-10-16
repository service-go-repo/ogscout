"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Calculator,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { ServiceItem, PartItem, WorkshopQuote } from "@/models/Quotation";
import { Workshop } from "@/models/Workshop";

// Form validation schema
const quoteFormSchema = z.object({
  services: z
    .array(
      z.object({
        serviceType: z.string().min(1, "Service type is required"),
        description: z
          .string()
          .min(5, "Description must be at least 5 characters"),
        laborHours: z.number().min(0.1, "Labor hours must be greater than 0"),
        laborRate: z.number().min(1, "Labor rate must be greater than 0"),
        parts: z
          .array(
            z.object({
              name: z.string().min(1, "Part name is required"),
              partNumber: z.string().optional(),
              quantity: z.number().min(1, "Quantity must be at least 1"),
              unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
              warranty: z.string().optional(),
              isOEM: z.boolean().optional(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, "At least one service is required"),
  estimatedStartDate: z.string().optional(),
  estimatedDuration: z.number().min(0.5, "Duration must be at least 0.5 days"),
  validUntil: z.string().min(1, "Quote expiry date is required"),
  warranty: z.string().min(1, "Warranty information is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),
  tax: z.number().min(0, "Tax must be 0 or greater"),
  discount: z.number().min(0, "Discount must be 0 or greater").optional(),
  notes: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  quotationId: string;
  existingQuote?: WorkshopQuote | null;
  workshop: Workshop;
  onSubmitSuccess: () => void;
}

export default function QuoteSubmissionForm({
  isOpen,
  onClose,
  quotationId,
  existingQuote,
  workshop,
  onSubmitSuccess,
}: QuoteSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      services: [
        {
          serviceType: "",
          description: "",
          laborHours: 0,
          laborRate: 0,
          parts: [],
        },
      ],
      estimatedDuration: 1,
      validUntil: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      warranty: "90 days parts and labor",
      paymentTerms: "50% upfront, 50% on completion",
      tax: 0,
      discount: 0,
      notes: "",
    },
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "services",
  });

  const watchedServices = watch("services");
  const watchedTax = watch("tax");
  const watchedDiscount = watch("discount");

  // Calculate totals
  const calculateTotals = () => {
    let totalLaborCost = 0;
    let totalPartsCost = 0;

    watchedServices.forEach((service) => {
      const laborCost = (service.laborHours || 0) * (service.laborRate || 0);
      totalLaborCost += laborCost;

      if (service.parts) {
        service.parts.forEach((part) => {
          totalPartsCost += (part.quantity || 0) * (part.unitPrice || 0);
        });
      }
    });

    const subtotal = totalLaborCost + totalPartsCost;
    const afterDiscount = subtotal - (watchedDiscount || 0);
    const totalAmount = afterDiscount + (watchedTax || 0);

    return {
      totalLaborCost,
      totalPartsCost,
      subtotal,
      totalAmount: Math.max(0, totalAmount),
    };
  };

  const totals = calculateTotals();

  // Load existing quote data
  useEffect(() => {
    if (existingQuote) {
      reset({
        services: existingQuote.services.map((service) => ({
          serviceType: service.serviceType,
          description: service.description,
          laborHours: service.laborHours,
          laborRate: service.laborRate,
          parts: service.parts || [],
        })),
        estimatedStartDate: existingQuote.estimatedStartDate
          ? format(new Date(existingQuote.estimatedStartDate), "yyyy-MM-dd")
          : undefined,
        estimatedDuration: existingQuote.estimatedDuration,
        validUntil: format(new Date(existingQuote.validUntil), "yyyy-MM-dd"),
        warranty: existingQuote.warranty,
        paymentTerms: existingQuote.paymentTerms,
        tax: existingQuote.tax,
        discount: existingQuote.discount || 0,
        notes: existingQuote.notes || "",
      });
    }
  }, [existingQuote, reset]);

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);

    try {
      // Transform form data to quote structure
      const transformedServices: ServiceItem[] = data.services.map(
        (service, index) => {
          const laborCost = service.laborHours * service.laborRate;
          const partsCost =
            service.parts?.reduce(
              (sum, part) => sum + part.quantity * part.unitPrice,
              0,
            ) || 0;
          const subtotal = laborCost + partsCost;

          return {
            id: `service_${index}_${Date.now()}`,
            serviceType: service.serviceType as any,
            description: service.description,
            laborHours: service.laborHours,
            laborRate: service.laborRate,
            laborCost,
            parts:
              service.parts?.map((part, partIndex) => ({
                id: `part_${index}_${partIndex}_${Date.now()}`,
                name: part.name,
                partNumber: part.partNumber,
                quantity: part.quantity,
                unitPrice: part.unitPrice,
                totalPrice: part.quantity * part.unitPrice,
                warranty: part.warranty,
                isOEM: part.isOEM,
              })) || [],
            subtotal,
            notes: "",
          };
        },
      );

      const quoteData: Partial<WorkshopQuote> = {
        id: existingQuote?.id || `quote_${Date.now()}`,
        services: transformedServices,
        totalLaborCost: totals.totalLaborCost,
        totalPartsCost: totals.totalPartsCost,
        subtotal: totals.subtotal,
        tax: data.tax,
        discount: data.discount,
        totalAmount: totals.totalAmount,
        currency: "AED",
        estimatedStartDate: data.estimatedStartDate
          ? new Date(data.estimatedStartDate)
          : undefined,
        estimatedDuration: data.estimatedDuration,
        validUntil: new Date(data.validUntil),
        warranty: data.warranty,
        paymentTerms: data.paymentTerms,
        notes: data.notes,
        attachments: [],
      };

      // Submit quote via API
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote: quoteData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          existingQuote
            ? "Quote updated successfully!"
            : "Quote submitted successfully!",
        );
        onSubmitSuccess();
        onClose();
      } else {
        console.error("Quote submission failed:", result);
        toast.error(result.error || "Failed to submit quote");
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error("An error occurred while submitting the quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewService = () => {
    appendService({
      serviceType: "",
      description: "",
      laborHours: 0,
      laborRate: 0,
      parts: [],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingQuote ? "Update Quote" : "Submit Quote"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pr-2">
          {/* Workshop Branding Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={workshop.profile.logo}
                    alt={workshop.profile.businessName}
                  />
                  <AvatarFallback>
                    <Building2 className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {workshop.profile.businessName}
                  </h3>
                  <p className="text-muted-foreground">
                    {workshop.profile.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {workshop.contact.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {workshop.contact.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {workshop.contact.address.emirate || workshop.contact.address.city},{" "}
                      {workshop.contact.address.zipCode}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    AED {totals.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Quote
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Services & Labor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceFields.map((field, index) => (
                <ServiceFieldGroup
                  key={field.id}
                  index={index}
                  register={register}
                  control={control}
                  errors={errors}
                  onRemove={() => removeService(index)}
                  canRemove={serviceFields.length > 1}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addNewService}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Service
              </Button>
            </CardContent>
          </Card>

          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline & Validity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline & Validity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full">
                  <Label htmlFor="estimatedStartDate">
                    Estimated Start Date (Optional)
                  </Label>
                  <Input
                    type="date"
                    {...register("estimatedStartDate")}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full"
                  />
                </div>

                <div className="w-full">
                  <Label htmlFor="estimatedDuration">Duration (Days) *</Label>
                  <Input
                    type="number"
                    step="0.5"
                    {...register("estimatedDuration", { valueAsNumber: true })}
                    className="w-full"
                  />
                  {errors.estimatedDuration && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.estimatedDuration.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="validUntil">Quote Valid Until *</Label>
                  <Input
                    type="date"
                    {...register("validUntil")}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full"
                  />
                  {errors.validUntil && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.validUntil.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full">
                  <Label htmlFor="warranty">Warranty *</Label>
                  <Input
                    {...register("warranty")}
                    placeholder="e.g., 90 days parts and labor"
                    className="w-full"
                  />
                  {errors.warranty && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.warranty.message}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label htmlFor="paymentTerms">Payment Terms *</Label>
                  <Input
                    {...register("paymentTerms")}
                    placeholder="e.g., 50% upfront, 50% on completion"
                    className="w-full"
                  />
                  {errors.paymentTerms && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.paymentTerms.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="w-full">
                    <Label htmlFor="tax">Tax Amount (AED)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("tax", { valueAsNumber: true })}
                      className="w-full"
                    />
                  </div>

                  <div className="w-full">
                    <Label htmlFor="discount">Discount (AED)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("discount", { valueAsNumber: true })}
                      className="w-full"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Labor:</span>
                    <span>AED {totals.totalLaborCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Parts:</span>
                    <span>AED {totals.totalPartsCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>AED {totals.subtotal.toLocaleString()}</span>
                  </div>
                  {(watchedDiscount ?? 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-AED {(watchedDiscount ?? 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>AED {(watchedTax ?? 0).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      AED {totals.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                placeholder="Any additional information or special conditions..."
                rows={4}
                className="w-full resize-none"
              />
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {existingQuote ? "Updating..." : "Submitting..."}
              </div>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {existingQuote ? "Update Quote" : "Submit Quote"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Service Field Group Component
interface ServiceFieldGroupProps {
  index: number;
  register: any;
  control: any;
  errors: any;
  onRemove: () => void;
  canRemove: boolean;
}

function ServiceFieldGroup({
  index,
  register,
  control,
  errors,
  onRemove,
  canRemove,
}: ServiceFieldGroupProps) {
  const {
    fields: partFields,
    append: appendPart,
    remove: removePart,
  } = useFieldArray({
    control,
    name: `services.${index}.parts`,
  });

  const serviceTypes = [
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

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Service {index + 1}</h4>
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Service Type *</Label>
          <select
            {...register(`services.${index}.serviceType`)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Select service type</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>
                {type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
          {errors.services?.[index]?.serviceType && (
            <p className="text-red-600 text-sm mt-1">
              {errors.services[index].serviceType.message}
            </p>
          )}
        </div>

        <div>
          <Label>Labor Hours *</Label>
          <Input
            type="number"
            step="0.5"
            {...register(`services.${index}.laborHours`, {
              valueAsNumber: true,
            })}
          />
          {errors.services?.[index]?.laborHours && (
            <p className="text-red-600 text-sm mt-1">
              {errors.services[index].laborHours.message}
            </p>
          )}
        </div>

        <div>
          <Label>Labor Rate (AED/hour) *</Label>
          <Input
            type="number"
            step="0.01"
            {...register(`services.${index}.laborRate`, {
              valueAsNumber: true,
            })}
          />
          {errors.services?.[index]?.laborRate && (
            <p className="text-red-600 text-sm mt-1">
              {errors.services[index].laborRate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>Service Description *</Label>
        <Textarea
          {...register(`services.${index}.description`)}
          placeholder="Detailed description of the work to be performed..."
          rows={3}
        />
        {errors.services?.[index]?.description && (
          <p className="text-red-600 text-sm mt-1">
            {errors.services[index].description.message}
          </p>
        )}
      </div>

      {/* Parts Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h5 className="font-medium">Parts Required</h5>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendPart({
                name: "",
                partNumber: "",
                quantity: 1,
                unitPrice: 0,
                warranty: "",
                isOEM: false,
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Part
          </Button>
        </div>

        {partFields.map((partField, partIndex) => (
          <div
            key={partField.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end border-l-2 border-gray-200 pl-4"
          >
            <div>
              <Label className="text-xs">Part Name *</Label>
              <Input
                size="sm"
                {...register(`services.${index}.parts.${partIndex}.name`)}
                placeholder="Part name"
              />
            </div>

            <div>
              <Label className="text-xs">Quantity *</Label>
              <Input
                size="sm"
                type="number"
                min="1"
                {...register(`services.${index}.parts.${partIndex}.quantity`, {
                  valueAsNumber: true,
                })}
              />
            </div>

            <div>
              <Label className="text-xs">Unit Price (AED) *</Label>
              <Input
                size="sm"
                type="number"
                step="0.01"
                {...register(`services.${index}.parts.${partIndex}.unitPrice`, {
                  valueAsNumber: true,
                })}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removePart(partIndex)}
              className="text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
