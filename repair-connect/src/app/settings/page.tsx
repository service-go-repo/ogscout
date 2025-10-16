'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  User,
  Lock,
  Bell,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Shield,
} from 'lucide-react'
import { toast } from 'sonner'

// Validation schemas
const customerProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  avatar: z.string().url().optional().or(z.literal('')),
})

const workshopOwnerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  avatar: z.string().url().optional().or(z.literal('')),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof customerProfileSchema>
type OwnerForm = z.infer<typeof workshopOwnerSchema>
type PasswordForm = z.infer<typeof passwordSchema>

interface UserProfile {
  email: string
  role: 'customer' | 'workshop'
  profile?: {
    firstName: string
    lastName: string
    phone: string
    avatar?: string
  }
  ownerInfo?: {
    firstName: string
    lastName: string
    phone: string
    avatar?: string
  }
  preferences?: {
    notifications: {
      email: boolean
      sms: boolean
      push: boolean
    }
    preferredContactMethod: 'email' | 'phone' | 'sms'
  }
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Notification preferences state (customer only)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [preferredContactMethod, setPreferredContactMethod] = useState<'email' | 'phone' | 'sms'>('email')

  const isCustomer = session?.user?.role === 'customer'
  const isWorkshop = session?.user?.role === 'workshop'

