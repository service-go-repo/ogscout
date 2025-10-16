import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}