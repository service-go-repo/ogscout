import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import AppointmentDetailWrapper from '@/components/appointments/appointment-detail-wrapper'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Appointment Details - RepairConnect',
  description: 'View and manage appointment details'
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}

export default async function AppointmentDetailPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Validate ObjectId
  if (!ObjectId.isValid(resolvedParams.id)) {
    notFound()
  }

  // Fetch appointment with role-based filter
  const { db } = await connectToDatabase()
  const filter: any = { _id: new ObjectId(resolvedParams.id) }

  if (session.user.role === 'workshop') {
    filter.workshopId = new ObjectId(session.user.id)
  } else if (session.user.role === 'customer') {
    filter.customerId = new ObjectId(session.user.id)
  }

  const appointment = await db.collection('appointments').findOne(filter)

  if (!appointment) {
    notFound()
  }

  // Serialize appointment data
  const serializedAppointment = {
    ...appointment,
    _id: appointment._id.toString(),
    quotationId: appointment.quotationId.toString(),
    customerId: appointment.customerId.toString(),
    workshopId: appointment.workshopId.toString(),
    scheduledDate: appointment.scheduledDate.toISOString(),
    estimatedCompletionDate: appointment.estimatedCompletionDate?.toISOString(),
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
    reviewDate: appointment.reviewDate?.toISOString(),
    // Serialize statusHistory
    statusHistory: appointment.statusHistory?.map((history: any) => ({
      ...history,
      changedAt: history.changedAt instanceof Date ? history.changedAt.toISOString() : history.changedAt,
      changedBy: history.changedBy?.toString ? history.changedBy.toString() : history.changedBy
    })),
    // Serialize services array
    services: appointment.services?.map((service: any) => ({
      ...service,
      completedAt: service.completedAt instanceof Date ? service.completedAt.toISOString() : service.completedAt,
      startedAt: service.startedAt instanceof Date ? service.startedAt.toISOString() : service.startedAt
    }))
  }

  // Determine back navigation based on 'from' parameter
  const backUrl = resolvedSearchParams.from === 'completed-jobs' ? '/completed-jobs' : '/appointments'
  const backLabel = resolvedSearchParams.from === 'completed-jobs'
    ? 'Completed Jobs'
    : session.user.role === 'workshop' ? 'Appointments' : 'My Appointments'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={backUrl}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {backLabel}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Appointment Details</h1>
        <p className="text-muted-foreground mt-2">
          Appointment #{resolvedParams.id.slice(-8).toUpperCase()}
        </p>
      </div>

      <AppointmentDetailWrapper
        initialAppointment={serializedAppointment as any}
        userRole={session.user.role as 'customer' | 'workshop'}
        appointmentId={resolvedParams.id}
      />
    </div>
  )
}
