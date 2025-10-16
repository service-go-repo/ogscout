'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Bell, 
  X, 
  Clock,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface QuoteNotification {
  id: string
  quotationId: string
  customerName: string
  vehicleInfo: string
  quoteStatus: 'accepted' | 'declined'
  quoteAmount?: number
  timestamp: Date
  read: boolean
}

interface QuoteNotificationsProps {
  workshopId: string
}

export default function QuoteNotifications({ workshopId }: QuoteNotificationsProps) {
  const [notifications, setNotifications] = useState<QuoteNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [workshopId])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/workshops/notifications')
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/workshops/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    markAsRead(notificationId)
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications
    .filter(n => new Date(n.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
    .slice(0, 5)

  if (loading) return null

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNotifications(!showNotifications)}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-1 min-w-[16px] h-4">
              {unreadCount}
            </Badge>
          )}
        </Button>
        
        {/* Notification Dropdown */}
        {showNotifications && (
          <Card className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-20 sm:top-full mt-0 sm:mt-2 sm:w-80 max-h-96 overflow-y-auto z-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm sm:text-base">Recent Notifications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {recentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No recent notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onDismiss={() => dismissNotification(notification.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Banner for very recent notifications (last 5 minutes) */}
      {notifications
        .filter(n => !n.read && new Date(n.timestamp) > new Date(Date.now() - 5 * 60 * 1000))
        .map(notification => (
          <NotificationBanner
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
    </>
  )
}

interface NotificationCardProps {
  notification: QuoteNotification
  onDismiss: () => void
}

function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const getStatusIcon = () => {
    switch (notification.quoteStatus) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (notification.quoteStatus) {
      case 'accepted':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'declined':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()} ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon()}
            <span className="font-medium text-sm">
              Quote {notification.quoteStatus}
            </span>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          <p className="text-sm mb-1">
            <strong>{notification.customerName || 'A customer'}</strong> has {notification.quoteStatus} your quote
            for their <strong>{notification.vehicleInfo}</strong>
          </p>
          
          {notification.quoteAmount && notification.quoteStatus === 'accepted' && (
            <div className="flex items-center gap-1 text-sm font-medium text-green-700">
              <DollarSign className="h-3 w-3" />
              AED {notification.quoteAmount.toLocaleString()}
            </div>
          )}
          
          <p className="text-xs text-gray-600 mt-1">
            {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 ml-2"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface NotificationBannerProps {
  notification: QuoteNotification
  onDismiss: () => void
}

function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
  useEffect(() => {
    // Show toast notification
    const customerName = notification.customerName || 'A customer'
    const message = `${customerName} has ${notification.quoteStatus} your quote for ${notification.vehicleInfo}`
    
    if (notification.quoteStatus === 'accepted') {
      toast.success(message, {
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/quotes/${notification.quotationId}`
        }
      })
    } else {
      toast.info(message, {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/quotes/${notification.quotationId}`
        }
      })
    }
    
    // Auto-dismiss after 30 seconds
    const timeout = setTimeout(onDismiss, 30000)
    return () => clearTimeout(timeout)
  }, [notification, onDismiss])

  return null // We're using toast instead of banner
}