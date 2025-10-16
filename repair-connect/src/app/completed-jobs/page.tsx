import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import CustomerCompletedJobsComponent from '@/components/completed-jobs/customer-completed-jobs'
import WorkshopCompletedJobsComponent from '@/components/completed-jobs/workshop-completed-jobs'

export const metadata: Metadata = {
  title: 'Completed Jobs - RepairConnect',
  description: 'View your completed jobs'
}

export default async function CompletedJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {session.user.role === 'workshop' ? (
        <WorkshopCompletedJobsComponent />
      ) : (
        <CustomerCompletedJobsComponent />
      )}
    </div>
  )
}
