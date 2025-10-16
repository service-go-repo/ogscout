"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PortfolioManager from "@/components/workshops/portfolio-manager";
import CertificationManager from "@/components/workshops/certification-manager";
import GalleryManager from "@/components/workshops/gallery-manager";
import BusinessImageUpload from "@/components/workshops/business-image-upload";
import RegistrationDataMigrator from "@/components/workshops/registration-data-migrator";
import LocationPicker from "@/components/common/location-picker";
import AppointmentSettingsComponent from "@/components/appointments/appointment-settings";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Settings,
  Save,
  Loader2,
  AlertCircle,
  Award,
  Camera,
  Briefcase,
  User,
  CheckCircle,
  Calendar,
} from "lucide-react";
import {
  Workshop,
  ServiceType,
  CarBrand,
  OperatingHours,
  getServiceTypeLabel,
  getCarBrandLabel,
  getCertificationTypeLabel,
} from "@/models/Workshop";

// Validation schemas
const businessInfoSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  yearEstablished: z
    .number()
    .min(1900)
    .max(new Date().getFullYear())
    .optional(),
  employeeCount: z.number().min(1).max(1000).optional(),
  features: z.array(z.string()).optional(),
});

const contactInfoSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  website: z.string().url("Valid website URL").optional().or(z.literal("")),
  address: z.object({
    emirate: z.string().min(2, "Emirate is required"),
    street: z.string().min(5, "Address is required"),
    zipCode: z.string().min(3, "ZIP code is required"),
    country: z.string().default("United Arab Emirates"),
  }),
});

const operatingHoursSchema = z.object({
  monday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
  tuesday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
  wednesday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
  thursday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
  friday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
  saturday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
  sunday: z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  }),
});

