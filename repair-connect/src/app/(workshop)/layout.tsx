import { ProfileCompletionGuard } from '@/components/workshops/ProfileCompletionGuard'

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileCompletionGuard
      allowedPaths={['/profile', '/auth/logout', '/migration-demo']}
      redirectTo="/profile"
    >
      {children}
    </ProfileCompletionGuard>
  )
}
