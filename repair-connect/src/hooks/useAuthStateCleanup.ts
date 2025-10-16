'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuoteRequestStore } from '@/stores/quoteRequestStore'

/**
 * Hook to automatically clear application state when user logs out
 *
 * This hook listens to NextAuth session changes and clears:
 * - Selected car
 * - Sent quotes history
 * - LocalStorage persistence
 *
 * @example
 * function MyApp() {
 *   useAuthStateCleanup() // Call at root level
 *   return <App />
 * }
 */
export function useAuthStateCleanup() {
  const { status } = useSession()
  const clearAllState = useQuoteRequestStore((state) => state.clearAllState)

  // Track previous status to detect transitions
  const prevStatusRef = useRef<typeof status>(status)

  useEffect(() => {
    const prevStatus = prevStatusRef.current

    // Detect transition from authenticated to unauthenticated
    if (prevStatus === 'authenticated' && status === 'unauthenticated') {
      console.log('[AuthStateCleanup] User logged out, clearing all state')
      clearAllState()
    }

    // Update ref for next render
    prevStatusRef.current = status
  }, [status, clearAllState])
}
