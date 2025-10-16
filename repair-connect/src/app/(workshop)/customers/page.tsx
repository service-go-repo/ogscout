import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import CustomerManagementComponent from '@/components/workshop/customer-management'

export const metadata: Metadata = {
  title: 'Customer Management - RepairConnect',
  description: 'Manage your customers and their service history'
}

export default async function CustomerManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'workshop') {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto py-6">
      <CustomerManagementComponent />
    </div>
  )
}
