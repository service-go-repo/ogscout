'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppointmentDetail from './appointment-detail'
import { Appointment } from '@/models/Appointment'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AppointmentDetailWrapperProps {
  initialAppointment: Appointment
  userRole: 'customer' | 'workshop'
  appointmentId: string
}

export default function AppointmentDetailWrapper({
  initialAppointment,
  userRole,
  appointmentId
}: AppointmentDetailWrapperProps) {
  const [appointment, setAppointment] = useState<Appointment>(initialAppointment)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const refreshAppointment = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/appointments/${appointmentId}`)
      const data = await response.json()

      if (data.success && data.appointment) {
        setAppointment(data.appointment)
      } else {
        toast.error('Failed to refresh appointment data')
      }
    } catch (error) {
      console.error('Error refreshing appointment:', error)
      toast.error('Failed to refresh appointment data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    await refreshAppointment()
    // Also refresh the router cache for the page
    router.refresh()
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-center gap-2 mb-4 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-600">Updating appointment...</span>
        </div>
      )}
      <AppointmentDetail
        appointment={appointment}
        userRole={userRole}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  )
}
