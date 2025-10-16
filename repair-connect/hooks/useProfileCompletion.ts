'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ProfileCompletionStatus {
  isComplete: boolean
  isLoading: boolean
  completionPercentage: number
  missingFields: string[]
  error: string | null
}

export function useProfileCompletion(): ProfileCompletionStatus {
  const { data: session } = useSession()
  const [status, setStatus] = useState<ProfileCompletionStatus>({
    isComplete: false,
    isLoading: true,
    completionPercentage: 0,
    missingFields: [],
    error: null
  })

  useEffect(() => {
    if (!session || session.user.role !== 'workshop') {
      setStatus({
        isComplete: true, // Non-workshop users don't need profile completion
        isLoading: false,
        completionPercentage: 100,
        missingFields: [],
        error: null
      })
      return
    }

    checkProfileCompletion()
  }, [session])

  const checkProfileCompletion = async () => {
    try {
      const response = await fetch('/api/workshops/profile/completion')
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus({
          isComplete: data.data.isComplete,
          isLoading: false,
          completionPercentage: data.data.completionPercentage,
          missingFields: data.data.missingFields,
          error: null
        })
      } else {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Failed to check profile completion'
        }))
      }
    } catch (error) {
      console.error('Error checking profile completion:', error)
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check profile completion'
      }))
    }
  }

  return status
}
