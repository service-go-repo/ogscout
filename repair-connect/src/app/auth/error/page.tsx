'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const errors = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errors

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-2 dark:bg-background-5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[var(--ns-red)]/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-[var(--ns-red)]" />
          </div>
          <CardTitle className="text-[var(--ns-red)]">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-secondary/60 dark:text-accent/60 text-center">
            {errors[error] || errors.Default}
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/auth/login">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-2 dark:bg-background-5">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}