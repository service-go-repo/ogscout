import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AppointmentDashboard from '@/components/appointments/appointment-dashboard'
import CustomerAppointmentsComponent from '@/components/appointments/customer-appointments'

export const metadata: Metadata = {
  title: 'Appointments - RepairConnect',
  description: 'Manage your appointments'
}

export default async function AppointmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {session.user.role === 'workshop' ? (
        <AppointmentDashboard />
      ) : (
        <CustomerAppointmentsComponent />
      )}
    </div>
  )
}