  // Form instances
  const customerForm = useForm<ProfileForm>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      avatar: '',
    },
  })

  const workshopForm = useForm<OwnerForm>({
    resolver: zodResolver(workshopOwnerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      avatar: '',
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    loadUserProfile()
  }, [session, status, router])

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (data.success && data.data) {
        setUserProfile(data.data)

        // Populate forms based on role
        if (data.data.role === 'customer' && data.data.profile) {
          customerForm.reset({
            firstName: data.data.profile.firstName,
            lastName: data.data.profile.lastName,
            phone: data.data.profile.phone,
            avatar: data.data.profile.avatar || '',
          })

          // Set notification preferences
          setEmailNotifications(data.data.preferences?.notifications?.email ?? true)
          setSmsNotifications(data.data.preferences?.notifications?.sms ?? false)
          setPushNotifications(data.data.preferences?.notifications?.push ?? true)
          setPreferredContactMethod(data.data.preferences?.preferredContactMethod || 'email')
        } else if (data.data.role === 'workshop' && data.data.ownerInfo) {
          workshopForm.reset({
            firstName: data.data.ownerInfo.firstName,
            lastName: data.data.ownerInfo.lastName,
            phone: data.data.ownerInfo.phone,
            avatar: data.data.ownerInfo.avatar || '',
          })
        }
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const saveCustomerProfile = async (data: ProfileForm) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatar: data.avatar,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUserProfile(result.data)
        setSaveMessage({
          type: 'success',
          message: 'Profile updated successfully!',
        })
        toast.success('Profile updated successfully!')
      } else {
        setSaveMessage({
          type: 'error',
          message: result.error || 'Failed to update profile',
        })
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveMessage({
        type: 'error',
        message: 'An error occurred while saving',
      })
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const saveWorkshopOwner = async (data: OwnerForm) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatar: data.avatar,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUserProfile(result.data)
        setSaveMessage({
          type: 'success',
          message: 'Owner information updated successfully!',
        })
        toast.success('Owner information updated successfully!')
      } else {
        setSaveMessage({
          type: 'error',
          message: result.error || 'Failed to update owner information',
        })
        toast.error(result.error || 'Failed to update owner information')
      }
    } catch (error) {
      console.error('Error saving owner information:', error)
      setSaveMessage({
        type: 'error',
        message: 'An error occurred while saving',
      })
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const savePreferences = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            notifications: {
              email: emailNotifications,
              sms: smsNotifications,
              push: pushNotifications,
            },
            preferredContactMethod,
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setUserProfile(result.data)
        setSaveMessage({
          type: 'success',
          message: 'Preferences updated successfully!',
        })
        toast.success('Preferences updated successfully!')
      } else {
        setSaveMessage({
          type: 'error',
          message: result.error || 'Failed to update preferences',
        })
        toast.error(result.error || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      setSaveMessage({
        type: 'error',
        message: 'An error occurred while saving',
      })
      toast.error('An error occurred while saving')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const changePassword = async (data: PasswordForm) => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSaveMessage({
          type: 'success',
          message: 'Password changed successfully!',
        })
        toast.success('Password changed successfully!')
        passwordForm.reset()
      } else {
        setSaveMessage({
          type: 'error',
          message: result.error || 'Failed to change password',
        })
        toast.error(result.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setSaveMessage({
        type: 'error',
        message: 'An error occurred while changing password',
      })
      toast.error('An error occurred while changing password')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          {isCustomer
            ? 'Manage your profile, password, and preferences'
            : 'Manage your account information and security'}
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {saveMessage.message}
        </div>
      )}

      {/* Pill Tabs Navigation */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background text-foreground border border-border hover:bg-accent'
            }`}
          >
            <User className="w-4 h-4" />
            {isCustomer ? 'Profile' : 'Account'}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-background text-foreground border border-border hover:bg-accent'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security
          </button>
          {isCustomer && (
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'preferences'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-foreground border border-border hover:bg-accent'
              }`}
            >
              <Bell className="w-4 h-4" />
              Preferences
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile/Account Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isCustomer ? 'Personal Information' : 'Owner Information'}
              </CardTitle>
              <CardDescription>
                {isCustomer
                  ? 'Update your personal details and contact information'
                  : 'Update your personal contact details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={
                  isCustomer
                    ? customerForm.handleSubmit(saveCustomerProfile)
                    : workshopForm.handleSubmit(saveWorkshopOwner)
                }
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...(isCustomer
                        ? customerForm.register('firstName')
                        : workshopForm.register('firstName'))}
                      placeholder="John"
                    />
                    {((isCustomer && customerForm.formState.errors.firstName) ||
                      (isWorkshop && workshopForm.formState.errors.firstName)) && (
                      <p className="text-sm text-destructive mt-1">
                        {isCustomer
                          ? customerForm.formState.errors.firstName?.message
                          : workshopForm.formState.errors.firstName?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...(isCustomer
                        ? customerForm.register('lastName')
                        : workshopForm.register('lastName'))}
                      placeholder="Doe"
                    />
                    {((isCustomer && customerForm.formState.errors.lastName) ||
                      (isWorkshop && workshopForm.formState.errors.lastName)) && (
                      <p className="text-sm text-destructive mt-1">
                        {isCustomer
                          ? customerForm.formState.errors.lastName?.message
                          : workshopForm.formState.errors.lastName?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...(isCustomer
                      ? customerForm.register('phone')
                      : workshopForm.register('phone'))}
                    placeholder="+971 50 123 4567"
                  />
                  {((isCustomer && customerForm.formState.errors.phone) ||
                    (isWorkshop && workshopForm.formState.errors.phone)) && (
                    <p className="text-sm text-destructive mt-1">
                      {isCustomer
                        ? customerForm.formState.errors.phone?.message
                        : workshopForm.formState.errors.phone?.message}
                    </p>
                  )}
                </div>

                {isWorkshop && (
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> To update your workshop business information,
                      please visit the{' '}
                      <a href="/profile" className="text-primary hover:underline">
                        Workshop Profile
                      </a>{' '}
                      page.
                    </p>
                  </div>
                )}

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isCustomer ? 'Save Profile' : 'Save Account Information'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(changePassword)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="currentPassword">Current Password *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    placeholder="Enter current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                    placeholder="Enter new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    placeholder="Confirm new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Preferences Tab (Customer Only) */}
        {activeTab === 'preferences' && isCustomer && (
          <div className="space-y-6">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <CardDescription>
                  Choose your preferred method of contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <Select
                    value={preferredContactMethod}
                    onValueChange={(value: 'email' | 'phone' | 'sms') =>
                      setPreferredContactMethod(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Workshops will use this method to contact you
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={savePreferences} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
