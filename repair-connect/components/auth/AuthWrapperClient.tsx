'use client'

import { ReactNode } from 'react'
import { useAuthStateCleanup } from '@/hooks/useAuthStateCleanup'

/**
 * Client-side wrapper that integrates auth state cleanup
 * Must be used inside AuthProvider (SessionProvider)
 */
export function AuthWrapperClient({ children }: { children: ReactNode }) {
  // Automatically clear state on logout
  useAuthStateCleanup()

  return <>{children}</>
}
