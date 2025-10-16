"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageContainer,
  PageHeader,
  PageGrid,
  PageSection,
} from "@/components/layout/page-container";
import {
  Car,
  FileText,
  Settings,
  Plus,
  DollarSign,
  MessageSquare,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar as CalendarIcon,
  Star,
  Loader2,
  Sparkles,
  PlayCircle,
} from "lucide-react";

interface DashboardStats {
  carCount: number;
  // Quotation stats
  pendingQuotes: number;
  receivedQuotes: number;
  acceptedQuotes: number;
  totalQuotes: number;
  // Workshop stats
  quoteRequests: number;
  submittedQuotes: number;
  wonQuotes: number;
  // Appointment stats (both customer and workshop)
  todayAppointments: number;
  pendingAppointments: number;
  upcomingAppointments: number;
  customerUpcomingAppointments: number;
  customerInProgressAppointments: number;
  // Completed jobs stats
  completedJobs: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  customerCompletedJobs: number;
  customerTotalSpent: number;
  // Active jobs stats
  inProgressJobs: number;
  scheduledToday: number;
  upcomingJobs: number;
}

// Utility functions for number formatting
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 10000) return `${(num / 1000).toFixed(1)}K`;
  if (num >= 1000) return num.toLocaleString();
  return num.toString();
};

