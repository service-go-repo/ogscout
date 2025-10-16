import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import ActiveJobsComponent from '@/components/workshop/active-jobs'

export const metadata: Metadata = {
  title: 'Active Jobs - RepairConnect',
  description: 'Manage your active service jobs'
}

export default async function ActiveJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'workshop') {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ActiveJobsComponent />
    </div>
  )
}