type BusinessInfoForm = z.infer<typeof businessInfoSchema>;
type ContactInfoForm = z.infer<typeof contactInfoSchema>;
type OperatingHoursForm = z.infer<typeof operatingHoursSchema>;

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
  "tesla",
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
  "24/7 Emergency",
  "Pickup & Delivery",
];

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export default function WorkshopProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("business");
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<CarBrand[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showMigrator, setShowMigrator] = useState(false);
  const [hoursValidationErrors, setHoursValidationErrors] = useState<Record<string, string>>({});

  // Form instances
  const businessForm = useForm<BusinessInfoForm>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessName: "",
      description: "",
      features: [],
    },
  });

  const contactForm = useForm<ContactInfoForm>({
    resolver: zodResolver(contactInfoSchema) as any,
    defaultValues: {
      phone: "",
      email: "",
      website: "",
      address: {
        emirate: "",
        street: "",
        zipCode: "",
        country: "United Arab Emirates",
      },
    },
  });

  const hoursForm = useForm<OperatingHoursForm>({
    resolver: zodResolver(operatingHoursSchema),
    defaultValues: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true },
    },
  });

  // Fetch workshop profile
  const fetchWorkshopProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/workshops/profile");

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const workshopData = data.data;
          setWorkshop(workshopData);
          setLogoUrl(data.data.profile.logo || "");
          setCoverImageUrl(data.data.profile.coverImage || "");
          setShowMigrator(false); // Hide migrator if profile exists
          // Populate forms
          businessForm.reset({
            businessName: workshopData.profile.businessName,
            description: workshopData.profile.description,
            yearEstablished: workshopData.profile.yearEstablished,
            employeeCount: workshopData.profile.employeeCount,
            features: workshopData.profile.features,
          });

          contactForm.reset({
            phone: workshopData.contact.phone,
            email: workshopData.contact.email,
            website: workshopData.contact.website || "",
            address: workshopData.contact.address,
          });

          hoursForm.reset(
            workshopData.profile.operatingHours || {
              monday: { open: "09:00", close: "17:00", closed: false },
              tuesday: { open: "09:00", close: "17:00", closed: false },
              wednesday: { open: "09:00", close: "17:00", closed: false },
              thursday: { open: "09:00", close: "17:00", closed: false },
              friday: { open: "09:00", close: "17:00", closed: false },
              saturday: { open: "09:00", close: "17:00", closed: false },
              sunday: { open: "09:00", close: "17:00", closed: true },
            },
          );

          setSelectedServices(
            workshopData.profile.specializations.serviceTypes,
          );
          setSelectedBrands(workshopData.profile.specializations.carBrands);
          setSelectedFeatures(workshopData.profile.features);
        }
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch workshop profile:", errorData.error);
        setShowMigrator(true); // Show migrator if no profile exists
      }
    } catch (error) {
      console.error("Error fetching workshop profile:", error);
      setError("Failed to load workshop profile");
    } finally {
      setIsLoading(false);
    }
  }, [businessForm, contactForm, hoursForm]);

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "workshop") {
      router.push("/dashboard");
      return;
    }

    fetchWorkshopProfile();
  }, [session, status, router, fetchWorkshopProfile]);

  // Save profile section
  const saveSection = async (
    section: "business" | "contact" | "hours" | "specializations",
  ) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      let updateData: any = {};

      if (section === "business") {
        const businessData = businessForm.getValues();
        updateData.profile = {
          ...workshop?.profile,
          businessName: businessData.businessName,
          description: businessData.description,
          yearEstablished: businessData.yearEstablished,
          employeeCount: businessData.employeeCount,
          logo: logoUrl,
          coverImage: coverImageUrl,
          features: selectedFeatures,
        };
      } else if (section === "contact") {
        const contactData = contactForm.getValues();
        updateData.contact = {
          ...workshop?.contact,
          phone: contactData.phone,
          email: contactData.email,
          website: contactData.website,
          address: contactData.address,
        };
      } else if (section === "hours") {
        console.log("Saving operating hours...");
        // Collect current operating hours data from form state
        const hoursData = {
          monday: {
            open: hoursForm.watch("monday.open") || "09:00",
            close: hoursForm.watch("monday.close") || "17:00",
            closed: hoursForm.watch("monday.closed") ?? false,
          },
          tuesday: {
            open: hoursForm.watch("tuesday.open") || "09:00",
            close: hoursForm.watch("tuesday.close") || "17:00",
            closed: hoursForm.watch("tuesday.closed") ?? false,
          },
          wednesday: {
            open: hoursForm.watch("wednesday.open") || "09:00",
            close: hoursForm.watch("wednesday.close") || "17:00",
            closed: hoursForm.watch("wednesday.closed") ?? false,
          },
          thursday: {
            open: hoursForm.watch("thursday.open") || "09:00",
            close: hoursForm.watch("thursday.close") || "17:00",
            closed: hoursForm.watch("thursday.closed") ?? false,
          },
          friday: {
            open: hoursForm.watch("friday.open") || "09:00",
            close: hoursForm.watch("friday.close") || "17:00",
            closed: hoursForm.watch("friday.closed") ?? false,
          },
          saturday: {
            open: hoursForm.watch("saturday.open") || "09:00",
            close: hoursForm.watch("saturday.close") || "17:00",
            closed: hoursForm.watch("saturday.closed") ?? false,
          },
          sunday: {
            open: hoursForm.watch("sunday.open") || "09:00",
            close: hoursForm.watch("sunday.close") || "17:00",
            closed: hoursForm.watch("sunday.closed") ?? true,
          },
        };
        console.log("Collected hours data:", hoursData);
        updateData.profile = {
          ...workshop?.profile,
          operatingHours: hoursData,
        };
      } else if (section === "specializations") {
        updateData.profile = {
          ...workshop?.profile,
          specializations: {
            serviceTypes: selectedServices,
            carBrands: selectedBrands,
          },
        };
      }

      const response = await fetch(`/api/workshops/${workshop?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWorkshop(data.data);
          setSaveMessage({
            type: "success",
            message: "Profile updated successfully!",
          });
        } else {
          setSaveMessage({
            type: "error",
            message: data.error || "Failed to update profile",
          });
        }
      } else {
        setSaveMessage({ type: "error", message: "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveMessage({
        type: "error",
        message: "An error occurred while saving",
      });
    } finally {
      setIsSaving(false);

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handlePortfolioSave = async (portfolioItems: any[]) => {
    if (!workshop) return;

    const updatedWorkshop = {
      ...workshop,
      profile: {
        ...workshop.profile,
        portfolio: portfolioItems,
      },
    };

    const response = await fetch("/api/workshops/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedWorkshop),
    });

    const result = await response.json();
    if (result.success) {
      setWorkshop(result.data);
    }
  };

  const handleCertificationSave = async (certifications: any[]) => {
    if (!workshop) return;

    const updatedWorkshop = {
      ...workshop,
      profile: {
        ...workshop.profile,
        certifications: certifications,
      },
    };

    const response = await fetch("/api/workshops/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedWorkshop),
    });

    const result = await response.json();
    if (result.success) {
      setWorkshop(result.data);
    }
  };

  const handleGallerySave = async (gallery: any[]) => {
    if (!workshop) return;

    const updatedWorkshop = {
      ...workshop,
      profile: {
        ...workshop.profile,
        gallery: gallery,
      },
    };

    const response = await fetch("/api/workshops/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedWorkshop),
    });

    const result = await response.json();
    if (result.success) {
      setWorkshop(result.data);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Workshop Profile Settings
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your workshop profile and business information
          </p>
        </div>
      </div>

      {/* Registration Data Migrator */}
      {showMigrator && (
        <div className="mb-8">
          <RegistrationDataMigrator
            onMigrationComplete={() => {
              setShowMigrator(false);
              fetchWorkshopProfile(); // Refresh profile data
            }}
          />
        </div>
      )}

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveMessage.message}
        </div>
      )}

      {/* Pill Tabs Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setActiveTab("business")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "business"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Business
          </button>
          <button
            onClick={() => setActiveTab("contact")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "contact"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Contact
          </button>
          <button
            onClick={() => setActiveTab("hours")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "hours"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" />
            Hours
          </button>
          <button
            onClick={() => setActiveTab("specializations")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "specializations"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            Services
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "appointments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "portfolio"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab("certifications")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "certifications"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Award className="w-4 h-4" />
            Certificates
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "gallery"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Camera className="w-4 h-4" />
            Gallery
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        {activeTab === "business" && (
          <>
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={businessForm.handleSubmit(() =>
                  saveSection("business"),
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...businessForm.register("businessName")}
                      placeholder="Your Workshop Name"
                    />
                    {businessForm.formState.errors.businessName && (
                      <p className="text-sm text-destructive mt-1">
                        {businessForm.formState.errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="yearEstablished">Year Established</Label>
                    <Input
                      id="yearEstablished"
                      type="number"
                      {...businessForm.register("yearEstablished", {
                        valueAsNumber: true,
                      })}
                      placeholder="2020"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...businessForm.register("description")}
                    placeholder="Describe your workshop, services, and what makes you unique..."
                    rows={4}
                  />
                  {businessForm.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {businessForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    {...businessForm.register("employeeCount", {
                      valueAsNumber: true,
                    })}
                    placeholder="5"
                  />
                </div>

                {/* Features */}
                <div>
                  <Label>Workshop Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {COMMON_FEATURES.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={feature}
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedFeatures([
                                ...selectedFeatures,
                                feature,
                              ]);
                            } else {
                              setSelectedFeatures(
                                selectedFeatures.filter((f) => f !== feature),
                              );
                            }
                          }}
                        />
                        <Label htmlFor={feature} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Business Information
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Business Images */}
          <Card>
            <CardHeader>
              <CardTitle>Business Images</CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessImageUpload
                logoUrl={logoUrl}
                coverImageUrl={coverImageUrl}
                onLogoChange={async (url) => {
                  setLogoUrl(url || "");
                  // Auto-save when logo changes
                  if (workshop) {
                    try {
                      const updateData = {
                        profile: {
                          ...workshop.profile,
                          logo: url || "",
                        },
                      };
                      const response = await fetch(
                        `/api/workshops/${workshop._id}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updateData),
                        },
                      );
                      if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                          setWorkshop(data.data);
                          setSaveMessage({
                            type: "success",
                            message: "Logo updated successfully!",
                          });
                          setTimeout(() => setSaveMessage(null), 3000);
                        }
                      }
                    } catch (error) {
                      console.error("Error saving logo:", error);
                    }
                  }
                }}
                onCoverImageChange={async (url) => {
                  setCoverImageUrl(url || "");
                  // Auto-save when cover image changes
                  if (workshop) {
                    try {
                      const updateData = {
                        profile: {
                          ...workshop.profile,
                          coverImage: url || "",
                        },
                      };
                      const response = await fetch(
                        `/api/workshops/${workshop._id}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updateData),
                        },
                      );
                      if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                          setWorkshop(data.data);
                          setSaveMessage({
                            type: "success",
                            message: "Cover image updated successfully!",
                          });
                          setTimeout(() => setSaveMessage(null), 3000);
                        }
                      }
                    } catch (error) {
                      console.error("Error saving cover image:", error);
                    }
                  }
                }}
                disabled={isSaving}
              />
            </CardContent>
          </Card>
          </>
        )}

        {/* Contact Information */}
        {activeTab === "contact" && (
          <Card>
            <CardHeader>
              <CardTitle>Contact & Location Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={contactForm.handleSubmit(() =>
                  saveSection("contact"),
                )}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...contactForm.register("phone")}
                      placeholder="(555) 123-4567"
                    />
                    {contactForm.formState.errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {contactForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...contactForm.register("email")}
                      placeholder="contact@yourworkshop.com"
                    />
                    {contactForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {contactForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...contactForm.register("website")}
                    placeholder="https://yourworkshop.com"
                  />
                  {contactForm.formState.errors.website && (
                    <p className="text-sm text-destructive mt-1">
                      {contactForm.formState.errors.website.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Address</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emirate">Emirate *</Label>
                      <Select
                        value={contactForm.watch("address.emirate")}
                        onValueChange={(value) => {
                          contactForm.setValue("address.emirate", value);
                        }}
                      >
                        <SelectTrigger id="emirate">
                          <SelectValue placeholder="Select Emirate" />
                        </SelectTrigger>
                        <SelectContent>
                          {UAE_EMIRATES.map((emirate) => (
                            <SelectItem key={emirate} value={emirate}>
                              {emirate}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {contactForm.formState.errors.address?.emirate && (
                        <p className="text-sm text-destructive mt-1">
                          {contactForm.formState.errors.address.emirate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="street">Address *</Label>
                      <Input
                        id="street"
                        {...contactForm.register("address.street")}
                        placeholder="123 Main Street"
                      />
                      {contactForm.formState.errors.address?.street && (
                        <p className="text-sm text-destructive mt-1">
                          {contactForm.formState.errors.address.street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        {...contactForm.register("address.zipCode")}
                        placeholder="00000"
                      />
                      {contactForm.formState.errors.address?.zipCode && (
                        <p className="text-sm text-destructive mt-1">
                          {contactForm.formState.errors.address.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Picker */}
                <LocationPicker
                  initialLocation={
                    workshop?.contact.location
                      ? {
                          coordinates: workshop.contact.location.coordinates,
                          address:
                            typeof workshop.contact.address === "string"
                              ? workshop.contact.address
                              : `${workshop.contact.address.street}, ${workshop.contact.address.emirate || workshop.contact.address.city}, ${workshop.contact.address.zipCode}`,
                        }
                      : undefined
                  }
                  onLocationSelect={(location) => {
                    // Update workshop location when selected
                    // This will be handled by the form submission
                    console.log("Location selected:", location);
                  }}
                  disabled={isSaving}
                />

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Contact Information
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Operating Hours */}
        {activeTab === "hours" && (
          <Card>
            <CardHeader>
              <CardTitle>Operating Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveSection("hours");
                }}
                className="space-y-4"
              >
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => {
                  const dayData = hoursForm.watch(
                    day as keyof OperatingHours,
                  ) || { open: "09:00", close: "17:00", closed: false };
                  const isClosed = hoursForm.watch(
                    `${day as keyof OperatingHours}.closed`,
                  ) ?? day === "sunday";

                  // Validate time logic
                  const validateTimes = (openTime: string, closeTime: string) => {
                    if (!openTime || !closeTime) return null;

                    // Convert time strings to minutes for comparison
                    const openMinutes = parseInt(openTime.split(':')[0]) * 60 + parseInt(openTime.split(':')[1]);
                    const closeMinutes = parseInt(closeTime.split(':')[0]) * 60 + parseInt(closeTime.split(':')[1]);

                    if (closeMinutes <= openMinutes) {
                      return `Close time must be after open time`;
                    }
                    return null;
                  };

                  const openTime = hoursForm.watch(`${day as keyof OperatingHours}.open`) || "09:00";
                  const closeTime = hoursForm.watch(`${day as keyof OperatingHours}.close`) || "17:00";
                  const validationError = !isClosed ? validateTimes(openTime, closeTime) : null;

                  return (
                    <div
                      key={day}
                      className="p-4 border rounded-lg space-y-3 overflow-hidden"
                    >
                      {/* First line: Day name and Toggle */}
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={!isClosed}
                          onCheckedChange={(checked) => {
                            hoursForm.setValue(
                              `${day as keyof OperatingHours}.closed`,
                              !checked,
                            );
                            // Clear validation error when closing
                            if (!checked) {
                              const newErrors = { ...hoursValidationErrors };
                              delete newErrors[day];
                              setHoursValidationErrors(newErrors);
                            }
                          }}
                        />
                        <Label className="capitalize font-medium text-base">{day}</Label>
                      </div>

                      {/* Second line: Time fields (when open) */}
                      {!isClosed && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="min-w-0">
                              <Label className="text-sm">Open Time</Label>
                              <Input
                                type="time"
                                value={openTime}
                                onChange={(e) => {
                                  hoursForm.setValue(
                                    `${day as keyof OperatingHours}.open`,
                                    e.target.value,
                                  );
                                  // Validate on change
                                  const error = validateTimes(e.target.value, closeTime);
                                  if (error) {
                                    setHoursValidationErrors({ ...hoursValidationErrors, [day]: error });
                                  } else {
                                    const newErrors = { ...hoursValidationErrors };
                                    delete newErrors[day];
                                    setHoursValidationErrors(newErrors);
                                  }
                                }}
                                className="w-full"
                              />
                            </div>

                            <div className="min-w-0">
                              <Label className="text-sm">Close Time</Label>
                              <Input
                                type="time"
                                value={closeTime}
                                onChange={(e) => {
                                  hoursForm.setValue(
                                    `${day as keyof OperatingHours}.close`,
                                    e.target.value,
                                  );
                                  // Validate on change
                                  const error = validateTimes(openTime, e.target.value);
                                  if (error) {
                                    setHoursValidationErrors({ ...hoursValidationErrors, [day]: error });
                                  } else {
                                    const newErrors = { ...hoursValidationErrors };
                                    delete newErrors[day];
                                    setHoursValidationErrors(newErrors);
                                  }
                                }}
                                className="w-full"
                              />
                            </div>
                          </div>

                          {/* Validation error message */}
                          {validationError && (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>{validationError}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Closed message */}
                      {isClosed && (
                        <p className="text-muted-foreground italic text-sm">
                          Closed
                        </p>
                      )}
                    </div>
                  );
                })}

                <Button type="submit" disabled={isSaving || Object.keys(hoursValidationErrors).length > 0}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Operating Hours
                </Button>
                {Object.keys(hoursValidationErrors).length > 0 && (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Please fix the time validation errors before saving
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Appointment Settings */}
        {activeTab === "appointments" && (
          <AppointmentSettingsComponent />
        )}

        {/* Specializations */}
        {activeTab === "specializations" && (
          <div className="space-y-6">
            {/* Service Types */}
            <Card>
              <CardHeader>
                <CardTitle>Service Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SERVICE_TYPES.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedServices([...selectedServices, service]);
                          } else {
                            setSelectedServices(
                              selectedServices.filter((s) => s !== service),
                            );
                          }
                        }}
                      />
                      <Label htmlFor={service} className="text-sm">
                        {getServiceTypeLabel(service)}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Car Brands */}
            <Card>
              <CardHeader>
                <CardTitle>Car Brands Specialization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CAR_BRANDS.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBrands([...selectedBrands, brand]);
                          } else {
                            setSelectedBrands(
                              selectedBrands.filter((b) => b !== brand),
                            );
                          }
                        }}
                      />
                      <Label htmlFor={brand} className="text-sm">
                        {getCarBrandLabel(brand)}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => saveSection("specializations")}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Specializations
            </Button>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <PortfolioManager
            portfolioItems={workshop?.profile.portfolio || []}
            onSave={handlePortfolioSave}
            isLoading={isSaving}
          />
        )}

        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <CertificationManager
            certifications={(workshop?.profile.certifications || []).map(
              (cert, index) => ({
                ...cert,
                id: `cert-${index}`,
              }),
            )}
            onSave={handleCertificationSave}
            isLoading={isSaving}
          />
        )}

        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <GalleryManager
            images={(workshop?.profile.gallery || []) as any}
            onSave={handleGallerySave}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
}
