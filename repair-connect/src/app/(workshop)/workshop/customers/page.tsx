import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import CustomersComponent from '@/components/workshop/customers'

export const metadata: Metadata = {
  title: 'Customers - RepairConnect',
  description: 'Manage your workshop customers'
}

export default async function CustomersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'workshop') {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CustomersComponent />
    </div>
  )
}
