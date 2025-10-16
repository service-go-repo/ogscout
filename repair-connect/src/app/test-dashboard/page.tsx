'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageContainer, PageHeader, PageGrid, PageSection } from '@/components/layout/page-container'
import {
  Car,
  FileText,
  Settings,
  Plus,
  DollarSign,
  MessageSquare,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Star,
  Sparkles
} from 'lucide-react'

export default function TestDashboardPage() {
  const [viewType, setViewType] = useState<'customer' | 'workshop'>('customer')

  const stats = {
    carCount: 3,
    pendingQuotes: 2,
    receivedQuotes: 5,
    acceptedQuotes: 1,
    quoteRequests: 8,
    submittedQuotes: 12,
    wonQuotes: 4,
    todayAppointments: 3,
    pendingAppointments: 2,
    upcomingAppointments: 7,
    completedJobs: 45,
    totalRevenue: 12500.50,
    averageRating: 4.7,
    totalReviews: 32
  }

  const isCustomer = viewType === 'customer'
  const isWorkshop = viewType === 'workshop'

  return (
    <PageContainer>
      <div className="mb-4 flex gap-4">
        <Button
          variant={isCustomer ? "default" : "outline"}
          onClick={() => setViewType('customer')}
        >
          Customer View
        </Button>
        <Button
          variant={isWorkshop ? "default" : "outline"}
          onClick={() => setViewType('workshop')}
        >
          Workshop View
        </Button>
      </div>

      <PageHeader
        title="Welcome back, Test User!"
        description={
          isCustomer
            ? "Manage your vehicles and get repair quotes from trusted workshops."
            : "Manage your workshop, respond to quote requests, and grow your business."
        }
      />

      {/* Customer Quick Stats & Actions */}
      {isCustomer && (
        <PageGrid cols={{ sm: 1, md: 2, lg: 4 }}>
          {/* Request Quote - Primary CTA */}
          <Link href="/quotations/request">
            <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">Request Quote</CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold">New!</div>
                  <Badge variant="default" className="text-xs">Free</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Get competitive repair quotes
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* My Quotes */}
          <Link href="/quotations">
            <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">My Quotes</CardTitle>
                <div className="p-2 rounded-lg bg-muted">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.receivedQuotes}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.pendingQuotes} pending · {stats.acceptedQuotes} accepted
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Register Car */}
          <Link href="/cars/register">
            <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">Register Car</CardTitle>
                <div className="p-2 rounded-lg bg-muted">
                  <Plus className="h-4 w-4 text-muted-foreground" />
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
          <Link href="/cars">
            <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">My Cars</CardTitle>
                <div className="p-2 rounded-lg bg-muted">
                  <Car className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.carCount}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Vehicles registered
                </p>
              </CardContent>
            </Card>
          </Link>
        </PageGrid>
      )}

        {/* Workshop Quick Stats & Actions */}
        {isWorkshop && (
          <>
          <PageGrid cols={{ sm: 1, md: 2, lg: 4 }}>
            {/* Quote Requests - Primary CTA */}
            <Link href="/quotes">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Quote Requests</CardTitle>
                  <div className="relative p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <Sparkles className="h-2 w-2 text-primary absolute -top-0.5 -right-0.5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold">{stats.quoteRequests}</div>
                    <Badge variant="default" className="text-xs">New</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    New opportunities available
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Submitted Quotes */}
            <Link href="/quotes?tab=submitted">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Submitted Quotes</CardTitle>
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.submittedQuotes}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Awaiting customer response
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Won Quotes */}
            <Link href="/quotes?tab=accepted">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Won Quotes</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.wonQuotes}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted this month
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Completed Jobs */}
            <Link href="/completed-jobs">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Completed Jobs</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.completedJobs}</div>
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
            <Link href="/completed-jobs">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Total Revenue</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <DollarSign className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">AED {stats.totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    From paid jobs
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Average Rating */}
            <Link href="/completed-jobs">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Average Rating</CardTitle>
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.averageRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.totalReviews} reviews
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Customer Reviews */}
            <Link href="/completed-jobs">
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Customer Reviews</CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReviews}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total feedback received
                  </p>
                </CardContent>
              </Card>
            </Link>
          </PageGrid>
          </>
        )}

        {/* Appointment Management Section for Workshops */}
        {isWorkshop && (
          <PageSection className="mt-8">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">Appointment Management</h2>
                  <p className="text-muted-foreground">Manage your scheduled appointments and availability</p>
                </div>
                <Link href="/profile?tab=appointments" className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <PageGrid cols={{ sm: 1, md: 3 }}>
              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Today's Schedule</CardTitle>
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.todayAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Appointments today
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Pending Confirmations</CardTitle>
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">{stats.pendingAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Need your confirmation
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold">Next 7 Days</CardTitle>
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upcoming appointments
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
                  <p className="text-sm text-muted-foreground">View and manage today's appointments</p>
                </CardHeader>
                <CardContent>
                  {stats.todayAppointments > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <div>
                          <p className="font-semibold text-green-600 dark:text-green-500">Active Appointments</p>
                          <p className="text-sm text-muted-foreground">{stats.todayAppointments} scheduled today</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
                      </div>
                      <Button className="w-full" variant="outline">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        View Full Schedule
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">No appointments scheduled for today</p>
                      <p className="text-sm text-muted-foreground/70">Enjoy your free time!</p>
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
                  <p className="text-sm text-muted-foreground">Appointments requiring your attention</p>
                </CardHeader>
                <CardContent>
                  {stats.pendingAppointments > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                        <div>
                          <p className="font-semibold text-orange-600 dark:text-orange-500">Confirmation Needed</p>
                          <p className="text-sm text-muted-foreground">{stats.pendingAppointments} waiting for confirmation</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-500" />
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
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600/30 dark:text-green-500/30" />
                      <p className="text-green-600 dark:text-green-500 font-semibold">All caught up!</p>
                      <p className="text-sm text-muted-foreground">No pending confirmations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </PageGrid>
          </PageSection>
        )}

        {/* Customer Appointment Section */}
        {isCustomer && stats.acceptedQuotes > 0 && (
          <PageSection className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">My Appointments</h2>
              <p className="text-muted-foreground">Track your scheduled service appointments</p>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-lg bg-primary/10 mb-4">
                    <CalendarIcon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    Ready to Schedule?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You have accepted quotes waiting for appointment scheduling.
                  </p>
                  <Button asChild>
                    <Link href="/quotations">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule Appointments
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PageSection>
        )}

        {/* Quick Actions */}
        <PageSection className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isCustomer ? "Manage your vehicles and repairs" : "Manage your workshop"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCustomer ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/cars">
                      <Car className="mr-2 h-4 w-4" />
                      View My Cars ({stats.carCount})
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/quotations">
                      <DollarSign className="mr-2 h-4 w-4" />
                      My Quotes ({stats.receivedQuotes})
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/workshops">
                      <Users className="mr-2 h-4 w-4" />
                      Find Workshops
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Workshop Profile
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/quotes?tab=submitted">
                      <Clock className="mr-2 h-4 w-4" />
                      Pending Quotes ({stats.submittedQuotes})
                    </Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/workshop/customers">
                      <Users className="mr-2 h-4 w-4" />
                      Customer Management
                    </Link>
                  </Button>
                </>
              )}

              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      </PageContainer>
  )
}
