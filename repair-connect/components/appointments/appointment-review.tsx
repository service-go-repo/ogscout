'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, Loader2, CheckCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Review {
  rating: number
  comment: string
  createdAt: string
  customerName: string
}

interface AppointmentReviewProps {
  appointmentId: string
  userRole: 'customer' | 'workshop'
  existingReview?: Review
  workshopName?: string
  onReviewSubmitted?: () => void
}

export default function AppointmentReview({
  appointmentId,
  userRole,
  existingReview,
  workshopName,
  onReviewSubmitted
}: AppointmentReviewProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    if (comment.trim().length < 10) {
      toast.error('Please provide a review with at least 10 characters')
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateType: 'review',
          rating,
          comment: comment.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review submitted successfully!')
        onReviewSubmitted?.()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name: string): string => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Display existing review (for workshop viewing customer reviews)
  if (existingReview && userRole === 'workshop') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Customer Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(existingReview.customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{existingReview.customerName}</div>
              <div className="text-xs text-gray-500">
                {format(new Date(existingReview.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= existingReview.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-lg font-semibold">
              {existingReview.rating}.0
            </span>
          </div>

          {/* Comment */}
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-700">{existingReview.comment}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Display existing review (for customer viewing their own review)
  if (existingReview && userRole === 'customer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= existingReview.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-lg font-semibold">
              {existingReview.rating}.0
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-gray-700">{existingReview.comment}</p>
          </div>

          <div className="text-xs text-gray-500">
            Reviewed on {format(new Date(existingReview.createdAt), 'MMMM dd, yyyy')}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Review form (for customer to submit review)
  if (userRole === 'customer') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            How was your service experience at {workshopName}?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="review-comment" className="text-sm font-medium mb-2 block">
              Your Review <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="review-comment"
              placeholder="Share your experience with this workshop. What did you like? What could be improved?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length} characters (minimum 10)
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitReview}
            disabled={submitting || rating === 0 || comment.trim().length < 10}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Review...
              </>
            ) : (
              <>
                <Star className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Workshop view (no review submitted yet)
  return (
    <Card>
      <CardContent className="p-6 text-center text-gray-500">
        <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm">Customer hasn't submitted a review yet</p>
      </CardContent>
    </Card>
  )
}