const formatCurrency = (amount: number, currency: string = "AED"): string => {
  if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 10000) {
    return `${currency} ${(amount / 1000).toFixed(1)}K`;
  }
  return `${currency} ${amount.toLocaleString("en-AE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    carCount: 0,
    pendingQuotes: 0,
    receivedQuotes: 0,
    acceptedQuotes: 0,
    totalQuotes: 0,
    quoteRequests: 0,
    submittedQuotes: 0,
    wonQuotes: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    upcomingAppointments: 0,
    customerUpcomingAppointments: 0,
    customerInProgressAppointments: 0,
    completedJobs: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    customerCompletedJobs: 0,
    customerTotalSpent: 0,
    inProgressJobs: 0,
    scheduledToday: 0,
    upcomingJobs: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    type: "network" | "auth" | "server";
    message: string;
  } | null>(null);

  const isCustomer = session?.user?.role === "customer";
  const isWorkshop = session?.user?.role === "workshop";

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }

    const fetchStats = async () => {
      setError(null);
      try {
        if (isCustomer) {
          // Fetch customer stats
          const [carsResponse, quotationsResponse, appointmentsResponse] = await Promise.all([
            fetch("/api/cars"),
            fetch("/api/quotations"),
            fetch("/api/appointments"),
          ]);

          // Check for auth errors
          if (
            carsResponse.status === 401 ||
            quotationsResponse.status === 401 ||
            appointmentsResponse.status === 401
          ) {
            setError({
              type: "auth",
              message: "Session expired. Redirecting to login...",
            });
            setTimeout(() => redirect("/auth/login"), 2000);
            return;
          }

          // Check for server errors
          if (!carsResponse.ok || !quotationsResponse.ok) {
            setError({
              type: "server",
              message: "Unable to load some data. Please try again.",
            });
          }

          if (carsResponse.ok) {
            const carsData = await carsResponse.json();
            setStats((prev) => ({
              ...prev,
              carCount: carsData.data?.cars?.length || 0,
            }));
          }

          if (quotationsResponse.ok) {
            const quotationsData = await quotationsResponse.json();
            const quotations = quotationsData.data?.quotations || [];

            setStats((prev) => ({
              ...prev,
              pendingQuotes: quotations.filter(
                (q: any) => q.status === "pending",
              ).length,
              receivedQuotes: quotations.filter(
                (q: any) => q.status === "quoted",
              ).length,
              acceptedQuotes: quotations.filter(
                (q: any) => q.status === "accepted",
              ).length,
              totalQuotes: quotations.length,
            }));
          }

          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            const appointments = appointmentsData.data?.appointments || [];

            // Calculate customer appointment stats
            const upcomingAppointments = appointments.filter((apt: any) =>
              ['requested', 'confirmed', 'scheduled'].includes(apt.status)
            ).length;

            const inProgressAppointments = appointments.filter((apt: any) =>
              apt.status === 'in_progress'
            ).length;

            const completedAppointments = appointments.filter((apt: any) =>
              apt.status === 'completed'
            );

            const totalSpent = completedAppointments.reduce(
              (sum: number, apt: any) => sum + (apt.totalAmount || 0),
              0
            );

            setStats((prev) => ({
              ...prev,
              customerUpcomingAppointments: upcomingAppointments,
              customerInProgressAppointments: inProgressAppointments,
              customerCompletedJobs: completedAppointments.length,
              customerTotalSpent: totalSpent,
            }));
          }
        } else if (isWorkshop) {
          // Fetch workshop quotation and appointment stats
          const [quotationsResponse, appointmentsResponse] = await Promise.all([
            fetch("/api/quotations"),
            fetch("/api/appointments").catch(() => ({ ok: false })), // Gracefully handle if appointments API fails
          ]);

          // Check for auth errors
          if (quotationsResponse.status === 401) {
            setError({
              type: "auth",
              message: "Session expired. Redirecting to login...",
            });
            setTimeout(() => redirect("/auth/login"), 2000);
            return;
          }

          // Check for server errors
          if (!quotationsResponse.ok) {
            setError({
              type: "server",
              message: "Unable to load workshop data. Please try again.",
            });
          }

          if (quotationsResponse.ok) {
            const quotationsData = await quotationsResponse.json();
            const quotations = quotationsData.data?.quotations || [];

            // Count quotes where this workshop is involved
            let quoteRequests = 0;
            let submittedQuotes = 0;
            let wonQuotes = 0;

            quotations.forEach((q: any) => {
              const myQuote = q.quotes?.find(
                (quote: any) => quote.workshopId === session?.user?.id,
              );
              if (myQuote) {
                if (myQuote.status === "pending") quoteRequests++;
                else if (myQuote.status === "submitted") submittedQuotes++;
                else if (myQuote.status === "accepted") wonQuotes++;
              } else if (
                !q.targetWorkshops ||
                q.targetWorkshops.includes(session?.user?.id)
              ) {
                quoteRequests++;
              }
            });

            setStats((prev) => ({
              ...prev,
              quoteRequests,
              submittedQuotes,
              wonQuotes,
            }));
          }

          if (appointmentsResponse.ok && 'json' in appointmentsResponse) {
            const appointmentsData = await appointmentsResponse.json();
            const appointments = appointmentsData.data?.appointments || [];

            // Calculate appointment stats
            const today = new Date().toISOString().split("T")[0];
            const todayAppointments = appointments.filter(
              (apt: any) => apt.scheduledDate.split("T")[0] === today,
            ).length;

            const pendingAppointments = appointments.filter(
              (apt: any) => apt.status === "requested",
            ).length;

            const upcomingAppointments = appointments.filter((apt: any) => {
              const aptDate = new Date(apt.scheduledDate);
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              return aptDate > new Date() && aptDate <= nextWeek;
            }).length;

            // Calculate completed jobs stats
            const completedAppointments = appointments.filter(
              (apt: any) => apt.status === "completed",
            );
            const completedJobs = completedAppointments.length;

            // Calculate revenue from paid appointments
            const totalRevenue = completedAppointments
              .filter((apt: any) => apt.paymentStatus === "paid")
              .reduce(
                (sum: number, apt: any) => sum + (apt.totalAmount || 0),
                0,
              );

            // Calculate average rating and review count
            const appointmentsWithRating = completedAppointments.filter(
              (apt: any) => apt.customerRating,
            );
            const totalReviews = appointmentsWithRating.length;
            const averageRating =
              totalReviews > 0
                ? appointmentsWithRating.reduce(
                    (sum: number, apt: any) => sum + apt.customerRating,
                    0,
                  ) / totalReviews
                : 0;

            // Calculate Active Jobs stats
            const inProgressJobs = appointments.filter(
              (apt: any) => apt.status === "in_progress",
            ).length;

            const scheduledToday = appointments.filter((apt: any) => {
              const aptDate = apt.scheduledDate.split("T")[0];
              return (
                aptDate === today &&
                ["scheduled", "confirmed"].includes(apt.status)
              );
            }).length;

            const upcomingJobs = appointments.filter((apt: any) => {
              const aptDate = new Date(apt.scheduledDate);
              return (
                aptDate > new Date() &&
                ["requested", "confirmed", "scheduled"].includes(apt.status)
              );
            }).length;

            setStats((prev) => ({
              ...prev,
              todayAppointments,
              pendingAppointments,
              upcomingAppointments,
              completedJobs,
              totalRevenue,
              averageRating,
              totalReviews,
              inProgressJobs,
              scheduledToday,
              upcomingJobs,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setError({
          type: "network",
          message: "Network error. Please check your connection and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session, status, isCustomer, isWorkshop]);

  if (status === "loading" || !session) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="border-b border-border mb-6" />
          <PageGrid cols={{ sm: 1, md: 2, lg: 4 }}>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </PageGrid>
        </div>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          Loading your dashboard data, please wait
        </div>
      </PageContainer>
    );
  }

  // Role validation
  const userRole = session?.user?.role;
  if (!userRole || (userRole !== "customer" && userRole !== "workshop")) {
    return (
      <PageContainer>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              Account Configuration Error
            </CardTitle>
            <CardDescription>
              Your account is not properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your account role is{" "}
              {userRole ? `invalid ("${userRole}")` : "missing"}. Please contact
              support to resolve this issue.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="default">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/logout">Log Out</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <>
      {/* Screen reader announcements for loading and error states */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isLoading && "Loading dashboard statistics"}
        {!isLoading && "Dashboard loaded successfully"}
      </div>

      <PageContainer>
        <PageHeader
          title={`Welcome back, ${session.user?.name || session.user?.email}!`}
          description={
            isCustomer
              ? "Manage your vehicles and get repair quotes from trusted workshops."
              : "Manage your workshop, respond to quote requests, and grow your business."
          }
        />

        {/* Error Banner */}
        {error && (
          <div
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-destructive">
                  {error.type === "network" && "Connection Error"}
                  {error.type === "auth" && "Authentication Error"}
                  {error.type === "server" && "Server Error"}
                </p>
                <p className="text-sm text-destructive/90 mt-1">
                  {error.message}
                </p>
              </div>
              {error.type !== "auth" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    if (session) {
                      const fetchStats = async () => {
                        setError(null);
                        try {
                          if (isCustomer) {
                            const [carsResponse, quotationsResponse] =
                              await Promise.all([
                                fetch("/api/cars"),
                                fetch("/api/quotations"),
                              ]);
                            if (
                              carsResponse.status === 401 ||
                              quotationsResponse.status === 401
                            ) {
                              setError({
                                type: "auth",
                                message:
                                  "Session expired. Redirecting to login...",
                              });
                              setTimeout(() => redirect("/auth/login"), 2000);
                              return;
                            }
                            if (!carsResponse.ok || !quotationsResponse.ok) {
                              setError({
                                type: "server",
                                message:
                                  "Unable to load some data. Please try again.",
                              });
                            }
                            if (carsResponse.ok) {
                              const carsData = await carsResponse.json();
                              setStats((prev) => ({
                                ...prev,
                                carCount: carsData.data?.cars?.length || 0,
                              }));
                            }
                            if (quotationsResponse.ok) {
                              const quotationsData =
                                await quotationsResponse.json();
                              const quotations =
                                quotationsData.data?.quotations || [];
                              setStats((prev) => ({
                                ...prev,
                                pendingQuotes: quotations.filter(
                                  (q: any) => q.status === "pending",
                                ).length,
                                receivedQuotes: quotations.filter(
                                  (q: any) => q.status === "quoted",
                                ).length,
                                acceptedQuotes: quotations.filter(
                                  (q: any) => q.status === "accepted",
                                ).length,
                              }));
                            }
                          } else if (isWorkshop) {
                            const [quotationsResponse, appointmentsResponse] =
                              await Promise.all([
                                fetch("/api/quotations"),
                                fetch("/api/appointments").catch(() => ({
                                  ok: false,
                                })),
                              ]);
                            if (quotationsResponse.status === 401) {
                              setError({
                                type: "auth",
                                message:
                                  "Session expired. Redirecting to login...",
                              });
                              setTimeout(() => redirect("/auth/login"), 2000);
                              return;
                            }
                            if (!quotationsResponse.ok) {
                              setError({
                                type: "server",
                                message:
                                  "Unable to load workshop data. Please try again.",
                              });
                            }
                            if (quotationsResponse.ok) {
                              const quotationsData =
                                await quotationsResponse.json();
                              const quotations =
                                quotationsData.data?.quotations || [];
                              let quoteRequests = 0,
                                submittedQuotes = 0,
                                wonQuotes = 0;
                              quotations.forEach((q: any) => {
                                const myQuote = q.quotes?.find(
                                  (quote: any) =>
                                    quote.workshopId === session?.user?.id,
                                );
                                if (myQuote) {
                                  if (myQuote.status === "pending")
                                    quoteRequests++;
                                  else if (myQuote.status === "submitted")
                                    submittedQuotes++;
                                  else if (myQuote.status === "accepted")
                                    wonQuotes++;
                                } else if (
                                  !q.targetWorkshops ||
                                  q.targetWorkshops.includes(session?.user?.id)
                                ) {
                                  quoteRequests++;
                                }
                              });
                              setStats((prev) => ({
                                ...prev,
                                quoteRequests,
                                submittedQuotes,
                                wonQuotes,
                              }));
                            }
                            if (appointmentsResponse.ok && 'json' in appointmentsResponse) {
                              const appointmentsData =
                                await appointmentsResponse.json();
                              const appointments =
                                appointmentsData.data?.appointments || [];
                              const today = new Date()
                                .toISOString()
                                .split("T")[0];
                              const todayAppointments = appointments.filter(
                                (apt: any) =>
                                  apt.scheduledDate.split("T")[0] === today,
                              ).length;
                              const pendingAppointments = appointments.filter(
                                (apt: any) => apt.status === "requested",
                              ).length;
                              const upcomingAppointments = appointments.filter(
                                (apt: any) => {
                                  const aptDate = new Date(apt.scheduledDate);
                                  const nextWeek = new Date();
                                  nextWeek.setDate(nextWeek.getDate() + 7);
                                  return (
                                    aptDate > new Date() && aptDate <= nextWeek
                                  );
                                },
                              ).length;
                              const completedAppointments = appointments.filter(
                                (apt: any) => apt.status === "completed",
                              );
                              const completedJobs =
                                completedAppointments.length;
                              const totalRevenue = completedAppointments
                                .filter(
                                  (apt: any) => apt.paymentStatus === "paid",
                                )
                                .reduce(
                                  (sum: number, apt: any) =>
                                    sum + (apt.totalAmount || 0),
                                  0,
                                );
                              const appointmentsWithRating =
                                completedAppointments.filter(
                                  (apt: any) => apt.customerRating,
                                );
                              const totalReviews =
                                appointmentsWithRating.length;
                              const averageRating =
                                totalReviews > 0
                                  ? appointmentsWithRating.reduce(
                                      (sum: number, apt: any) =>
                                        sum + apt.customerRating,
                                      0,
                                    ) / totalReviews
                                  : 0;

                              // Calculate Active Jobs stats
                              const inProgressJobs = appointments.filter(
                                (apt: any) => apt.status === "in_progress",
                              ).length;

                              const scheduledToday = appointments.filter((apt: any) => {
                                const aptDate = apt.scheduledDate.split("T")[0];
                                return (
                                  aptDate === today &&
                                  ["scheduled", "confirmed"].includes(apt.status)
                                );
                              }).length;

                              const upcomingJobs = appointments.filter((apt: any) => {
                                const aptDate = new Date(apt.scheduledDate);
                                return (
                                  aptDate > new Date() &&
                                  ["requested", "confirmed", "scheduled"].includes(apt.status)
                                );
                              }).length;

                              setStats((prev) => ({
                                ...prev,
                                todayAppointments,
                                pendingAppointments,
                                upcomingAppointments,
                                completedJobs,
                                totalRevenue,
                                averageRating,
                                totalReviews,
                                inProgressJobs,
                                scheduledToday,
                                upcomingJobs,
                              }));
                            }
                          }
                        } catch (error) {
                          console.error(
                            "Error fetching dashboard stats:",
                            error,
                          );
                          setError({
                            type: "network",
                            message:
                              "Network error. Please check your connection and try again.",
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      };
                      fetchStats();
                    }
                  }}
                  aria-label="Retry loading dashboard data"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Customer Quick Stats & Actions */}
        {isCustomer && (
          <>
            <div className="border-b border-border mb-6" />
            <PageGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {/* Request Quote - Primary CTA */}
              <Link
                href="/quotations/request"
                aria-label="Request a new repair quote from workshops"
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      Request Quote
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <Plus className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold">New!</div>
                      <Badge variant="default" className="text-xs">
                        Free
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Get competitive repair quotes
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* My Quotes */}
              <Link
                href="/quotations"
                aria-label={`View my quotes. ${stats.receivedQuotes === 0 && stats.pendingQuotes === 0 && stats.acceptedQuotes === 0 ? "No quotes yet" : `${stats.receivedQuotes} received, ${stats.pendingQuotes} pending, ${stats.acceptedQuotes} accepted`}`}
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      My Quotes
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats.receivedQuotes === 0 &&
                    stats.pendingQuotes === 0 &&
                    stats.acceptedQuotes === 0 ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-muted-foreground">
                          —
                        </div>
                        <p className="text-xs text-primary font-medium">
                          Request your first quote!
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {formatNumber(stats.receivedQuotes)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatNumber(stats.pendingQuotes)} pending ·{" "}
                          {formatNumber(stats.acceptedQuotes)} accepted
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>

              {/* Register Car */}
              <Link href="/cars/register" aria-label="Register a new vehicle">
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      Register Car
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <Plus className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Add a new vehicle
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* My Cars */}
              <Link
                href="/cars"
                aria-label={`View my registered vehicles. ${isLoading ? "Loading" : stats.carCount === 0 ? "No cars registered yet" : `${stats.carCount} cars registered`}`}
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      My Cars
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <Car className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ) : stats.carCount === 0 ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-muted-foreground">
                          —
                        </div>
                        <p className="text-xs text-primary font-medium">
                          Add your first car!
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {formatNumber(stats.carCount)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Vehicles registered
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </PageGrid>

            {/* Customer Activity Overview */}
            <div className="border-b border-border my-8" />
            <PageSection>
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                  My Activity Overview
                </h2>
                <p className="text-muted-foreground">
                  Track your service requests and completed jobs
                </p>
              </div>

              {/* Main Activity Stats */}
              <PageGrid cols={{ sm: 1, md: 2, lg: 4 }}>
                <Link
                  href="/quotations"
                  aria-label={`View all quotes. ${stats.totalQuotes} total quotes`}
                >
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Total Quotes
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <FileText className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(stats.totalQuotes)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        All quote requests
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link
                  href="/appointments"
                  aria-label={`View upcoming appointments. ${stats.customerUpcomingAppointments} upcoming appointments`}
                >
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Upcoming Appointments
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {formatNumber(stats.customerUpcomingAppointments)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Scheduled services
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link
                  href="/appointments"
                  aria-label={`View in progress services. ${stats.customerInProgressAppointments} services in progress`}
                >
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        In Progress
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {formatNumber(stats.customerInProgressAppointments)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Currently being serviced
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link
                  href="/completed-jobs"
                  aria-label={`View completed jobs. ${stats.customerCompletedJobs} jobs completed`}
                >
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Completed Jobs
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatNumber(stats.customerCompletedJobs)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Services completed
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </PageGrid>

              {/* Additional Customer Stats */}
              <PageGrid cols={{ sm: 1, md: 2 }} className="mt-6">
                <Link
                  href="/completed-jobs"
                  aria-label={`View spending summary. ${stats.customerTotalSpent === 0 ? "No spending yet" : `Total spent ${formatCurrency(stats.customerTotalSpent)}`}`}
                >
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Total Spent
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {stats.customerTotalSpent === 0 ? (
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-muted-foreground">
                            AED —
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            No completed jobs yet
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(stats.customerTotalSpent)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            From completed services
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>

                <Link
                  href="/cars"
                  aria-label={`View my vehicles. ${stats.carCount} vehicles registered`}
                >
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        My Vehicles
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <Car className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {stats.carCount === 0 ? (
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-muted-foreground">
                            —
                          </div>
                          <p className="text-xs text-primary font-medium mt-2">
                            Register your first car!
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="text-2xl font-bold">
                            {formatNumber(stats.carCount)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Registered vehicles
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </PageGrid>
            </PageSection>
          </>
        )}

        {/* Workshop Quick Stats & Actions */}
        {isWorkshop && (
          <>
            <div className="border-b border-border mb-6" />
            <PageGrid cols={{ sm: 1, md: 2, lg: 4 }}>
              {/* Quote Requests - Primary CTA */}
              <Link
                href="/quotes"
                aria-label={`View quote requests. ${formatNumber(stats.quoteRequests)} new opportunities available`}
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      Quote Requests
                    </CardTitle>
                    <div
                      className="relative p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <Sparkles className="h-2 w-2 absolute -top-0.5 -right-0.5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold">
                        {formatNumber(stats.quoteRequests)}
                      </div>
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      New opportunities available
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Submitted Quotes */}
              <Link
                href="/quotes?tab=submitted"
                aria-label={`View submitted quotes. ${formatNumber(stats.submittedQuotes)} awaiting customer response`}
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      Submitted Quotes
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(stats.submittedQuotes)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Awaiting customer response
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Won Quotes */}
              <Link
                href="/quotes?tab=accepted"
                aria-label={`View won quotes. ${formatNumber(stats.wonQuotes)} accepted this month`}
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      Won Quotes
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(stats.wonQuotes)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Accepted this month
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Completed Jobs */}
              <Link
                href="/completed-jobs"
                aria-label={`View completed jobs. ${formatNumber(stats.completedJobs)} total jobs completed`}
              >
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold truncate max-w-full">
                      Completed Jobs
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(stats.completedJobs)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      All time completed
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </PageGrid>

            {/* Additional Stats Row */}
            <PageGrid cols={{ sm: 1, md: 3 }} className="mt-6">
              {/* Revenue */}
              <Link
                href="/completed-jobs"
                aria-label={`View revenue details. ${stats.totalRevenue === 0 ? "No revenue yet" : `Total revenue ${formatCurrency(stats.totalRevenue)} from paid jobs`}`}
              >
                <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Total Revenue
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats.totalRevenue === 0 ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-muted-foreground">
                          AED —
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          No paid jobs yet
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(stats.totalRevenue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          From paid jobs
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>

              {/* Average Rating */}
              <Link
                href="/completed-jobs"
                aria-label={`View customer reviews. ${stats.totalReviews === 0 ? "No ratings yet" : `Average rating ${stats.averageRating.toFixed(1)} stars from ${formatNumber(stats.totalReviews)} reviews`}`}
              >
                <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Average Rating
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {stats.totalReviews === 0 ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-muted-foreground flex items-center gap-1">
                          —
                          <Star
                            className="h-5 w-5 text-muted-foreground/30"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          No ratings yet
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          {stats.averageRating.toFixed(1)}
                          <Star
                            className="h-5 w-5 fill-current"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          from {formatNumber(stats.totalReviews)}{" "}
                          {stats.totalReviews === 1 ? "review" : "reviews"}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>

              {/* Customer Reviews */}
              <Link
                href="/completed-jobs"
                aria-label={`View all customer reviews. ${stats.totalReviews === 0 ? "No reviews yet" : `${formatNumber(stats.totalReviews)} total feedback received`}`}
              >
                <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Customer Reviews
                    </CardTitle>
                    <div
                      className="p-2 rounded-lg border border-border"
                      aria-hidden="true"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(stats.totalReviews)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Total feedback received
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </PageGrid>

            {/* Active Jobs Section */}
            <div className="border-b border-border my-8" />
            <PageSection>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                    Active Jobs
                  </h2>
                  <p className="text-muted-foreground">
                    Monitor your ongoing and upcoming service work
                  </p>
                </div>
                <Link href="/workshop/jobs">
                  <Button variant="outline" size="sm">
                    View All Jobs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              <PageGrid cols={{ sm: 1, md: 3 }}>
                <Link href="/workshop/jobs?tab=in_progress">
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        In Progress
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <PlayCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber(stats.inProgressJobs)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {stats.inProgressJobs === 1
                          ? "Job currently active"
                          : "Jobs currently active"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/workshop/jobs?tab=scheduled">
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Scheduled Today
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatNumber(stats.scheduledToday)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {stats.scheduledToday === 1
                          ? "Job scheduled today"
                          : "Jobs scheduled today"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/workshop/jobs?tab=upcoming">
                  <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold">
                        Upcoming
                      </CardTitle>
                      <div className="p-2 rounded-lg border border-border">
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatNumber(stats.upcomingJobs)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {stats.upcomingJobs === 1
                          ? "Future job scheduled"
                          : "Future jobs scheduled"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </PageGrid>
            </PageSection>
          </>
        )}

        {/* Appointment Management Section for Workshops */}
        {isWorkshop && (
          <>
            <div className="border-b border-border my-8" />
            <PageSection>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
                      Appointment Management
                    </h2>
                    <p className="text-muted-foreground">
                      Manage your scheduled appointments and availability
                    </p>
                  </div>
                  <Link
                    href="/profile?tab=appointments"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <PageGrid cols={{ sm: 1, md: 3 }}>
                <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Today's Schedule
                    </CardTitle>
                    <div className="p-2 rounded-lg border border-border">
                      <CalendarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(stats.todayAppointments)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.todayAppointments === 1
                        ? "Appointment today"
                        : "Appointments today"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Pending Confirmations
                    </CardTitle>
                    <div className="p-2 rounded-lg border border-border">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formatNumber(stats.pendingAppointments)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.pendingAppointments === 1
                        ? "Needs your confirmation"
                        : "Need your confirmation"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="h-full transition-colors hover:border-primary cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      Next 7 Days
                    </CardTitle>
                    <div className="p-2 rounded-lg border border-border">
                      <Clock className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(stats.upcomingAppointments)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.upcomingAppointments === 1
                        ? "Upcoming appointment"
                        : "Upcoming appointments"}
                    </p>
                  </CardContent>
                </Card>
              </PageGrid>

              {/* Appointment Management Features */}
              <PageGrid cols={{ sm: 1, lg: 2 }} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Today's Schedule
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      View and manage today's appointments
                    </p>
                  </CardHeader>
                  <CardContent>
                    {stats.todayAppointments > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                              Active Appointments
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {stats.todayAppointments} scheduled today
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Button className="w-full" variant="outline">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          View Full Schedule
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground">
                          No appointments scheduled for today
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Enjoy your free time!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Pending Actions
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Appointments requiring your attention
                    </p>
                  </CardHeader>
                  <CardContent>
                    {stats.pendingAppointments > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-semibold text-amber-600 dark:text-amber-400">
                              Confirmation Needed
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {stats.pendingAppointments} waiting for
                              confirmation
                            </p>
                          </div>
                          <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <Button className="w-full" variant="outline" asChild>
                          <Link href="/appointments">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review Pending
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-600 dark:text-emerald-400/30" />
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          All caught up!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          No pending confirmations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </PageGrid>
            </PageSection>
          </>
        )}

        {/* Quick Actions */}
        <div className="border-b border-border my-8" />
        <PageSection>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isCustomer
                  ? "Manage your vehicles and repairs"
                  : "Manage your workshop"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCustomer ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Link href="/cars">
                      <Car className="mr-2 h-4 w-4" />
                      View My Cars ({stats.carCount})
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Link href="/quotations">
                      <DollarSign className="mr-2 h-4 w-4" />
                      My Quotes ({stats.receivedQuotes})
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Link href="/workshops">
                      <Users className="mr-2 h-4 w-4" />
                      Find Workshops
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Workshop Profile
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Link href="/quotes?tab=submitted">
                      <Clock className="mr-2 h-4 w-4" />
                      Pending Quotes ({stats.submittedQuotes})
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start min-h-[44px]"
                  >
                    <Link href="/workshop/customers">
                      <Users className="mr-2 h-4 w-4" />
                      Customer Management
                    </Link>
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                className="w-full justify-start min-h-[44px]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      </PageContainer>
    </>
  );
}
