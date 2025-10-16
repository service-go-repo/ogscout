"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AppointmentSettings } from "@/models/AppointmentSettings";

interface AppointmentSettingsProps {
  onSettingsUpdated?: (settings: AppointmentSettings) => void;
}

const SERVICE_TYPES = [
  { value: "oil_change", label: "Oil Change", defaultDuration: 30 },
  { value: "brake_service", label: "Brake Service", defaultDuration: 60 },
  { value: "engine_repair", label: "Engine Repair", defaultDuration: 240 },
  {
    value: "transmission_repair",
    label: "Transmission Repair",
    defaultDuration: 360,
  },
  { value: "diagnostic", label: "Diagnostic", defaultDuration: 60 },
  { value: "maintenance", label: "General Maintenance", defaultDuration: 90 },
  { value: "bodywork", label: "Body Work", defaultDuration: 480 },
  { value: "paint", label: "Paint Service", defaultDuration: 720 },
  { value: "tires", label: "Tire Service", defaultDuration: 45 },
  { value: "electrical", label: "Electrical Repair", defaultDuration: 120 },
];

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function AppointmentSettingsComponent({
  onSettingsUpdated,
}: AppointmentSettingsProps) {
  const [settings, setSettings] = useState<AppointmentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workshops/appointment-settings");
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        toast.error("Failed to load appointment settings");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load appointment settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const response = await fetch("/api/workshops/appointment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        setSaveMessage({
          type: "success",
          message: "Profile updated successfully!",
        });
        onSettingsUpdated?.(data.data);
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({
          type: "error",
          message: data.error || "Failed to save settings",
        });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage({
        type: "error",
        message: "Failed to save settings",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<AppointmentSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const updateSlotSettings = (
    updates: Partial<AppointmentSettings["slotSettings"]>,
  ) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            slotSettings: { ...prev.slotSettings, ...updates },
          }
        : null,
    );
  };

  const updateBookingSettings = (
    updates: Partial<AppointmentSettings["bookingSettings"]>,
  ) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            bookingSettings: { ...prev.bookingSettings, ...updates },
          }
        : null,
    );
  };

  const updateServiceDuration = (serviceType: string, duration: number) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            slotSettings: {
              ...prev.slotSettings,
              serviceDurations: {
                ...prev.slotSettings.serviceDurations,
                [serviceType]: duration,
              },
            },
          }
        : null,
    );
  };

  const [newExceptionDate, setNewExceptionDate] = useState<string>("");
  const [newExceptionType, setNewExceptionType] = useState<"closed" | "modified_hours" | "holiday">("closed");
  const [newExceptionReason, setNewExceptionReason] = useState<string>("");
  const [newExceptionStartTime, setNewExceptionStartTime] = useState<string>("09:00");
  const [newExceptionEndTime, setNewExceptionEndTime] = useState<string>("17:00");

  const addAvailabilityException = () => {
    if (!newExceptionDate) {
      toast.error("Please select a date");
      return;
    }

    const selectedDate = new Date(newExceptionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Please select a future date");
      return;
    }

    if (!newExceptionReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    const newException: any = {
      id: Date.now().toString(),
      date: selectedDate,
      type: newExceptionType,
      reason: newExceptionReason.trim(),
    };

    if (newExceptionType === "modified_hours") {
      newException.modifiedHours = {
        start: newExceptionStartTime,
        end: newExceptionEndTime
      };
    }

    setSettings((prev) =>
      prev
        ? {
            ...prev,
            availabilityExceptions: [
              ...prev.availabilityExceptions,
              newException,
            ],
          }
        : null,
    );

    // Reset form
    setNewExceptionDate("");
    setNewExceptionType("closed");
    setNewExceptionReason("");
    setNewExceptionStartTime("09:00");
    setNewExceptionEndTime("17:00");
    toast.success("Special date added successfully");
  };

  const removeAvailabilityException = (id: string) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            availabilityExceptions: prev.availabilityExceptions.filter(
              (ex) => ex.id !== id,
            ),
          }
        : null,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load appointment settings</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Appointment Settings</h2>
        <p className="text-muted-foreground">
          Configure your appointment booking system
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Appointment Booking</h3>
                <Badge variant={settings.enabled ? "default" : "secondary"}>
                  {settings.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {settings.enabled
                  ? "Customers can book appointments with your workshop"
                  : "Appointment booking is currently disabled"}
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pill-style Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "general"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            General
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "slots"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" />
            Time Slots
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "services"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Users className="w-4 h-4" />
            Services
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "availability"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Availability
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "policies"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-white text-foreground border border-border hover:bg-gray-50"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Policies
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>

        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic appointment booking configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAdvance">
                    Minimum Advance Booking (hours)
                  </Label>
                  <Input
                    id="minAdvance"
                    type="number"
                    value={settings.bookingSettings.minAdvanceBooking}
                    onChange={(e) =>
                      updateBookingSettings({
                        minAdvanceBooking: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="maxAdvance">
                    Maximum Advance Booking (days)
                  </Label>
                  <Input
                    id="maxAdvance"
                    type="number"
                    value={settings.bookingSettings.maxAdvanceBooking}
                    onChange={(e) =>
                      updateBookingSettings({
                        maxAdvanceBooking: parseInt(e.target.value) || 90,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Require Manual Confirmation</Label>
                  <Switch
                    checked={settings.bookingSettings.requireConfirmation}
                    onCheckedChange={(requireConfirmation) =>
                      updateBookingSettings({ requireConfirmation })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Service Selection</Label>
                  <Switch
                    checked={settings.requireServiceSelection}
                    onCheckedChange={(requireServiceSelection) =>
                      updateSettings({ requireServiceSelection })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Deposit</Label>
                  <Switch
                    checked={settings.requireDeposit}
                    onCheckedChange={(requireDeposit) =>
                      updateSettings({ requireDeposit })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Time Slots Settings */}
        {activeTab === "slots" && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Slot Configuration
              </CardTitle>
              <CardDescription>
                Configure how appointment time slots work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultDuration">
                    Default Duration (minutes)
                  </Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={settings.slotSettings.defaultDuration}
                    onChange={(e) =>
                      updateSlotSettings({
                        defaultDuration: parseInt(e.target.value) || 120,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="slotInterval">Slot Interval (minutes)</Label>
                  <Input
                    id="slotInterval"
                    type="number"
                    value={settings.slotSettings.slotInterval}
                    onChange={(e) =>
                      updateSlotSettings({
                        slotInterval: parseInt(e.target.value) || 60,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={settings.slotSettings.bufferTime}
                    onChange={(e) =>
                      updateSlotSettings({
                        bufferTime: parseInt(e.target.value) || 15,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxConcurrent">
                    Max Concurrent Appointments
                  </Label>
                  <Input
                    id="maxConcurrent"
                    type="number"
                    value={settings.slotSettings.maxConcurrentAppointments}
                    onChange={(e) =>
                      updateSlotSettings({
                        maxConcurrentAppointments:
                          parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="allowOverlapping"
                    checked={settings.slotSettings.allowOverlapping}
                    onCheckedChange={(allowOverlapping) =>
                      updateSlotSettings({ allowOverlapping })
                    }
                  />
                  <Label htmlFor="allowOverlapping">
                    Allow Overlapping Appointments
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Services Settings */}
        {activeTab === "services" && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Service Duration Settings
              </CardTitle>
              <CardDescription>
                Configure duration for different service types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SERVICE_TYPES.map((service) => (
                  <div key={service.value} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{service.label}</Label>
                      <Badge variant="outline">
                        {settings.slotSettings.serviceDurations[
                          service.value
                        ] || service.defaultDuration}
                        m
                      </Badge>
                    </div>
                    <Input
                      type="number"
                      value={
                        settings.slotSettings.serviceDurations[service.value] ||
                        service.defaultDuration
                      }
                      onChange={(e) =>
                        updateServiceDuration(
                          service.value,
                          parseInt(e.target.value) || service.defaultDuration,
                        )
                      }
                      placeholder={`Default: ${service.defaultDuration} minutes`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Availability Settings */}
        {activeTab === "availability" && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Settings
              </CardTitle>
              <CardDescription>
                Manage your appointment availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Use Workshop Operating Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Use your workshop's operating hours for appointments
                  </p>
                </div>
                <Switch
                  checked={settings.useOperatingHours}
                  onCheckedChange={(useOperatingHours) =>
                    updateSettings({ useOperatingHours })
                  }
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4">Special Dates & Holidays</h4>

                {/* Add Exception Form */}
                <Card className="mb-4">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="exceptionDate">Date *</Label>
                        <Input
                          id="exceptionDate"
                          type="date"
                          value={newExceptionDate}
                          onChange={(e) => setNewExceptionDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <Label htmlFor="exceptionType">Type *</Label>
                        <Select
                          value={newExceptionType}
                          onValueChange={(value: "closed" | "modified_hours" | "holiday") => setNewExceptionType(value)}
                        >
                          <SelectTrigger id="exceptionType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closed">Fully Closed</SelectItem>
                            <SelectItem value="modified_hours">Modified Hours</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {newExceptionType === "modified_hours" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="exceptionStartTime">Available From</Label>
                          <Input
                            id="exceptionStartTime"
                            type="time"
                            value={newExceptionStartTime}
                            onChange={(e) => setNewExceptionStartTime(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="exceptionEndTime">Available Until</Label>
                          <Input
                            id="exceptionEndTime"
                            type="time"
                            value={newExceptionEndTime}
                            onChange={(e) => setNewExceptionEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="exceptionReason">Reason *</Label>
                      <Input
                        id="exceptionReason"
                        placeholder="e.g., National Holiday, Staff Training, etc."
                        value={newExceptionReason}
                        onChange={(e) => setNewExceptionReason(e.target.value)}
                      />
                    </div>

                    <Button onClick={addAvailabilityException}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Special Date
                    </Button>
                  </CardContent>
                </Card>

                {/* Exception List */}
                <div className="space-y-2">
                  {settings.availabilityExceptions.map((exception) => (
                    <div
                      key={exception.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium">{exception.reason}</div>
                          <Badge variant={exception.type === "closed" ? "destructive" : exception.type === "holiday" ? "outline" : "secondary"}>
                            {exception.type === "closed" ? "Fully Closed" : exception.type === "holiday" ? "Holiday" : "Modified Hours"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(exception.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {exception.type === "modified_hours" && exception.modifiedHours && (
                            <span> • Available: {exception.modifiedHours.start} - {exception.modifiedHours.end}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          removeAvailabilityException(exception.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {settings.availabilityExceptions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      No special dates or holidays configured
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Policies Settings */}
        {activeTab === "policies" && (
          <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Cancellation & Booking Policies
              </CardTitle>
              <CardDescription>
                Configure policies for cancellations and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cancelDeadline">
                    Cancellation Deadline (hours before)
                  </Label>
                  <Input
                    id="cancelDeadline"
                    type="number"
                    value={settings.bookingSettings.cancellationDeadline}
                    onChange={(e) =>
                      updateBookingSettings({
                        cancellationDeadline: parseInt(e.target.value) || 24,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="rescheduleDeadline">
                    Reschedule Deadline (hours before)
                  </Label>
                  <Input
                    id="rescheduleDeadline"
                    type="number"
                    value={settings.bookingSettings.rescheduleDeadline}
                    onChange={(e) =>
                      updateBookingSettings({
                        rescheduleDeadline: parseInt(e.target.value) || 12,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Enable Appointment Reminders</Label>
                  <Switch
                    checked={settings.bookingSettings.enableReminders}
                    onCheckedChange={(enableReminders) =>
                      updateBookingSettings({ enableReminders })
                    }
                  />
                </div>

                {settings.bookingSettings.enableReminders && (
                  <div>
                    <Label>Reminder Times (hours before appointment)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[0.5, 2, 24, 48].map((hours) => (
                        <Badge
                          key={hours}
                          variant={
                            settings.bookingSettings.reminderTimes.includes(
                              hours,
                            )
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            const times =
                              settings.bookingSettings.reminderTimes;
                            const updated = times.includes(hours)
                              ? times.filter((t) => t !== hours)
                              : [...times, hours];
                            updateBookingSettings({ reminderTimes: updated });
                          }}
                        >
                          {hours === 0.5 ? "30 min" : `${hours}h`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        )}
      </div>

      {/* Save Message Notification */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.type === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">{saveMessage.message}</span>
        </div>
      )}

      {/* Action Buttons at Bottom */}
      <div className="flex items-center justify-between gap-2 pt-4 border-t">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
        <Button variant="outline" onClick={loadSettings}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
